'use client';

import Link from "next/link";
import { useTranslation } from "@/lib/useTranslation";

export default function Home() {
  const { t } = useTranslation();

  const steps = [
    { num: "1", title: t('home.step1.title'), desc: t('home.step1.desc') },
    { num: "2", title: t('home.step2.title'), desc: t('home.step2.desc') },
    { num: "3", title: t('home.step3.title'), desc: t('home.step3.desc') },
    { num: "4", title: t('home.step4.title'), desc: t('home.step4.desc') }
  ];

  const stats = [
    { value: "2", label: t('home.stats.databases') },
    { value: "<3m", label: t('home.stats.search') },
    { value: "100%", label: t('home.stats.automated') }
  ];

  return (
    <>
      {/* HERO — Elegancia académica + modernidad audaz */}
      <section className="relative overflow-hidden pt-32 pb-24 md:pt-40 md:pb-32" style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        background: "var(--white)"
      }}>
        {/* Fondo sutil: línea vertical decorativa derecha */}
        <div className="absolute right-0 top-0 bottom-0 w-px" style={{ background: "var(--border)" }} />

        <div className="relative z-10 max-w-7xl mx-auto w-full px-6 md:px-12">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "center" }}>

            {/* LEFT: Texto dramático */}
            <div>
              {/* Eyebrow: pequeño, elegante */}
              <p style={{
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                marginBottom: "24px"
              }}>
                {t('home.eyebrow')}
              </p>

              {/* H1: Cormorant GRANDE, navy, dramático */}
              <h1 style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(52px, 7vw, 96px)",
                fontWeight: 700,
                color: "var(--navy)",
                lineHeight: 1.1,
                letterSpacing: "-2px",
                marginBottom: "28px",
                textWrap: "balance"
              }}>
                {t('home.title')}
              </h1>

              {/* Descripción: text-muted, legible */}
              <p style={{
                fontSize: "18px",
                color: "var(--text-muted)",
                lineHeight: 1.7,
                marginBottom: "40px",
                maxWidth: "52ch"
              }}>
                {t('home.tagline')}
              </p>

              {/* CTA Button: verde, audaz, sin excesos */}
              <Link href="/search" style={{
                display: "inline-block",
                padding: "16px 40px",
                background: "var(--green-primary)",
                color: "var(--white)",
                fontSize: "15px",
                fontWeight: 600,
                textDecoration: "none",
                borderRadius: "6px",
                transition: "all 0.2s ease",
                border: "none",
                cursor: "pointer",
                letterSpacing: "0.3px"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--green-hover)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--green-primary)";
                e.currentTarget.style.transform = "translateY(0)";
              }}>
                {t('home.button.start')} →
              </Link>
            </div>

            {/* RIGHT: Espacio + stats */}
            <div style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: "48px"
            }}>
              {/* Hint: discreto */}
              <div style={{
                padding: "24px",
                background: "var(--bg)",
                borderRadius: "8px",
                border: "1px solid var(--border)"
              }}>
                <p style={{
                  fontSize: "13px",
                  color: "var(--text-muted)",
                  lineHeight: 1.6,
                  margin: 0
                }}>
                  <strong style={{ color: "var(--navy)" }}>Ejemplo:</strong> {t('home.hint.example')}
                </p>
              </div>

              {/* Stats: grandes, claros */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {stats.map((stat, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "baseline", gap: "16px" }}>
                    <span style={{
                      fontSize: "clamp(28px, 5vw, 48px)",
                      fontWeight: 700,
                      color: "var(--green-primary)",
                      fontVariantNumeric: "tabular-nums",
                      lineHeight: 1
                    }}>
                      {stat.value}
                    </span>
                    <span style={{
                      fontSize: "14px",
                      color: "var(--text-muted)",
                      letterSpacing: "0.05em"
                    }}>
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — Clean, vertical steps */}
      <section id="features" className="bg-white" style={{ padding: "96px 0" }}>
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          {/* Header */}
          <div style={{ marginBottom: "80px" }}>
            <p style={{
              fontSize: "12px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "var(--text-muted)",
              marginBottom: "16px"
            }}>
              {t('home.process.label')}
            </p>
            <h2 style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(36px, 5vw, 56px)",
              fontWeight: 700,
              color: "var(--navy)",
              lineHeight: 1.2,
              letterSpacing: "-1px",
              textWrap: "balance"
            }}>
              {t('home.process.title')}
            </h2>
          </div>

          {/* Steps: Vertical, minimal */}
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {steps.map((step, idx) => (
              <div
                key={step.num}
                style={{
                  display: "grid",
                  gridTemplateColumns: "80px 1fr",
                  gap: "40px",
                  padding: "40px 0",
                  borderBottom: idx < steps.length - 1 ? "1px solid var(--border)" : "none",
                  alignItems: "start"
                }}
              >
                {/* Number: verde grande */}
                <div style={{
                  fontSize: "64px",
                  fontWeight: 700,
                  color: "var(--green-primary)",
                  lineHeight: 1,
                  letterSpacing: "-2px",
                  fontVariantNumeric: "tabular-nums"
                }}>
                  {step.num}
                </div>

                {/* Content */}
                <div style={{ paddingTop: "8px" }}>
                  <h3 style={{
                    fontSize: "20px",
                    fontWeight: 600,
                    color: "var(--navy)",
                    marginBottom: "12px",
                    letterSpacing: "-0.3px"
                  }}>
                    {step.title}
                  </h3>
                  <p style={{
                    fontSize: "15px",
                    color: "var(--text-muted)",
                    lineHeight: 1.7,
                    maxWidth: "60ch"
                  }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DATABASES — Transparent approach */}
      <section id="databases" className="bg-white" style={{ padding: "96px 0", borderTop: "1px solid var(--border)" }}>
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          {/* Header */}
          <div style={{ marginBottom: "60px" }}>
            <p style={{
              fontSize: "12px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "var(--text-muted)",
              marginBottom: "16px"
            }}>
              {t('home.databases.label')}
            </p>
            <h2 style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(36px, 5vw, 56px)",
              fontWeight: 700,
              color: "var(--navy)",
              lineHeight: 1.2,
              letterSpacing: "-1px",
              marginBottom: "20px",
              textWrap: "balance"
            }}>
              {t('home.databases.title')}
            </h2>
            <p style={{
              fontSize: "15px",
              color: "var(--text-muted)",
              lineHeight: 1.7,
              maxWidth: "60ch"
            }}>
              Actualmente funcional: <strong style={{ color: "var(--navy)" }}>PubMed</strong> y <strong style={{ color: "var(--navy)" }}>Semantic Scholar</strong>. Más bases próximamente.
            </p>
          </div>

          {/* Logos: 2 main databases */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "32px"
          }}>
            {[
              { name: "PubMed", desc: "15M+ artículos biomédicos indexados" },
              { name: "Semantic Scholar", desc: "100M+ papers · IA-powered search" }
            ].map((db) => (
              <div
                key={db.name}
                style={{
                  padding: "32px",
                  background: "var(--white)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  textAlign: "center",
                  transition: "all 0.2s ease"
                }}
              >
                <div style={{
                  fontSize: "18px",
                  fontWeight: 600,
                  color: "var(--navy)",
                  marginBottom: "12px"
                }}>
                  {db.name}
                </div>
                <p style={{
                  fontSize: "13px",
                  color: "var(--text-muted)",
                  lineHeight: 1.6

                }}>
                  {db.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
