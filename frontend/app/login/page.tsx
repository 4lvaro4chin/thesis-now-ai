'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { useTranslation } from '@/lib/useTranslation';

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
  const [showEmailForm, setShowEmailForm] = useState(false);
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

            {/* OAuth Buttons - First Priority */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
              <button
                type="button"
                onClick={() => {
                  const supabase = createClient();
                  supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: { redirectTo: `${window.location.origin}/auth/callback` }
                  });
                }}
                style={{
                  width: "100%",
                  padding: "11px 16px",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#1F2937",
                  background: "#F3F4F6",
                  border: "1.5px solid #E5E7EB",
                  borderRadius: "10px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#E5E7EB";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#F3F4F6";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>

              <button
                type="button"
                onClick={() => {
                  const supabase = createClient();
                  supabase.auth.signInWithOAuth({
                    provider: 'github',
                    options: { redirectTo: `${window.location.origin}/auth/callback` }
                  });
                }}
                style={{
                  width: "100%",
                  padding: "11px 16px",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#1F2937",
                  background: "#F3F4F6",
                  border: "1.5px solid #E5E7EB",
                  borderRadius: "10px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#E5E7EB";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#F3F4F6";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </button>

              <button
                type="button"
                onClick={() => {
                  const supabase = createClient();
                  supabase.auth.signInWithOAuth({
                    provider: 'linkedin',
                    options: { redirectTo: `${window.location.origin}/auth/callback` }
                  });
                }}
                style={{
                  width: "100%",
                  padding: "11px 16px",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#1F2937",
                  background: "#F3F4F6",
                  border: "1.5px solid #E5E7EB",
                  borderRadius: "10px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#E5E7EB";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#F3F4F6";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A66C2" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.475-2.236-1.986-2.236-1.081 0-1.722.731-2.004 1.438-.103.25-.129.599-.129.948v5.419h-3.554s.05-8.736 0-9.646h3.554v1.364c.43-.66 1.191-1.599 2.905-1.599 2.121 0 3.71 1.388 3.71 4.374v5.507zM5.337 8.855c-1.144 0-1.915-.759-1.915-1.71 0-.951.77-1.71 1.954-1.71 1.182 0 1.915.759 1.915 1.71 0 .951-.733 1.71-1.954 1.71zm1.581 11.597H3.715V9.505h3.203v10.947zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowEmailForm(!showEmailForm);
                  setError('');
                }}
                style={{
                  width: "100%",
                  padding: "11px 16px",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#1F2937",
                  background: "#F3F4F6",
                  border: "1.5px solid #E5E7EB",
                  borderRadius: "10px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#E5E7EB";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#F3F4F6";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20 6L12 13 4 6" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Email
              </button>
            </div>

            {showEmailForm && (
              <>
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
              </>
            )}

            {/* Email Form - Expandable */}
            {showEmailForm && (
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
            )}

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
