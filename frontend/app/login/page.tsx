'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { useTranslation } from '@/lib/i18n';

type Tab = 'login' | 'signup';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [tab, setTab] = useState<Tab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    setMounted(true);
  }, []);

  const mapErrorMessage = (errorMsg: string): string => {
    if (errorMsg.includes('Invalid login credentials')) return t('error.invalidCredentials');
    if (errorMsg.includes('User not found')) return t('error.userNotFound');
    if (errorMsg.includes('weak password')) return t('error.weakPassword');
    if (errorMsg.includes('already registered')) return t('error.emailInUse');
    if (errorMsg.includes('network')) return t('error.networkError');
    return t('error.default');
  };

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
      setError(mapErrorMessage(message));
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <section className="relative bg-green-900 overflow-hidden min-h-screen flex items-center justify-center pt-20 pb-16 md:pt-24 md:pb-20">
      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-60 pointer-events-none" style={{
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E\")",
        backgroundSize: "512px"
      }} />

      {/* Radial glows */}
      <div className="absolute top-20 right-0 w-96 h-96 rounded-full pointer-events-none opacity-20" style={{
        background: "radial-gradient(circle, rgba(29,158,117,0.3) 0%, transparent 65%)",
        transform: "translate(80px, -100px)"
      }} />
      <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full pointer-events-none opacity-15" style={{
        background: "radial-gradient(circle, rgba(93,202,165,0.2) 0%, transparent 65%)",
        transform: "translate(-60px, 80px)"
      }} />

      {/* Content */}
      <div className="relative z-10 w-full px-6 sm:px-8" style={{ maxWidth: "480px", margin: "0 auto" }}>
        {/* Logo & Heading */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6" style={{
            background: "rgba(29, 158, 117, 0.2)",
            border: "1.5px solid rgba(29, 158, 117, 0.5)",
            backdropFilter: "blur(10px)"
          }}>
            <span style={{
              color: "#1D9E75",
              fontSize: "24px",
              fontWeight: "bold",
              fontFamily: "'DM Sans', sans-serif"
            }}>T</span>
          </div>

          <h1 style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "clamp(32px, 5vw, 48px)",
            fontWeight: 600,
            color: "white",
            lineHeight: 1.05,
            letterSpacing: "-1px",
            marginBottom: "12px"
          }}>
            {tab === 'login' ? t('login.welcome') : t('login.createAccount')}
          </h1>

          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "18px",
            color: "rgba(255, 255, 255, 0.7)",
            fontStyle: "italic",
            lineHeight: 1.4,
            marginBottom: "32px"
          }}>
            {tab === 'login'
              ? t('login.subtitle.login')
              : t('login.subtitle.signup')}
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: "white",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 12px 48px rgba(0,0,0,0.25)",
          border: "1px solid rgba(255,255,255,0.1)"
        }}>
          {/* Tab Navigation */}
          <div style={{
            display: "flex",
            borderBottom: "1px solid #E5E7EB",
            background: "#F9FAFB"
          }}>
            {(['login', 'signup'] as const).map((tabKey) => (
              <button
                key={tabKey}
                onClick={() => {
                  setTab(tabKey);
                  setError('');
                }}
                style={{
                  flex: 1,
                  padding: "16px 20px",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "14px",
                  fontWeight: 600,
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  color: tab === tabKey ? "#1D9E75" : "#9CA3AF",
                  borderBottom: tab === tabKey ? "3px solid #1D9E75" : "3px solid transparent",
                  transition: "all 0.2s"
                }}
              >
                {tabKey === 'login' ? t('login.signIn') : t('login.signUp')}
              </button>
            ))}
          </div>

          {/* Form Content */}
          <div style={{ padding: "32px 28px" }}>
            {/* Error Message */}
            {error && (
              <div style={{
                marginBottom: "20px",
                padding: "14px 16px",
                borderRadius: "12px",
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#DC2626",
                fontSize: "13px",
                fontFamily: "'DM Sans', sans-serif"
              }}>
                <strong>Error:</strong> {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleEmailAuth} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {/* Email Input */}
              <div>
                <label style={{
                  display: "block",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#1F2937",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}>
                  {t('login.email')}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "14px",
                    border: "1.5px solid #E5E7EB",
                    borderRadius: "10px",
                    background: "#F9FAFB",
                    color: "#1F2937",
                    outline: "none",
                    transition: "all 0.2s",
                    boxSizing: "border-box"
                  }}
                  placeholder="tu@email.com"
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#1D9E75";
                    e.currentTarget.style.background = "white";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(29, 158, 117, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#E5E7EB";
                    e.currentTarget.style.background = "#F9FAFB";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* Password Input */}
              <div>
                <label style={{
                  display: "block",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#1F2937",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}>
                  {t('login.password')}
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "14px",
                    border: "1.5px solid #E5E7EB",
                    borderRadius: "10px",
                    background: "#F9FAFB",
                    color: "#1F2937",
                    outline: "none",
                    transition: "all 0.2s",
                    boxSizing: "border-box"
                  }}
                  placeholder="••••••••"
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#1D9E75";
                    e.currentTarget.style.background = "white";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(29, 158, 117, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#E5E7EB";
                    e.currentTarget.style.background = "#F9FAFB";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: "14px 20px",
                  marginTop: "8px",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "white",
                  background: loading ? "rgba(29, 158, 117, 0.7)" : "#1D9E75",
                  border: "none",
                  borderRadius: "10px",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                  boxShadow: "0 4px 12px rgba(29, 158, 117, 0.3)",
                  opacity: loading ? 0.7 : 1
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.background = "#0F6E56";
                    e.currentTarget.style.boxShadow = "0 8px 20px rgba(29, 158, 117, 0.4)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.background = "#1D9E75";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(29, 158, 117, 0.3)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }
                }}
              >
                {loading
                  ? tab === 'login'
                    ? t('login.signingIn')
                    : t('login.signingUp')
                  : tab === 'login'
                    ? t('login.signIn')
                    : t('login.signUp')}
              </button>
            </form>

            {/* Divider */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              margin: "24px 0",
              color: "#D1D5DB",
              fontSize: "12px",
              fontFamily: "'DM Sans', sans-serif"
            }}>
              <div style={{ flex: 1, height: "1px", background: "#E5E7EB" }} />
              <span>o</span>
              <div style={{ flex: 1, height: "1px", background: "#E5E7EB" }} />
            </div>

            {/* Toggle Link */}
            <p style={{
              textAlign: "center",
              fontSize: "14px",
              color: "#6B7280",
              fontFamily: "'DM Sans', sans-serif",
              margin: 0
            }}>
              {tab === 'login' ? t('login.noAccount') + ' ' : t('login.haveAccount') + ' '}
              <button
                type="button"
                onClick={() => {
                  setTab(tab === 'login' ? 'signup' : 'login');
                  setError('');
                }}
                style={{
                  fontWeight: 600,
                  color: "#1D9E75",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "14px",
                  transition: "color 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#0F6E56";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#1D9E75";
                }}
              >
                {tab === 'login' ? t('login.createOne') : t('login.signInInstead')}
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p style={{
          textAlign: "center",
          fontSize: "12px",
          color: "rgba(255, 255, 255, 0.6)",
          fontFamily: "'DM Sans', sans-serif",
          marginTop: "24px",
          lineHeight: 1.5
        }}>
          {t('login.accept')}{' '}
          <a href="#" style={{
            color: "rgba(29, 158, 117, 0.9)",
            textDecoration: "none",
            fontWeight: 500,
            transition: "color 0.2s"
          }} onMouseEnter={(e) => { e.currentTarget.style.color = "#1D9E75"; }} onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(29, 158, 117, 0.9)"; }}>
            {t('login.terms')}
          </a>
          {' '}{t('login.and')}{' '}
          <a href="#" style={{
            color: "rgba(29, 158, 117, 0.9)",
            textDecoration: "none",
            fontWeight: 500,
            transition: "color 0.2s"
          }} onMouseEnter={(e) => { e.currentTarget.style.color = "#1D9E75"; }} onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(29, 158, 117, 0.9)"; }}>
            {t('login.privacy')}
          </a>
        </p>
      </div>
    </section>
  );
}
