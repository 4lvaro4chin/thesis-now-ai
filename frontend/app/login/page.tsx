'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

type Tab = 'login' | 'signup';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [tab, setTab] = useState<Tab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (tab === 'login') {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (signUpError) throw signUpError;
      }

      router.push('/search');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Auth error';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #04342C 0%, #0a4a38 50%, #04342C 100%)',
      }}
    >
      {/* Decorative blur blobs */}
      <div
        className="absolute top-20 -left-40 w-80 h-80 rounded-full blur-3xl opacity-20"
        style={{ backgroundColor: '#1D9E75' }}
      />
      <div
        className="absolute bottom-20 -right-40 w-80 h-80 rounded-full blur-3xl opacity-20"
        style={{ backgroundColor: '#1D9E75' }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Logo Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4" style={{ backgroundColor: 'rgba(29, 158, 117, 0.2)', border: '1px solid rgba(29, 158, 117, 0.4)' }}>
            <span style={{ color: '#1D9E75', fontSize: '20px', fontWeight: 'bold' }}>T</span>
          </div>
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#FFFFFF', fontFamily: 'DM Sans' }}>
            ThesisNow
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
            Tu revisión bibliográfica en minutos
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8 backdrop-blur-xl border shadow-2xl"
          style={{
            backgroundColor: 'rgba(11, 51, 43, 0.6)',
            borderColor: 'rgba(29, 158, 117, 0.3)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          }}
        >
          {/* Tab Navigation */}
          <div className="flex gap-3 mb-8 p-1 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
            {(['login', 'signup'] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTab(t);
                  setError('');
                }}
                className="flex-1 py-2.5 px-4 rounded-md font-medium text-sm transition-all duration-200"
                style={
                  tab === t
                    ? {
                        backgroundColor: '#1D9E75',
                        color: '#FFFFFF',
                        boxShadow: '0 4px 12px rgba(29, 158, 117, 0.3)',
                      }
                    : {
                        backgroundColor: 'transparent',
                        color: 'rgba(255, 255, 255, 0.6)',
                      }
                }
              >
                {t === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
              </button>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div
              className="mb-6 p-3.5 rounded-lg text-sm border"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: '#FCA5A5',
                borderColor: 'rgba(239, 68, 68, 0.3)',
              }}
            >
              <p style={{ fontWeight: '500' }}>Error</p>
              <p style={{ fontSize: '13px', marginTop: '4px' }}>{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                Correo electrónico
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  borderColor: email ? 'rgba(29, 158, 117, 0.5)' : 'rgba(255, 255, 255, 0.15)',
                  border: '1.5px solid',
                  color: '#FFFFFF',
                }}
                placeholder="tu@email.com"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                Contraseña
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  borderColor: password ? 'rgba(29, 158, 117, 0.5)' : 'rgba(255, 255, 255, 0.15)',
                  border: '1.5px solid',
                  color: '#FFFFFF',
                }}
                placeholder="••••••••"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-semibold text-sm transition-all duration-200 mt-6 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                backgroundColor: loading ? 'rgba(29, 158, 117, 0.7)' : '#1D9E75',
                color: '#FFFFFF',
                boxShadow: '0 8px 24px rgba(29, 158, 117, 0.3)',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading
                ? tab === 'login'
                  ? 'Iniciando sesión...'
                  : 'Creando cuenta...'
                : tab === 'login'
                  ? 'Iniciar sesión'
                  : 'Crear cuenta'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
            <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '12px', fontWeight: '500' }}>o</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
          </div>

          {/* Login Link */}
          <p className="text-center text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            {tab === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
            <button
              type="button"
              onClick={() => {
                setTab(tab === 'login' ? 'signup' : 'login');
                setError('');
              }}
              className="font-semibold hover:underline"
              style={{ color: '#1D9E75' }}
            >
              {tab === 'login' ? 'Crear una' : 'Inicia sesión'}
            </button>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs mt-8" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
          Al continuar aceptas nuestros{' '}
          <a href="#" className="hover:underline" style={{ color: 'rgba(29, 158, 117, 0.8)' }}>
            Términos de Servicio
          </a>
          {' '}y{' '}
          <a href="#" className="hover:underline" style={{ color: 'rgba(29, 158, 117, 0.8)' }}>
            Política de Privacidad
          </a>
        </p>
      </div>
    </div>
  );
}
