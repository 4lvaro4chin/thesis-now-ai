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

  const jobId = searchParams.get('job_id');

  useEffect(() => {
    if (!jobId) {
      setError('No search job found');
      setLoading(false);
      return;
    }

    // Load from sessionStorage or fetch from backend
    const cached = sessionStorage.getItem(`search_${jobId}`);
    if (cached) {
      try {
        const data = JSON.parse(cached);
        setResults(data.results || []);
        setBooleanQuery(data.boolean_query || '');
        setLoading(false);
      } catch {
        setError('Failed to parse search results');
        setLoading(false);
      }
    } else {
      // Fallback: fetch from backend
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/search/${jobId}`)
        .then((res) => res.json())
        .then((data) => {
          setResults(data.results || []);
          setBooleanQuery(data.boolean_query || '');
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message || 'Failed to fetch results');
          setLoading(false);
        });
    }
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

  const getRelevanceColor = (score: number) => {
    if (score >= 0.8) return { bg: '#E1F5EE', text: '#0F6E56' };
    if (score >= 0.5) return { bg: '#EBF4FD', text: '#1B6FA8' };
    return { bg: '#FEF0EC', text: '#A33820' };
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#FFFFFF', paddingTop: '72px', paddingBottom: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#6B7280' }}>Loading results...</p>
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
                          <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px' }}>
                            {article.authors?.join(', ') || 'Unknown authors'}
                            {article.year && ` (${article.year})`}
                          </p>

                          {/* Abstract */}
                          {article.abstract && (
                            <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '12px', lineHeight: 1.6 }}>
                              {article.abstract.substring(0, 200)}
                              {article.abstract.length > 200 ? '...' : ''}
                            </p>
                          )}

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
                              {Math.round(article.relevance_score * 100)}% relevant
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
                                View Online
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
