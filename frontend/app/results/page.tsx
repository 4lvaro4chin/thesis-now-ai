'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuthProtection } from '@/lib/useAuthProtection';
import { useTranslation } from '@/lib/useTranslation';
import { useSavedPublications } from '@/lib/useSavedPublications';
import { useTracking } from '@/lib/useTracking';
import { StarRating } from '@/components/ui/StarRating';
import { BooleanTag } from '@/components/ui/BooleanTag';
import { Button } from '@/components/ui/Button';
import type { SearchResult } from '@/lib/useSearch';

export default function ResultsPage() {
  useAuthProtection();
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const { track } = useTracking();
  const [isMobile, setIsMobile] = useState(false);

  // Export to Excel
  const exportToExcel = async (jobId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/report/${jobId}/excel`);
      if (!response.ok) {
        alert('Error al descargar Excel');
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `resultados.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert('Error al exportar resultados');
    }
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const [results, setResults] = useState<SearchResult[]>([]);
  const [booleanQuery, setBooleanQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedAbstracts, setExpandedAbstracts] = useState<Set<string>>(new Set());
  const [loadingProgress, setLoadingProgress] = useState(0); // 0-100
  const [thesisTitle, setThesisTitle] = useState<string>('');
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [modalArticle, setModalArticle] = useState<SearchResult | null>(null);
  const [modalRating, setModalRating] = useState(0);
  const [sortBy, setSortBy] = useState<'relevance' | 'citations' | 'year' | 'title'>('relevance');
  const [explanation, setExplanation] = useState<string>('');
  const [collapsedSources, setCollapsedSources] = useState<Set<string>>(new Set());
  const [scoreFilters, setScoreFilters] = useState<Set<'high' | 'mid' | 'low'>>(
    new Set(['high', 'mid'])
  );

  const { getSavedIds: fetchSavedIds, savePublication, removePublication } = useSavedPublications();

  const toggleSourceCollapse = (source: string) => {
    const newCollapsed = new Set(collapsedSources);
    if (newCollapsed.has(source)) {
      newCollapsed.delete(source);
    } else {
      newCollapsed.add(source);
    }
    setCollapsedSources(newCollapsed);
  };
  const jobId = searchParams.get('job_id');

  useEffect(() => {
    if (!jobId) {
      setError('No search job found');
      setLoading(false);
      return;
    }

    // Simulate progressive loading
    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 30;
      });
    }, 300);

    // Load from sessionStorage or fetch from backend
    const cached = sessionStorage.getItem(`search_${jobId}`);
    const loadAndPrepare = (data: any) => {
      const title = data.title || '';
      const results = data.results || [];
      setThesisTitle(title);
      setResults(results);
      setBooleanQuery(data.boolean_query || '');
      setExplanation(data.explanation || '');

      // Load saved IDs for this thesis
      if (title) {
        fetchSavedIds(title).then(setSavedIds);
      }
      setLoading(false);

      // Track search completion
      track('search_completed', {
        job_id: jobId,
        thesis_title: title,
        results_count: results.length,
        sources: Array.from(
          new Set(results.map((r: any) => r.source || 'unknown'))
        ),
      });
    };

    if (cached) {
      try {
        const data = JSON.parse(cached);
        setLoadingProgress(100);
        setTimeout(() => {
          loadAndPrepare(data);
        }, 300);
      } catch {
        setError('Failed to parse search results');
        setLoading(false);
      }
    } else {
      // Fallback: fetch from backend
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/search/${jobId}`)
        .then((res) => res.json())
        .then((data) => {
          setLoadingProgress(100);
          setTimeout(() => {
            loadAndPrepare(data);
          }, 300);
        })
        .catch((err) => {
          setError(err.message || 'Failed to fetch results');
          setLoading(false);
        });
    }

    return () => clearInterval(progressInterval);
  }, [jobId, fetchSavedIds]);

  // Helper functions for scoring and filtering
  const getRelevanceColor = (score: number) => {
    if (score >= 0.8) return { bg: 'var(--green-100)', text: '#0F6E56' };
    if (score >= 0.5) return { bg: '#EBF4FD', text: '#1B6FA8' };
    return { bg: '#FEF0EC', text: '#A33820' };
  };

  const getScoreBand = (score: number): 'high' | 'mid' | 'low' => {
    if (score >= 0.8) return 'high';
    if (score >= 0.5) return 'mid';
    return 'low';
  };

  const toggleScoreFilter = (band: 'high' | 'mid' | 'low') => {
    const next = new Set(scoreFilters);
    next.has(band) ? next.delete(band) : next.add(band);
    setScoreFilters(next);
  };

  const filteredResults = results.filter((r) =>
    scoreFilters.has(getScoreBand((r as any).similarity_score !== undefined ? (r as any).similarity_score : r.relevance_score))
  );

  const groupedResults = filteredResults.reduce(
    (acc, result) => {
      const source = result.source || 'unknown';
      if (!acc[source]) acc[source] = [];
      acc[source].push(result);
      return acc;
    },
    {} as Record<string, SearchResult[]>
  );

  // Expose export function to window for Navbar access
  useEffect(() => {
    (window as any).thesisNowExportExcel = () => {
      if (jobId) {
        exportToExcel(jobId);
      }
    };
    return () => {
      delete (window as any).thesisNowExportExcel;
    };
  }, [jobId, exportToExcel]);

  const getSourceLabel = (source: string): string => {
    const labels: Record<string, string> = {
      pubmed: 'PubMed',
      semantic_scholar: 'Semantic Scholar',
      arxiv: 'arXiv',
      doaj: 'DOAJ',
      alicia: 'ALICIA',
      sciencedirect: 'ScienceDirect',
    };
    return labels[source] || source;
  };

  const getSourceBadge = (source: string) => {
    const sources: Record<string, { label: string; bg: string; color: string; emoji: string }> = {
      pubmed: { label: 'PubMed', bg: '#FEF3E2', color: '#B45309', emoji: '🔬' },
      semantic_scholar: { label: 'Semantic Scholar', bg: '#E0F2FE', color: '#0369A1', emoji: '📚' },
      arxiv: { label: 'arXiv', bg: '#F3E8FF', color: '#6D28D9', emoji: '📄' },
      sciencedirect: { label: 'ScienceDirect', bg: '#FECDD3', color: '#BE1238', emoji: '📖' },
      alicia: { label: 'ALICIA', bg: '#CFFAFE', color: '#0E7490', emoji: '🇵🇪' },
    };
    return sources[source] || { label: source, bg: '#E5E7EB', color: '#374151', emoji: '📑' };
  };

  const toggleAbstract = (key: string) => {
    const newExpanded = new Set(expandedAbstracts);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedAbstracts(newExpanded);
  };

  const extractKeywords = (query: string): string[] => {
    // Remove boolean operators, parentheses, quotes, and wildcards
    const cleaned = query
      .replace(/\(|\)/g, ' ')
      .replace(/\bAND\b|\bOR\b|\bNOT\b/gi, ' ')
      .replace(/"/g, '')     // Remove quote marks from phrases
      .replace(/\*/g, '')    // Remove truncation wildcards
      .trim();

    const terms = cleaned
      .split(/\s+/)
      .filter((t) => t.length > 2) // Only words > 2 chars
      .map((t) => t.toLowerCase())
      .filter((v, i, a) => a.indexOf(v) === i); // Unique

    return terms;
  };

  const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const highlightKeywords = (text: string, keywords: string[]) => {
    if (!text || keywords.length === 0) return text;

    let result = text;
    keywords.forEach((keyword) => {
      const regex = new RegExp(`(${escapeRegex(keyword)})`, 'gi');
      result = result.replace(regex, '<mark>$1</mark>');
    });

    return result;
  };

  type TokenType = 'AND' | 'OR' | 'NOT' | 'TRUNC' | 'term' | 'paren';
  const parseBooleanQuery = (query: string): { type: TokenType; value: string }[] => {
    const tokens: { type: TokenType; value: string }[] = [];
    const re = /\(|\)|"[^"]*"|[^\s()]+/g;
    for (const match of query.matchAll(re)) {
      const s = match[0];
      if (s === '(' || s === ')') {
        tokens.push({ type: 'paren', value: s });
      } else if (/^AND$/i.test(s)) {
        tokens.push({ type: 'AND', value: 'AND' });
      } else if (/^OR$/i.test(s)) {
        tokens.push({ type: 'OR', value: 'OR' });
      } else if (/^NOT$/i.test(s)) {
        tokens.push({ type: 'NOT', value: 'NOT' });
      } else if (s.includes('*')) {
        tokens.push({ type: 'TRUNC', value: s });
      } else {
        tokens.push({ type: 'term', value: s.replace(/^"|"$/g, '') });
      }
    }
    return tokens;
  };

  const handleSaveClick = (article: SearchResult) => {
    setModalArticle(article);
    setModalRating(0);
    setModalOpen(true);
  };

  const handleConfirmSave = async () => {
    if (!modalArticle || !thesisTitle) return;

    try {
      await savePublication({
        ...modalArticle,
        thesis_title: thesisTitle,
        star_rating: modalRating || 1,
      });

      const newSavedIds = new Set(savedIds);
      if (modalArticle.doi) newSavedIds.add(modalArticle.doi);
      if (modalArticle.url) newSavedIds.add(modalArticle.url);
      setSavedIds(newSavedIds);

      track('article_saved', {
        doi: modalArticle.doi,
        source: modalArticle.source,
        rating: modalRating || 1,
      });

      setModalOpen(false);
      setModalArticle(null);
      setModalRating(0);
    } catch (err) {
      console.error('Failed to save publication:', err);
    }
  };

  const handleRemoveSave = async (article: SearchResult) => {
    if (!thesisTitle) return;

    const id = savedIds.has(article.doi || '') ? article.doi : article.url;
    if (!id) return;

    try {
      // Get the database ID from Supabase
      const { supabase } = require('@/lib/supabase');
      const client = supabase.createClient();
      const { data, error } = await client
        .from('saved_publications')
        .select('id')
        .eq('thesis_title', thesisTitle)
        .eq(article.doi ? 'doi' : 'url', id)
        .limit(1)
        .single();

      if (error || !data) throw new Error('Publication not found');

      await removePublication(data.id);

      const newSavedIds = new Set(savedIds);
      if (article.doi) newSavedIds.delete(article.doi);
      if (article.url) newSavedIds.delete(article.url);
      setSavedIds(newSavedIds);

      track('article_removed', {
        doi: article.doi,
        source: article.source,
      });
    } catch (err) {
      console.error('Failed to remove publication:', err);
    }
  };

  const isSaved = (article: SearchResult): boolean => {
    return (article.doi && savedIds.has(article.doi)) || (article.url && savedIds.has(article.url)) || false;
  };

  const sortResults = (items: SearchResult[]): SearchResult[] => {
    const sorted = [...items];
    switch (sortBy) {
      case 'relevance':
        return sorted.sort((a, b) => {
          const bScore = (b as any).similarity_score !== undefined ? (b as any).similarity_score : b.relevance_score;
          const aScore = (a as any).similarity_score !== undefined ? (a as any).similarity_score : a.relevance_score;
          return (bScore || 0) - (aScore || 0);
        });
      case 'citations':
        return sorted.sort((a, b) => (b.citation_count || 0) - (a.citation_count || 0));
      case 'year':
        return sorted.sort((a, b) => (b.year || 0) - (a.year || 0));
      case 'title':
        return sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      default:
        return sorted;
    }
  };

  const getSortLabel = (): string => {
    switch (sortBy) {
      case 'relevance':
        return t('results.sort.relevance');
      case 'citations':
        return t('results.sort.citations');
      case 'year':
        return t('results.sort.yearRecent');
      case 'title':
        return t('results.sort.titleAZ');
      default:
        return t('results.sortBy');
    }
  };

  const SkeletonCard = () => (
    <div
      style={{
        border: '1px solid #E8EDEB',
        borderRadius: '8px',
        padding: '20px',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }}
    >
      <div style={{ height: '20px', background: '#E8EDEB', borderRadius: '4px', marginBottom: '12px' }} />
      <div style={{ height: '14px', background: '#E8EDEB', borderRadius: '4px', marginBottom: '12px' }} />
      <div style={{ height: '14px', background: '#E8EDEB', borderRadius: '4px', marginBottom: '12px', width: '80%' }} />
      <div style={{ height: '60px', background: '#E8EDEB', borderRadius: '4px', marginBottom: '12px' }} />
      <div style={{ display: 'flex', gap: '8px' }}>
        <div style={{ height: '24px', width: '80px', background: '#E8EDEB', borderRadius: '4px' }} />
        <div style={{ height: '24px', width: '100px', background: '#E8EDEB', borderRadius: '4px' }} />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#FFFFFF', paddingTop: '72px', paddingBottom: '100px' }}>
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          @keyframes slideIn {
            from { transform: scaleX(0); }
            to { transform: scaleX(1); }
          }
        `}</style>

        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 48px' }}>
          {/* Progress Bar */}
          <div style={{ marginBottom: '48px' }}>
            <div
              style={{
                height: '4px',
                background: '#E8EDEB',
                borderRadius: '2px',
                overflow: 'hidden',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #1D9E75, #0F6E56)',
                  width: `${loadingProgress}%`,
                  transition: 'width 0.3s ease-out',
                  transformOrigin: 'left',
                }}
              />
            </div>
            <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
              Cargando resultados... {Math.round(loadingProgress)}%
            </p>
          </div>

          {/* Skeleton Cards */}
          <div style={{ marginBottom: '48px' }}>
            <h2 style={{
              fontSize: '16px',
              fontWeight: 600,
              color: '#1B2A4A',
              marginBottom: '16px',
              paddingBottom: '12px',
              borderBottom: '2px solid #E8EDEB',
            }}>
              PubMed
            </h2>
            <div style={{ display: 'grid', gap: '16px' }}>
              {[1, 2, 3].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '48px' }}>
            <h2 style={{
              fontSize: '16px',
              fontWeight: 600,
              color: '#1B2A4A',
              marginBottom: '16px',
              paddingBottom: '12px',
              borderBottom: '2px solid #E8EDEB',
            }}>
              Semantic Scholar
            </h2>
            <div style={{ display: 'grid', gap: '16px' }}>
              {[1, 2].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', paddingTop: '72px', paddingBottom: '100px' }}>
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .fade-in {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 48px' }}>
        {error ? (
          <div style={{ textAlign: 'center', paddingTop: '48px' }}>
            <h2 style={{ color: 'var(--error)', marginBottom: '16px' }}>Error</h2>
            <p style={{ color: '#6B7280', marginBottom: '24px' }}>{error}</p>
            <Link href="/search">
              <Button variant="primary" size="md">
                Back to Search
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Back Button */}
            <Link
              href={`/search?initialTitle=${encodeURIComponent(thesisTitle)}&booleanQuery=${encodeURIComponent(booleanQuery)}&step=2`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                color: '#1D9E75',
                textDecoration: 'none',
                fontWeight: 500,
                marginBottom: '24px',
                cursor: 'pointer',
              }}
            >
              ← {t('results.back') || 'Back to Search'}
            </Link>

            {/* Thesis Title Header */}
            {thesisTitle && (
              <div style={{
                background: '#F9FAFB',
                borderBottom: '1px solid var(--border)',
                marginLeft: '-48px',
                marginRight: '-48px',
                padding: '16px 48px',
                marginBottom: '40px',
              }}>
                <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.08em', margin: 0 }}>
                  {t('search.step2.label')}
                </p>
                <h2 style={{
                  fontSize: 'clamp(18px, 2vw, 24px)',
                  fontWeight: 600,
                  color: 'var(--navy)',
                  lineHeight: 1.4,
                  margin: 0,
                  wordBreak: 'break-word',
                }}>
                  {thesisTitle}
                </h2>
              </div>
            )}

            {/* Header */}
            <div className="fade-in" style={{ marginBottom: '48px' }}>
              <h1 style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 'clamp(26px, 3vw, 34px)',
                fontWeight: 600,
                color: '#1B2A4A',
                letterSpacing: '-0.7px',
                lineHeight: 1.2,
                marginBottom: '8px',
              }}>
                {t('results.title')}
              </h1>
              <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '16px' }}>
                {t('results.subtitle')} <span style={{ fontWeight: 600, color: '#1B2A4A' }}>{filteredResults.length}</span> {t('results.articles')}
              </p>
              {booleanQuery && (
                <div className="bg-green-50 border border-green-100 rounded-lg px-4 py-3 mb-4 flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-semibold text-green-700 mr-1">Query:</span>
                  {parseBooleanQuery(booleanQuery).map((token, i) => (
                    <BooleanTag key={i} type={token.type} value={token.value} />
                  ))}
                </div>
              )}

              {explanation && (
                <div style={{
                  background: '#F9FAFB',
                  border: '1px solid #E8EDEB',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  fontSize: '13px',
                  color: '#4B5563',
                  lineHeight: 1.6,
                  marginTop: '8px',
                }}>
                  {explanation}
                </div>
              )}

              {/* Sort Dropdown + Quick Score Filters */}
              <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #E8EDEB' }}>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1fr) auto', gap: '16px', alignItems: 'flex-end' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#1B2A4A', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
                      {t('results.sortBy')}
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      style={{
                        padding: '10px 14px',
                        border: '1px solid #E8EDEB',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontFamily: "'DM Sans', sans-serif",
                        color: '#1B2A4A',
                        cursor: 'pointer',
                        backgroundColor: '#FFFFFF',
                        fontWeight: 500,
                        width: '100%',
                      }}
                    >
                      <option value="relevance">Relevancia (más alta primero)</option>
                      <option value="citations">Citaciones (más citadas primero)</option>
                      <option value="year">Año (más reciente primero)</option>
                      <option value="title">Título (A-Z)</option>
                    </select>
                  </div>

                  {/* Quick Score Filters */}
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#1B2A4A', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
                      🤖 {t('results.aiRanked')}
                    </label>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: isMobile ? 'flex-start' : 'flex-end' }}>
                    {(['high', 'mid', 'low'] as const).map((band) => {
                      const color = band === 'high' ? { bg: '#0F6E56', text: '#FFFFFF' } : band === 'mid' ? { bg: '#1B6FA8', text: '#FFFFFF' } : { bg: '#A33820', text: '#FFFFFF' };
                      const isActive = scoreFilters.has(band);
                      return (
                        <button
                          key={band}
                          onClick={() => toggleScoreFilter(band)}
                          style={{
                            padding: '6px 11px',
                            borderRadius: '5px',
                            fontSize: 'clamp(10px, 2vw, 12px)',
                            fontWeight: 600,
                            fontFamily: "'DM Sans', sans-serif",
                            border: isActive ? 'none' : `1.5px solid ${color.bg}`,
                            background: isActive ? color.bg : 'transparent',
                            color: isActive ? color.text : color.bg,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            opacity: isActive ? 1 : 0.35,
                            whiteSpace: 'nowrap',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = isActive ? '0.9' : '0.6';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = isActive ? '1' : '0.35';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                          title={`Filtrar por ${band === 'high' ? '100-80%' : band === 'mid' ? '79-50%' : '49-0%'}`}
                        >
                          {band === 'high' ? t('results.filter.high') : band === 'mid' ? t('results.filter.mid') : t('results.filter.low')}
                        </button>
                      );
                    })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {filteredResults.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '64px 0' }}>
                <div style={{
                  background: 'var(--green-50)',
                  borderRadius: '12px',
                  padding: '48px 32px',
                  maxWidth: '500px',
                  margin: '0 auto',
                }}>
                  <svg
                    style={{
                      width: '64px',
                      height: '64px',
                      margin: '0 auto 24px',
                      color: 'var(--green-300)',
                    }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    color: 'var(--navy)',
                    marginBottom: '12px',
                  }}>
                    {results.length === 0 ? t('results.noResults') : t('results.filterEmpty')}
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#6B7280',
                    marginBottom: '24px',
                    lineHeight: '1.6',
                  }}>
                    {results.length === 0 ? t('results.noResultsHint') : t('results.filterEmptyHint')}
                  </p>
                  <Link href={results.length === 0 ? `/search?initialTitle=${encodeURIComponent(thesisTitle)}&booleanQuery=${encodeURIComponent(booleanQuery)}&step=2` : '#'}>
                    <button
                      onClick={results.length === 0 ? undefined : () => {
                        setScoreFilters(new Set(['high', 'mid', 'low']));
                      }}
                      style={{
                        background: 'var(--green-500)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '12px 40px',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: '0 2px 8px rgba(15, 110, 86, 0.3)',
                        minHeight: '44px',
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--green-700)';
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(15, 110, 86, 0.12)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'var(--green-500)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(15, 110, 86, 0.3)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}>
                      {results.length === 0 ? t('results.refineSearch') : 'Mostrar todos'}
                    </button>
                  </Link>
                </div>
              </div>
            ) : (
              Object.entries(groupedResults).map(([source, sourceResults]) => (
                <div key={source} className="fade-in" style={{ marginBottom: '48px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '16px',
                    paddingBottom: '12px',
                    borderBottom: '2px solid #E8EDEB',
                  }}>
                    <h2 style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#1B2A4A',
                      margin: 0,
                    }}>
                      {getSourceLabel(source)} ({sourceResults.length})
                    </h2>
                    <button
                      onClick={() => toggleSourceCollapse(source)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '4px 8px',
                        cursor: 'pointer',
                        fontSize: '18px',
                        color: '#6B7280',
                        transition: 'color 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#1D9E75';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#6B7280';
                      }}
                      title={collapsedSources.has(source) ? 'Expandir' : 'Colapsar'}
                    >
                      {collapsedSources.has(source) ? '▶' : '▼'}
                    </button>
                  </div>

                  <div style={{ display: collapsedSources.has(source) ? 'none' : 'grid', gap: '16px' }}>
                    {sortResults(sourceResults).map((article, idx) => {
                      const relevance = getRelevanceColor(article.relevance_score);
                      return (
                        <div
                          key={`${source}-${idx}`}
                          style={{
                            border: '1px solid #E8EDEB',
                            borderRadius: '8px',
                            padding: '20px',
                            transition: 'all 0.18s',
                          }}
                        >
                          {/* Database Badge */}
                          {(() => {
                            const badge = getSourceBadge(source);
                            return (
                              <div style={{
                                display: 'inline-block',
                                background: badge.bg,
                                color: badge.color,
                                padding: '4px 10px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: 600,
                                marginBottom: '12px',
                              }}>
                                {badge.emoji} {badge.label}
                              </div>
                            );
                          })()}

                          {/* Year & Doc Type Tags */}
                          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                            {article.year && (
                              <div style={{
                                display: 'inline-block',
                                background: 'rgba(29, 158, 117, 0.1)',
                                color: 'var(--green-700)',
                                padding: '4px 10px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: 600,
                              }}>
                                {article.year}
                              </div>
                            )}
                            {article.doc_type && (
                              <div style={{
                                display: 'inline-block',
                                background: 'var(--bg-muted)',
                                color: 'var(--text-muted)',
                                padding: '4px 10px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: 600,
                              }}>
                                {t(`filter.type.${article.doc_type === 'conference' ? 'conference-paper' : article.doc_type}`)}
                              </div>
                            )}
                          </div>

                          {/* Title */}
                          <h3 style={{
                            fontSize: '15px',
                            fontWeight: 600,
                            color: '#1B2A4A',
                            marginBottom: '8px',
                            lineHeight: 1.5,
                          }}>
                            {article.title}
                          </h3>

                          {/* Authors & Year */}
                          <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '12px' }}>
                            {article.authors?.join(', ') || 'Unknown authors'}
                            {article.year && ` (${article.year})`}
                          </p>

                          {/* Abstract */}
                          {article.abstract && (
                            <div style={{ marginBottom: '12px' }}>
                              <p
                                style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px', lineHeight: 1.6 }}
                                dangerouslySetInnerHTML={{
                                  __html: highlightKeywords(
                                    expandedAbstracts.has(`${source}-${idx}`)
                                      ? article.abstract
                                      : article.abstract.substring(0, 200),
                                    extractKeywords(booleanQuery)
                                  ),
                                }}
                              />
                              {!expandedAbstracts.has(`${source}-${idx}`) && article.abstract.length > 200 && (
                                <span style={{ color: '#6B7280' }}>...</span>
                              )}
                              {article.abstract.length > 200 && (
                                <button
                                  onClick={() => toggleAbstract(`${source}-${idx}`)}
                                  style={{
                                    fontSize: '12px',
                                    color: '#1D9E75',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    padding: 0,
                                    marginLeft: expandedAbstracts.has(`${source}-${idx}`) ? '0px' : '0px',
                                  }}
                                >
                                  {expandedAbstracts.has(`${source}-${idx}`) ? `▼ ${t('results.button.readLess')}` : `▶ ${t('results.button.readFull')}`}
                                </button>
                              )}
                            </div>
                          )}

                          {/* Metadata */}
                          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                              {/* AI-Ranked Badge (if similarity score present) */}
                              {(article as any).similarity_score !== undefined && (
                                (() => {
                                  const simScore = (article as any).similarity_score || 0;
                                  const colors = simScore >= 0.8
                                    ? { bg: 'rgba(15, 110, 86, 0.12)', text: '#0F6E56' }
                                    : simScore >= 0.5
                                    ? { bg: 'rgba(27, 111, 168, 0.12)', text: '#1B6FA8' }
                                    : { bg: 'rgba(163, 56, 32, 0.12)', text: '#A33820' };
                                  return (
                                    <div style={{
                                      background: colors.bg,
                                      color: colors.text,
                                      padding: '4px 12px',
                                      borderRadius: '4px',
                                      fontSize: '11px',
                                      fontWeight: 600,
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                    }}>
                                      🤖 {t('results.aiRanked')} {Math.round(simScore * 100)}%
                                    </div>
                                  );
                                })()
                              )}

                              {/* DOI */}
                              {article.doi && (
                                <a
                                  href={`https://doi.org/${article.doi}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    fontSize: '11px',
                                    color: '#1D9E75',
                                    textDecoration: 'none',
                                    fontWeight: 500,
                                  }}
                                >
                                  DOI: {article.doi}
                                </a>
                              )}

                              {/* URL */}
                              {article.url && (
                                <a
                                  href={article.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    fontSize: '11px',
                                    color: '#1D9E75',
                                    textDecoration: 'none',
                                    fontWeight: 500,
                                  }}
                                >
                                  {t('results.viewOnline')}
                                </a>
                              )}
                            </div>

                            {/* Save Button */}
                            <button
                              onClick={() => isSaved(article) ? handleRemoveSave(article) : handleSaveClick(article)}
                              style={{
                                background: isSaved(article) ? '#1D9E75' : 'white',
                                border: isSaved(article) ? 'none' : '1px solid #E8EDEB',
                                color: isSaved(article) ? 'white' : '#1D9E75',
                                padding: '4px 12px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.18s',
                                whiteSpace: 'nowrap',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = isSaved(article) ? '#0F6E56' : '#F3F4F6';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = isSaved(article) ? '#1D9E75' : 'white';
                              }}
                            >
                              {isSaved(article) ? '📌 Guardado' : '+ Guardar'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}

            {/* Modal de calificación */}
            {modalOpen && modalArticle && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 50,
              }}>
                <div style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '32px',
                  maxWidth: '500px',
                  width: '90%',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                }}>
                  <h2 style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    marginBottom: '8px',
                    color: '#1B2A4A',
                  }}>
                    Calificar publicación
                  </h2>
                  <p style={{
                    fontSize: '13px',
                    color: '#6B7280',
                    marginBottom: '24px',
                    lineHeight: 1.5,
                  }}>
                    {modalArticle.title}
                  </p>

                  <div style={{ marginBottom: '24px' }}>
                    <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '12px', fontWeight: 500 }}>
                      ¿Cuán relevante es para tu tesis?
                    </p>
                    <StarRating value={modalRating} onChange={setModalRating} size="large" />
                  </div>

                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => {
                        setModalOpen(false);
                        setModalArticle(null);
                      }}
                      style={{
                        padding: '10px 20px',
                        background: 'transparent',
                        color: '#6B7280',
                        border: '1px solid #E8EDEB',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 500,
                        cursor: 'pointer',
                      }}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleConfirmSave}
                      style={{
                        padding: '10px 20px',
                        background: '#1D9E75',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 500,
                        cursor: 'pointer',
                      }}
                    >
                      Guardar en tablero
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
