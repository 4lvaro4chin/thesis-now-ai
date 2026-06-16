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

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', paddingTop: '72px', paddingBottom: '60px' }}>
      {/* Hero Section */}
      <div
        style={{
          background: 'linear-gradient(135deg, #F0FBF7 0%, #E8F8F4 100%)',
          borderBottom: '1px solid #E1F5EE',
          padding: '64px 48px',
          marginBottom: '60px',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <Link
              href="/results"
              style={{
                fontSize: '14px',
                color: '#1D9E75',
                textDecoration: 'none',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              ← Volver
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
            Mi Tablero
          </h1>
          <p style={{ fontSize: '16px', color: '#6B7280', lineHeight: 1.6 }}>
            Publicaciones guardadas para tu revisión bibliográfica
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 48px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ color: '#6B7280', fontSize: '16px' }}>Cargando publicaciones...</p>
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
              Aún no has guardado publicaciones
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
              Hacer una búsqueda
            </Link>
          </div>
        ) : (
          <>
            {/* Thesis Filter */}
            {theses.length > 1 && (
              <div style={{ marginBottom: '40px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#1B2A4A', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Filtrar por tesis
                </label>
                <select
                  value={selectedThesis}
                  onChange={(e) => setSelectedThesis(e.target.value)}
                  style={{
                    width: '100%',
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
                    {filteredPublications.length} publicación{filteredPublications.length !== 1 ? 'es' : ''} guardada{filteredPublications.length !== 1 ? 's' : ''}
                  </p>
                </div>

                <div style={{ display: 'grid', gap: '16px' }}>
                  {filteredPublications.map((pub) => (
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
                            {pub.authors?.join(', ') || 'Unknown authors'}
                            {pub.year && ` (${pub.year})`}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemove(pub.id || '')}
                          style={{
                            background: '#FEE8E8',
                            border: 'none',
                            color: '#DC2626',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 500,
                            marginLeft: '16px',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          🗑️ Eliminar
                        </button>
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
                              Guardar
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
                              Cancelar
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
                            {!pub.star_rating && <span style={{ fontSize: '12px', color: '#9CA3AF' }}>Sin calificar</span>}
                          </div>
                        )}
                      </div>

                      {/* Metadata */}
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                        {/* Source */}
                        <div style={{
                          background: '#E1F5EE',
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
                            Ver online
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
