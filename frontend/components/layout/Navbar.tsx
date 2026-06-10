'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

interface NavbarProps {
  user: User | null;
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleLogin = () => {
    router.push('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-8 md:px-12 h-16 bg-white/95 backdrop-blur-md border-b border-[var(--border)]">
      {/* Logo */}
      <a href="/" className="flex items-center gap-2 no-underline group">
        <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg" style={{ backgroundColor: '#1D9E75' }}>
          <span style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 'bold' }}>T</span>
        </div>
        <span className="text-lg font-bold -tracking-wide text-navy hidden sm:inline">ThesisNow</span>
      </a>

      {/* Navigation Links */}
      <ul className="hidden md:flex gap-8 list-none">
        <li>
          <a
            href="/#features"
            className="text-sm font-medium text-text-muted hover:text-navy transition-colors duration-200"
          >
            Cómo funciona
          </a>
        </li>
        <li>
          <a
            href="/#databases"
            className="text-sm font-medium text-text-muted hover:text-navy transition-colors duration-200"
          >
            Bases de datos
          </a>
        </li>
        <li>
          <a
            href="/pricing"
            className="text-sm font-medium text-text-muted hover:text-navy transition-colors duration-200"
          >
            Precios
          </a>
        </li>
      </ul>

      {/* Auth Buttons */}
      <div className="flex gap-3 items-center">
        {user ? (
          <>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ backgroundColor: 'rgba(29, 158, 117, 0.08)' }}>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#1D9E75' }} />
              <span className="text-xs font-medium text-navy">{user.email?.split('@')[0]}</span>
            </div>
            <button
              onClick={handleLogout}
              className="px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                color: '#DC2626',
                border: '1px solid rgba(239, 68, 68, 0.2)',
              }}
            >
              Salir
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleLogin}
              className="px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200"
              style={{
                color: '#1D9E75',
                backgroundColor: 'transparent',
                border: '1.5px solid #1D9E75',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(29, 158, 117, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              Iniciar sesión
            </button>
            <button
              onClick={handleLogin}
              className="px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-white transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
              style={{
                backgroundColor: '#1D9E75',
                boxShadow: '0 4px 12px rgba(29, 158, 117, 0.3)',
              }}
            >
              Empezar gratis
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
