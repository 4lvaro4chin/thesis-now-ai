'use client';

import { useTranslation } from '@/lib/useTranslation';

export function Footer() {
  const { t } = useTranslation();
  return (
    <>
      <style>{`
        .footer-link {
          color: rgba(255, 255, 255, 0.45);
          transition: color 180ms ease;
          text-decoration: none;
          font-size: 13px;
          font-weight: 400;
          white-space: nowrap;
        }
        .footer-link:hover {
          color: rgba(255, 255, 255, 0.8);
        }
        .footer-link:focus-visible {
          outline: 2px solid var(--green-400);
          outline-offset: 2px;
          border-radius: 4px;
          padding: 4px 8px;
        }
      `}</style>

      <footer style={{
        background: 'var(--navy)',
        width: '100%',
      }}>
        <div style={{
          maxWidth: '1100px',
          margin: '0 auto',
          paddingTop: '40px',
          paddingBottom: '40px',
          paddingLeft: '48px',
          paddingRight: '48px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '24px',
        }} className="flex-col md:flex-row md:items-center">
          {/* Logo + Tagline (Left) */}
          <div>
            <div style={{
              fontSize: '16px',
              fontWeight: 600,
              letterSpacing: '-0.5px',
              marginBottom: '6px',
            }}>
              <span style={{ color: '#FFFFFF' }}>Thesis</span>
              <span style={{ color: 'var(--green-400)' }}>Now</span>
            </div>
            <p style={{
              fontSize: '13px',
              fontStyle: 'italic',
              fontWeight: 400,
              color: 'rgba(255, 255, 255, 0.5)',
              margin: 0,
            }}>
              {t('footer.tagline')}
            </p>
          </div>

          {/* Links (Right) */}
          <div style={{
            display: 'flex',
            gap: '28px',
            flexWrap: 'wrap',
          }}>
            <a href="/privacy" className="footer-link">
              {t('footer.privacy')}
            </a>
            <a href="/terms" className="footer-link">
              {t('footer.terms')}
            </a>
            <a href="/contact" className="footer-link">
              {t('footer.contact')}
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
