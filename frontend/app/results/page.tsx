'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuthProtection } from '@/lib/useAuthProtection';
import { useTranslation } from '@/lib/useTranslation';
import type { SearchResult } from '@/lib/useSearch';

export default function ResultsPage() {
  useAuthProtection();
  const { t } = useTranslation();
  const searchParams = useSearchParams();

  const [results, setResults] = useState<SearchResult[]>([]);
  const [booleanQuery, setBooleanQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedAbstracts, setExpandedAbstracts] = useState<Set<string>>(new Set());
  const [loadingProgress, setLoadingProgress] = useState(0); // 0-100

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
    if (cached) {
      try {
        const data = JSON.parse(cached);
        setLoadingProgress(100);
        setTimeout(() => {
          setResults(data.results || []);
          setBooleanQuery(data.boolean_query || '');
          setLoading(false);
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
            setResults(data.results || []);
            setBooleanQuery(data.boolean_query || '');
            setLoading(false);
          }, 300);
        })
        .catch((err) => {
          setError(err.message || 'Failed to fetch results');
          setLoading(false);
        });
    }

    return () => clearInterval(progressInterval);
  }, [jobId]);

  const groupedResults = results.reduce(
    (acc, result) => {
      const source = result.source || 'unknown';
      if (!acc[source]) acc[source] = [];
      acc[source].push(result);
      return acc;
    },
    {} as Record<string, SearchResult[]>
  );

  const getSourceLabel = (source: string): string => {
    const labels: Record<string, string> = {
      pubmed: 'PubMed',
      semantic_scholar: 'Semantic Scholar',
      arxiv: 'arXiv',
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
    };
    return sources[source] || { label: source, bg: '#E5E7EB', color: '#374151', emoji: '📑' };
  };

  const getRelevanceColor = (score: number) => {
    if (score >= 0.8) return { bg: '#E1F5EE', text: '#0F6E56' };
    if (score >= 0.5) return { bg: '#EBF4FD', text: '#1B6FA8' };
    return { bg: '#FEF0EC', text: '#A33820' };
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
    // Remove boolean operators and parentheses, extract unique terms
    const cleaned = query
      .replace(/\(|\)/g, ' ')
      .replace(/\bAND\b|\bOR\b|\bNOT\b/gi, ' ')
      .trim();

    const terms = cleaned
      .split(/\s+/)
      .filter((t) => t.length > 2) // Only words > 2 chars
      .map((t) => t.toLowerCase())
      .filter((v, i, a) => a.indexOf(v) === i); // Unique

    return terms;
  };

  const highlightKeywords = (text: string, keywords: string[]) => {
    if (!text || keywords.length === 0) return text;

    let result = text;
    keywords.forEach((keyword) => {
      const regex = new RegExp(`(${keyword})`, 'gi');
      result = result.replace(regex, '<mark>$1</mark>');
    });

    return result;
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
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 48px' }}>
        {error ? (
          <div style={{ textAlign: 'center', paddingTop: '48px' }}>
            <h2 style={{ color: '#DC2626', marginBottom: '16px' }}>Error</h2>
            <p style={{ color: '#6B7280' }}>{error}</p>
            <a href="/search" style={{ marginTop: '24px', display: 'inline-block', padding: '10px 20px', background: '#1D9E75', color: 'white', textDecoration: 'none', borderRadius: '8px' }}>
              Back to Search
            </a>
          </div>
        ) : (
          <>
            {/* Back Button */}
            <a
              href="/search"
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
            </a>

            {/* Header */}
            <div style={{ marginBottom: '48px' }}>
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
                {t('results.subtitle')} <span style={{ fontWeight: 600, color: '#1B2A4A' }}>{results.length}</span> {t('results.articles')}
              </p>
              {booleanQuery && (
                <div style={{
                  background: '#F0FBF7',
                  border: '1px solid #E1F5EE',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  fontSize: '13px',
                  color: '#0F6E56',
                  fontFamily: 'monospace',
                }}>
                  <strong>Query:</strong> {booleanQuery}
                </div>
              )}
            </div>

            {results.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <p style={{ color: '#6B7280' }}>No results found. Try a different search.</p>
              </div>
            ) : (
              Object.entries(groupedResults).map(([source, sourceResults]) => (
                <div key={source} style={{ marginBottom: '48px' }}>
                  <h2 style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#1B2A4A',
                    marginBottom: '16px',
                    paddingBottom: '12px',
                    borderBottom: '2px solid #E8EDEB',
                  }}>
                    {getSourceLabel(source)} ({sourceResults.length})
                  </h2>

                  <div style={{ display: 'grid', gap: '16px' }}>
                    {sourceResults.map((article, idx) => {
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

                          <style>{`
                            mark {
                              background-color: #FEF08A;
                              color: inherit;
                              padding: 2px 4px;
                              border-radius: 3px;
                              font-weight: 600;
                            }
                          `}</style>

                          {/* Metadata */}
                          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                            {/* Relevance Score */}
                            <div style={{
                              background: relevance.bg,
                              color: relevance.text,
                              padding: '4px 12px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 600,
                            }}>
                              {Math.round(article.relevance_score * 100)}% {t('results.relevant')}
                            </div>

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
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}

            {/* Export Bar */}
            <div style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'white',
              borderTop: '1px solid #E8EDEB',
              padding: '16px 48px',
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              zIndex: 40,
            }}>
              <button style={{
                padding: '10px 20px',
                background: '#1D9E75',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
              }}>
                Export PDF
              </button>
              <button style={{
                padding: '10px 20px',
                background: 'transparent',
                color: '#1D9E75',
                border: '1.5px solid #1D9E75',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
              }}>
                Export Word
              </button>
              <a
                href="/search"
                style={{
                  padding: '10px 20px',
                  background: 'transparent',
                  color: '#6B7280',
                  border: '1px solid #E8EDEB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  textDecoration: 'none',
                  cursor: 'pointer',
                }}
              >
                New Search
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
