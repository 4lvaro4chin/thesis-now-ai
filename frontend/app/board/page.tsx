'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthProtection } from '@/lib/useAuthProtection';
import { useTranslation } from '@/lib/useTranslation';
import { useSavedPublications, SavedPublication } from '@/lib/useSavedPublications';
import { StarRating } from '@/components/ui/StarRating';

export default function BoardPage() {
  useAuthProtection();
  const { t } = useTranslation();
  const { getAllSavedByUser, updateStarRating, removePublication } = useSavedPublications();

  const [publications, setPublications] = useState<SavedPublication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedThesis, setSelectedThesis] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingRating, setEditingRating] = useState(0);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'rating' | 'year' | 'date' | 'source' | 'title'>('rating');

  useEffect(() => {
    const loadPublications = async () => {
      setLoading(true);
      const data = await getAllSavedByUser();
      setPublications(data);
      if (data.length > 0) {
        setSelectedThesis(data[0].thesis_title);
      }
      setLoading(false);
    };

    loadPublications();
  }, [getAllSavedByUser]);

  const theses = Array.from(new Set(publications.map((p) => p.thesis_title)));
  const filteredPublications = selectedThesis
    ? publications.filter((p) => p.thesis_title === selectedThesis)
    : publications;

  const handleUpdateRating = async (id: string, rating: number) => {
    try {
      await updateStarRating(id, rating);
      setPublications((prev) =>
        prev.map((p) => (p.id === id ? { ...p, star_rating: rating } : p))
      );
      setEditingId(null);
    } catch (err) {
      console.error('Failed to update rating:', err);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await removePublication(id);
      setPublications((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Failed to remove publication:', err);
    }
  };

  const exportToExcel = async () => {
    try {
      if (filteredPublications.length === 0) {
        alert('No publications to export');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/export/excel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filteredPublications),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Export error:', response.status, errorText);
        alert(`Error al descargar Excel: ${errorText}`);
        return;
      }

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `publicaciones_${selectedThesis.replace(/\s+/g, '_')}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Export error:', error);
      alert('Error al exportar publicaciones: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  // Expose export function to window for Navbar access
  useEffect(() => {
    (window as any).thesisNowExportBoard = () => {
      if (filteredPublications.length > 0) {
        exportToExcel();
      } else {
        alert('No publications to export');
      }
    };
    return () => {
      delete (window as any).thesisNowExportBoard;
    };
  }, [filteredPublications, exportToExcel]);

  const sortPublications = (items: SavedPublication[]): SavedPublication[] => {
    const sorted = [...items];
    switch (sortBy) {
      case 'rating':
        return sorted.sort((a, b) => {
          const aRating = a.star_rating || 0;
          const bRating = b.star_rating || 0;
          if (bRating !== aRating) return bRating - aRating;
          return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
        });
      case 'year':
        return sorted.sort((a, b) => (b.year || 0) - (a.year || 0));
      case 'date':
        return sorted.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
      case 'source':
        return sorted.sort((a, b) => (a.source || '').localeCompare(b.source || ''));
      case 'title':
        return sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      default:
        return sorted;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', paddingTop: '72px', paddingBottom: '60px' }}>
      {/* Hero Section */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--green-50) 0%, #E8F8F4 100%)',
          borderBottom: '1px solid var(--green-100)',
          padding: '64px 48px',
          marginBottom: '60px',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <Link
              href="/search"
              style={{
                fontSize: '14px',
                color: '#1D9E75',
                textDecoration: 'none',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              {t('board.backToSearch')}
            </Link>
          </div>
          <h1
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 'clamp(32px, 5vw, 48px)',
              fontWeight: 700,
              color: '#04342C',
              letterSpacing: '-0.7px',
              lineHeight: 1.2,
              marginBottom: '8px',
            }}
          >
            {t('board.title')}
          </h1>
          <p style={{ fontSize: '16px', color: '#6B7280', lineHeight: 1.6 }}>
            {t('board.subtitle')}
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 48px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ color: '#6B7280', fontSize: '16px' }}>{t('board.loading')}</p>
          </div>
        ) : publications.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 0',
              background: '#F9FAFB',
              borderRadius: '12px',
              border: '1px solid #E8EDEB',
            }}
          >
            <p style={{ color: '#6B7280', fontSize: '16px', marginBottom: '16px' }}>
              {t('board.empty')}
            </p>
            <Link
              href="/search"
              style={{
                display: 'inline-block',
                padding: '10px 24px',
                background: '#1D9E75',
                color: 'white',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              {t('board.emptyCta')}
            </Link>
          </div>
        ) : (
          <>
            {/* Thesis Filter & Sort */}
            {theses.length > 1 && (
              <div style={{ marginBottom: '40px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#1B2A4A', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
                  {t('board.filterByThesis')}
                </label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                  <select
                    value={selectedThesis}
                    onChange={(e) => setSelectedThesis(e.target.value)}
                    style={{
                      flex: 1,
                      minWidth: '280px',
                      maxWidth: '400px',
                      padding: '12px 16px',
                      border: '1px solid #E8EDEB',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontFamily: "'DM Sans', sans-serif",
                      color: '#1B2A4A',
                      cursor: 'pointer',
                    }}
                  >
                    {theses.map((thesis) => (
                      <option key={thesis} value={thesis}>
                        {thesis}
                      </option>
                    ))}
                  </select>
                  <Link
                    href={`/search?initialTitle=${encodeURIComponent(selectedThesis)}`}
                    style={{
                      padding: '12px 20px',
                      background: '#1D9E75',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#0F6E56';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#1D9E75';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {t('board.searchMore')}
                  </Link>
                </div>
              </div>
            )}

            {/* Sort Options */}
            {selectedThesis && filteredPublications.length > 0 && (
              <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #E8EDEB' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#1B2A4A', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
                  {t('board.sortBy')}
                </label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
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
                  }}
                >
                  <option value="rating">{t('board.sort.rating')}</option>
                  <option value="year">{t('board.sort.year')}</option>
                  <option value="date">{t('board.sort.date')}</option>
                  <option value="source">{t('board.sort.source')}</option>
                  <option value="title">{t('board.sort.title')}</option>
                </select>
                </div>
              </div>
            )}

            {/* Thesis Section */}
            {selectedThesis && (
              <div>
                <div style={{ marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#04342C', marginBottom: '8px' }}>
                    "{selectedThesis}"
                  </h2>
                  <p style={{ fontSize: '13px', color: '#6B7280' }}>
                    {filteredPublications.length} {t(filteredPublications.length === 1 ? 'board.savedCount.one' : 'board.savedCount.other')}
                  </p>
                </div>

                <div style={{ display: 'grid', gap: '16px' }}>
                  {sortPublications(filteredPublications).map((pub) => (
                    <div
                      key={pub.id}
                      style={{
                        border: '1px solid #E8EDEB',
                        borderRadius: '8px',
                        padding: '20px',
                        transition: 'all 0.18s',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1B2A4A', marginBottom: '8px', lineHeight: 1.5 }}>
                            {pub.title}
                          </h3>
                          <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '12px' }}>
                            {pub.authors?.join(', ') || t('board.unknownAuthors')}
                            {pub.year && ` (${pub.year})`}
                          </p>
                        </div>
                        {confirmingId === pub.id ? (
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginLeft: '16px' }}>
                            <span style={{ fontSize: '13px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                              {t('board.confirmDelete')}
                            </span>
                            <button
                              onClick={() => {
                                handleRemove(pub.id || '');
                                setConfirmingId(null);
                              }}
                              style={{
                                background: 'var(--error)',
                                border: 'none',
                                color: 'white',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: 600,
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {t('board.confirmYes')}
                            </button>
                            <button
                              onClick={() => setConfirmingId(null)}
                              style={{
                                background: 'transparent',
                                border: '1px solid #E8EDEB',
                                color: 'var(--text-muted)',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: 500,
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {t('board.cancel')}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmingId(pub.id || null)}
                            style={{
                              background: '#FEE8E8',
                              border: 'none',
                              color: 'var(--error)',
                              padding: '8px 12px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: 500,
                              marginLeft: '16px',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {t('board.delete')}
                          </button>
                        )}
                      </div>

                      {/* Rating */}
                      <div style={{ marginBottom: '12px' }}>
                        {editingId === pub.id ? (
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <StarRating
                              value={editingRating}
                              onChange={setEditingRating}
                              size="small"
                            />
                            <button
                              onClick={() => handleUpdateRating(pub.id || '', editingRating)}
                              style={{
                                padding: '4px 12px',
                                background: '#1D9E75',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: 500,
                              }}
                            >
                              {t('board.save')}
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              style={{
                                padding: '4px 12px',
                                background: 'transparent',
                                color: '#6B7280',
                                border: '1px solid #E8EDEB',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: 500,
                              }}
                            >
                              {t('board.cancel')}
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => {
                              setEditingId(pub.id || null);
                              setEditingRating(pub.star_rating || 0);
                            }}
                            style={{
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                            }}
                          >
                            <StarRating value={pub.star_rating || 0} readonly size="small" />
                            {!pub.star_rating && <span style={{ fontSize: '12px', color: '#9CA3AF' }}>{t('board.unrated')}</span>}
                          </div>
                        )}
                      </div>

                      {/* Metadata */}
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                        {/* Source */}
                        <div style={{
                          background: 'var(--green-100)',
                          color: '#0F6E56',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 600,
                        }}>
                          {pub.source}
                        </div>

                        {/* DOI */}
                        {pub.doi && (
                          <a
                            href={`https://doi.org/${pub.doi}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: '11px',
                              color: '#1D9E75',
                              textDecoration: 'none',
                              fontWeight: 500,
                            }}
                          >
                            DOI: {pub.doi}
                          </a>
                        )}

                        {/* URL */}
                        {pub.url && (
                          <a
                            href={pub.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: '11px',
                              color: '#1D9E75',
                              textDecoration: 'none',
                              fontWeight: 500,
                            }}
                          >
                            {t('board.viewOnline')}
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
