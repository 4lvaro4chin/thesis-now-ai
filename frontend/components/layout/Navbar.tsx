'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { useTranslation } from '@/lib/useTranslation';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import type { User } from '@supabase/supabase-js';

interface NavbarProps {
  user: User | null;
}

export function Navbar({ user: initialUser }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [user, setUser] = useState(initialUser);
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { t, lang } = useTranslation();
  const isResultsPage = pathname === '/results';

  useEffect(() => {
    setMounted(true);

    const subscription = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (event === 'SIGNED_OUT') {
        setMenuOpen(false);
        router.push('/');
      }
    });

    return () => {
      subscription?.data?.subscription?.unsubscribe();
    };
  }, [supabase, router]);

  const handleLogout = async () => {
    try {
      setMenuOpen(false);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleLogin = () => {
    setMenuOpen(false);
    router.push('/login');
  };

  return (
    <>
      <style>{`
        .nav-link {
          color: var(--text-muted);
          transition: color 150ms ease;
          text-decoration: none;
          font-size: 14px;
          font-weight: 400;
          white-space: nowrap;
        }
        .nav-link:hover {
          color: var(--navy);
        }
        .nav-link:focus-visible {
          outline: 2px solid var(--green-500);
          outline-offset: 2px;
          border-radius: 4px;
          padding: 4px 8px;
        }

        .nav-btn-outlined {
          padding: 8px 16px;
          font-size: 14px;
          font-weight: 600;
          color: var(--green-500);
          background: transparent;
          border: 1.5px solid var(--green-500);
          border-radius: 10px;
          cursor: pointer;
          transition: all 150ms ease;
          min-height: 44px;
          display: inline-flex;
          align-items: center;
          text-decoration: none;
          white-space: nowrap;
        }
        .nav-btn-outlined:hover {
          background: rgba(29, 158, 117, 0.08);
          border-color: var(--green-700);
          color: var(--green-700);
        }
        .nav-btn-outlined:focus-visible {
          outline: 2px solid var(--green-500);
          outline-offset: 2px;
        }

        .nav-btn-primary {
          padding: 8px 20px;
          font-size: 14px;
          font-weight: 600;
          color: white;
          background: var(--green-500);
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 150ms ease;
          min-height: 44px;
          display: inline-flex;
          align-items: center;
          box-shadow: 0 4px 12px rgba(29, 158, 117, 0.3);
          text-decoration: none;
          white-space: nowrap;
        }
        .nav-btn-primary:hover {
          background: var(--green-700);
          box-shadow: 0 8px 20px rgba(29, 158, 117, 0.4);
        }
        .nav-btn-primary:focus-visible {
          outline: 2px solid var(--green-500);
          outline-offset: 2px;
        }

        .nav-btn-ghost {
          padding: 8px 16px;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-muted);
          background: transparent;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 150ms ease;
          min-height: 44px;
          display: inline-flex;
          align-items: center;
          text-decoration: none;
        }
        .nav-btn-ghost:hover {
          background: var(--bg);
          color: var(--navy);
        }
        .nav-btn-ghost:focus-visible {
          outline: 2px solid var(--green-500);
          outline-offset: 2px;
        }

        .hamburger-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 44px;
          min-height: 44px;
          color: var(--navy);
          transition: color 150ms ease;
        }
        .hamburger-btn:hover {
          color: var(--green-500);
        }
        .hamburger-btn:focus-visible {
          outline: 2px solid var(--green-500);
          outline-offset: 2px;
          border-radius: 6px;
        }

        .mobile-nav-link {
          display: flex;
          align-items: center;
          min-height: 48px;
          padding: 8px 12px;
          font-size: 15px;
          font-weight: 500;
          color: #FFFFFF;
          text-decoration: none;
          border-radius: 8px;
          transition: background 150ms ease;
        }
        .mobile-nav-link:hover {
          background: rgba(255,255,255,0.15);
        }
        .mobile-nav-link:focus-visible {
          outline: 2px solid var(--green-400);
          outline-offset: 2px;
        }

        .mobile-section-label {
          font-size: 11px;
          font-weight: 700;
          color: #9CA3AF;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          padding: 12px 12px 8px;
          margin-top: 8px;
        }

        .mobile-section-separator {
          height: 1px;
          background: rgba(255,255,255,0.12);
          margin: 12px 0;
        }

        .mobile-user-info {
          padding: 16px 12px;
          border-radius: 10px;
          background: rgba(93, 202, 165, 0.12);
          margin-bottom: 0;
          border-left: 3px solid var(--green-500);
        }

        .mobile-user-email {
          font-size: 12px;
          color: #D1D5DB;
          margin-top: 6px;
        }

        .mobile-user-name {
          font-size: 16px;
          font-weight: 700;
          color: #FFFFFF;
        }

        .mobile-auth-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
          width: 100%;
          padding: 0 8px;
          font-size: 14px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: all 150ms ease;
          text-decoration: none;
        }

        .mobile-auth-primary {
          background: var(--green-500);
          color: white;
          margin-top: 12px;
        }
        .mobile-auth-primary:hover {
          background: var(--green-700);
        }

        .mobile-auth-secondary {
          background: transparent;
          color: var(--green-400);
          border: 1px solid var(--green-400);
        }
        .mobile-auth-secondary:hover {
          background: rgba(29, 158, 117, 0.15);
          border-color: var(--green-300);
          color: var(--green-300);
        }

        .mobile-auth-ghost {
          background: transparent;
          color: #E5E7EB;
        }
        .mobile-auth-ghost:hover {
          background: rgba(255,255,255,0.12);
          color: #FF4444;
        }

        .mobile-menu-icon {
          width: 20px;
          height: 20px;
          margin-right: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .mobile-auth-btn:focus-visible {
          outline: 2px solid var(--green-500);
          outline-offset: 2px;
        }

        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .mobile-menu {
          animation: slideInFromRight 0.3s ease-out !important;
        }
      `}</style>

      <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/95 backdrop-blur-md border-b border-[var(--border)] flex items-center justify-between" style={{ paddingLeft: '48px', paddingRight: '48px' }}>
        {/* Logo — Left */}
        <a
          href={user ? '/search' : '/'}
          className="flex items-center gap-2 no-underline z-10"
        >
          <span style={{
            fontSize: '17px',
            fontWeight: 600,
            letterSpacing: '-0.5px',
          }}>
            <span style={{ color: 'var(--navy)' }}>Thesis</span>
            <span style={{ color: 'var(--green-500)' }}>Now</span>
          </span>
        </a>

        {/* Nav Links — Center (absolute for perfect centering) */}
        <div style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'none',
        }} className="md:flex">
          <div style={{ display: 'flex', gap: '40px' }}>
            <a href="/#features" className="nav-link">
              Cómo funciona
            </a>
            <a href="/#databases" className="nav-link">
              Bases de datos
            </a>
            <a href="/pricing" className="nav-link">
              Precios
            </a>
          </div>
        </div>

        {/* Auth + Language Switcher — Right */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* Desktop Auth Buttons */}
          <div style={{ display: 'none', gap: '8px', alignItems: 'center' }} className="md:flex">
            {user ? (
              <>
                <a href="/board" className="nav-btn-outlined">
                  Mi Tablero
                </a>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  paddingLeft: '10px',
                  paddingRight: '10px',
                  paddingTop: '4px',
                  paddingBottom: '4px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(29, 158, 117, 0.08)',
                  minHeight: '36px',
                }}>
                  <div style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--green-500)',
                  }} />
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--navy)',
                  }}>
                    {user.email?.split('@')[0]}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="nav-btn-ghost"
                >
                  {t('navbar.logout')}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleLogin}
                  className="nav-btn-outlined"
                >
                  {t('navbar.signIn')}
                </button>
                <button
                  onClick={handleLogin}
                  className="nav-btn-primary"
                >
                  {t('navbar.startFree')}
                </button>
              </>
            )}
          </div>

          {/* Language Switcher */}
          {mounted && <LanguageSwitcher currentLang={lang} />}

          {/* Hamburger — Mobile only */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden hamburger-btn"
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {menuOpen && (
          <div
            onClick={() => setMenuOpen(false)}
            className="md:hidden"
            style={{
              position: 'fixed',
              inset: 0,
              top: '64px',
              background: 'rgba(0,0,0,0.2)',
              zIndex: 48,
            }}
          />
        )}

        {/* Mobile Menu Panel — Side Drawer from Right */}
        {menuOpen && (
          <div
            className="md:hidden mobile-menu"
            style={{
              position: 'fixed',
              top: '64px',
              right: '12px',
              width: '280px',
              backgroundColor: '#1F2937',
              borderLeft: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              boxShadow: '-2px 0 16px rgba(0,0,0,0.3)',
              zIndex: 49,
              padding: '16px 20px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 0,
              animation: 'slideInFromRight 0.3s ease-out',
            }}
          >
            {/* User Section (Top) — Only if authenticated */}
            {user && (
              <>
                <div className="mobile-user-info">
                  <div className="mobile-user-name">{user.email?.split('@')[0]}</div>
                  <div className="mobile-user-email">{user.email}</div>
                </div>
                <div className="mobile-section-separator" />
              </>
            )}

            {/* Navigation Links */}
            <a href="/#features" onClick={() => setMenuOpen(false)} className="mobile-nav-link">
              <svg className="mobile-menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="1"/><path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m5.08-5.08l4.24-4.24"/>
              </svg>
              {t('navbar.howItWorks')}
            </a>
            <a href="/#databases" onClick={() => setMenuOpen(false)} className="mobile-nav-link">
              <svg className="mobile-menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/>
              </svg>
              {t('navbar.databases')}
            </a>
            <a href="/pricing" onClick={() => setMenuOpen(false)} className="mobile-nav-link">
              <svg className="mobile-menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
              {t('navbar.pricing')}
            </a>

            <div className="mobile-section-separator" />

            {/* Account Links */}
            {user ? (
              <>
                <a href="/search" onClick={() => setMenuOpen(false)} className="mobile-nav-link">
                  <svg className="mobile-menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="1"/><path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m5.08-5.08l4.24-4.24"/>
                  </svg>
                  {t('navbar.newSearch')}
                </a>
                <a href="/board" onClick={() => setMenuOpen(false)} className="mobile-nav-link">
                  <svg className="mobile-menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                  {t('navbar.dashboard')}
                </a>
              </>
            ) : (
              <>
                <button
                  onClick={handleLogin}
                  className="mobile-auth-btn mobile-auth-secondary"
                  style={{ width: '100%', marginBottom: '8px' }}
                >
                  {t('navbar.signIn')}
                </button>
                <button
                  onClick={handleLogin}
                  className="mobile-auth-btn mobile-auth-primary"
                  style={{ width: '100%' }}
                >
                  {t('navbar.startFree')}
                </button>
              </>
            )}

            {/* Results Page Options */}
            {isResultsPage && (
              <>
                <div className="mobile-section-separator" />
                <button
                  className="mobile-nav-link"
                  style={{ opacity: 0.6, cursor: 'not-allowed' }}
                  disabled
                >
                  <svg className="mobile-menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                  </svg>
                  {t('navbar.exportPdf')}
                </button>
                <button
                  className="mobile-nav-link"
                  style={{ opacity: 0.6, cursor: 'not-allowed' }}
                  disabled
                >
                  <svg className="mobile-menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M12 13H8"/><path d="M12 17H8"/><path d="M16 13H8"/>
                  </svg>
                  {t('navbar.exportWord')}
                </button>
              </>
            )}

            {/* Log Out Button (Always Last) */}
            {user && (
              <>
                <div className="mobile-section-separator" />
                <button
                  onClick={handleLogout}
                  className="mobile-auth-btn mobile-auth-ghost"
                  style={{ width: '100%', justifyContent: 'flex-start', paddingLeft: '20px' }}
                >
                  <svg className="mobile-menu-icon" style={{ marginLeft: '-8px' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  {t('navbar.logout')}
                </button>
              </>
            )}
          </div>
        )}
      </nav>
    </>
  );
}
