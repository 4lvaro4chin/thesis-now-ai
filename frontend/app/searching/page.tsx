'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthProtection } from '@/lib/useAuthProtection';
import { useTranslation } from '@/lib/useTranslation';
import { useSearch } from '@/lib/useSearch';

export default function SearchingPage() {
  useAuthProtection();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const { job, waitForCompletion } = useSearch();

  const [isSearching, setIsSearching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const title = searchParams.get('title') || 'Loading...';
  const databasesParam = searchParams.get('databases') || 'pubmed,semantic_scholar';
  const databases = databasesParam.split(',').filter(Boolean);

  useEffect(() => {
    const executeSearch = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, databases }),
        });

        if (!response.ok) throw new Error('Failed to start search');

        const { job_id } = await response.json();

        // Poll until complete
        let jobData = { status: 'pending' };
        const maxAttempts = 90; // 3 minutes with 2s polling
        let attempts = 0;

        while (jobData.status !== 'completed' && jobData.status !== 'error' && attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 2000));

          const statusResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/search/${job_id}`);
          if (!statusResponse.ok) throw new Error('Failed to fetch status');

          jobData = await statusResponse.json();
          attempts++;
        }

        if (jobData.status === 'error') {
          setError(jobData.error || 'Search failed');
          setIsSearching(false);
          return;
        }

        if (jobData.status === 'completed') {
          // Store results in sessionStorage or pass via URL
          sessionStorage.setItem(`search_${job_id}`, JSON.stringify(jobData));
          router.push(`/results?job_id=${job_id}`);
        } else {
          setError('Search timeout');
          setIsSearching(false);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        setIsSearching(false);
      }
    };

    executeSearch();
  }, [title, databases, router]);

  return (
    <div style={{ minHeight: '100vh', background: '#04342C', paddingTop: '72px', paddingBottom: '72px', display: 'flex', alignItems: 'center' }}>
      {/* Noise overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.6,
        pointerEvents: 'none',
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E\")",
        backgroundSize: '512px',
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '1100px', margin: '0 auto', padding: '0 48px', textAlign: 'center' }}>
        {error ? (
          <>
            <h1 style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 'clamp(26px, 3vw, 34px)',
              fontWeight: 600,
              color: '#FF6B6B',
              letterSpacing: '-0.7px',
              lineHeight: 1.2,
              marginBottom: '16px',
            }}>
              Error
            </h1>
            <p style={{
              fontSize: '15px',
              color: 'rgba(255,255,255,0.8)',
              marginBottom: '32px',
            }}>
              {error}
            </p>
            <a
              href="/search"
              style={{
                display: 'inline-block',
                padding: '12px 28px',
                background: '#1D9E75',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              Back to Search
            </a>
          </>
        ) : (
          <>
            {/* Header */}
            <h1 style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 'clamp(26px, 3vw, 34px)',
              fontWeight: 600,
              color: 'white',
              letterSpacing: '-0.7px',
              lineHeight: 1.2,
              marginBottom: '16px',
              textWrap: 'balance',
            }}>
              {t('searching.title')}
            </h1>
            <p style={{
              fontSize: '15px',
              color: 'rgba(255,255,255,0.6)',
              marginBottom: '32px',
            }}>
              {title}
            </p>

            {/* Loader Animation */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '48px',
            }}>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#5DCAA5',
                    borderRadius: '50%',
                    animation: `bounce 1.4s infinite ease-in-out`,
                    animationDelay: `${i * 0.16}s`,
                  }}
                />
              ))}
            </div>

            <p style={{
              fontSize: '14px',
              color: 'rgba(255,255,255,0.7)',
              marginBottom: '32px',
            }}>
              Searching in {databases.join(', ')}...
            </p>
          </>
        )}

        <style>{`
          @keyframes bounce {
            0%, 80%, 100% {
              opacity: 0.5;
              transform: translateY(0);
            }
            40% {
              opacity: 1;
              transform: translateY(-10px);
            }
          }
        `}</style>
      </div>
    </div>
  );
}
