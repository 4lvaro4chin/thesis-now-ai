'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { useTranslation } from '@/lib/useTranslation';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import type { User } from '@supabase/supabase-js';

interface NavbarProps {
  user: User | null;
}

export function Navbar({ user: initialUser }: NavbarProps) {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState(initialUser);
  const [mounted, setMounted] = useState(false);
  const { t, lang } = useTranslation();

  useEffect(() => {
    setMounted(true);

    // Listen for auth changes
    const subscription = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (event === 'SIGNED_OUT') {
        router.push('/');
      }
    });

    return () => {
      subscription?.data?.subscription?.unsubscribe();
    };
  }, [supabase, router]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleLogin = () => {
    router.push('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-8 md:px-12 h-16 bg-white/95 backdrop-blur-md border-b border-[var(--border)]">
      {/* Logo */}
      <a href={user ? '/search' : '/'} className="flex items-center gap-2.5 no-underline group" style={{ marginLeft: '12px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: '#1D9E75'
        }}>
          <span style={{
            color: '#FFFFFF',
            fontSize: '14px',
            fontWeight: 'bold',
            fontFamily: "'DM Sans', sans-serif"
          }}>T</span>
        </div>
        <span style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '16px',
          fontWeight: 600,
          letterSpacing: '-0.5px'
        }}>
          <span style={{ color: '#04342C' }}>Thesis</span>
          <span style={{ color: '#1D9E75' }}>Now</span>
        </span>
      </a>

      {/* Navigation Links */}
      <ul style={{ display: 'none', gap: '32px', listStyle: 'none', margin: 0, padding: 0 }} className="md:flex">
        <li>
          <a
            href="/#features"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '14px',
              fontWeight: 500,
              color: '#6B7280',
              textDecoration: 'none',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#1B2A4A'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#6B7280'; }}
          >
            Cómo funciona
          </a>
        </li>
        <li>
          <a
            href="/#databases"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '14px',
              fontWeight: 500,
              color: '#6B7280',
              textDecoration: 'none',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#1B2A4A'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#6B7280'; }}
          >
            Bases de datos
          </a>
        </li>
        <li>
          <a
            href="/pricing"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '14px',
              fontWeight: 500,
              color: '#6B7280',
              textDecoration: 'none',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#1B2A4A'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#6B7280'; }}
          >
            Precios
          </a>
        </li>
      </ul>

      {/* Language Switcher + Auth Buttons */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', paddingRight: '8px' }} className="sm:pr-0">
        {mounted && <LanguageSwitcher currentLang={lang} />}

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        {user ? (
          <>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              paddingLeft: '12px',
              paddingRight: '12px',
              paddingTop: '6px',
              paddingBottom: '6px',
              borderRadius: '10px',
              backgroundColor: 'rgba(29, 158, 117, 0.08)'
            }} className="hidden sm:flex">
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#1D9E75'
              }} />
              <span style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '12px',
                fontWeight: 600,
                color: '#1B2A4A'
              }}>{user.email?.split('@')[0]}</span>
            </div>
            <button
              onClick={handleLogout}
              style={{
                padding: '10px 16px',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '13px',
                fontWeight: 600,
                color: '#DC2626',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1.5px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {t('navbar.logout')}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleLogin}
              style={{
                padding: '10px 16px',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '13px',
                fontWeight: 600,
                color: '#1D9E75',
                background: 'transparent',
                border: '1.5px solid #1D9E75',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(29, 158, 117, 0.1)';
                e.currentTarget.style.borderColor = '#0F6E56';
                e.currentTarget.style.color = '#0F6E56';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = '#1D9E75';
                e.currentTarget.style.color = '#1D9E75';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {t('navbar.signIn')}
            </button>
            <button
              onClick={handleLogin}
              style={{
                padding: '10px 20px',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '13px',
                fontWeight: 600,
                color: 'white',
                background: '#1D9E75',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(29, 158, 117, 0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#0F6E56';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(29, 158, 117, 0.4)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#1D9E75';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(29, 158, 117, 0.3)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {t('navbar.startFree')}
            </button>
          </>
        )}
        </div>
      </div>
    </nav>
  );
}
