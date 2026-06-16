'use client';

import Link from "next/link";
import { useTranslation } from "@/lib/useTranslation";
import { useState } from "react";

export default function Home() {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');

  const steps = [
    { num: "1", title: t('home.step1.title'), desc: t('home.step1.desc') },
    { num: "2", title: t('home.step2.title'), desc: t('home.step2.desc') },
    { num: "3", title: t('home.step3.title'), desc: t('home.step3.desc') },
    { num: "4", title: t('home.step4.title'), desc: t('home.step4.desc') }
  ];

  const stats = [
    { value: "15+", label: t('home.stats.databases') },
    { value: "<3 min", label: t('home.stats.search') },
    { value: "100%", label: t('home.stats.automated') }
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-green-900 overflow-hidden pt-20 pb-16 md:pt-24 md:pb-20" style={{ minHeight: "100dvh", display: "flex", alignItems: "center" }}>
        {/* Noise texture overlay */}
        <div className="absolute inset-0 opacity-60 pointer-events-none" style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E\")",
          backgroundSize: "512px"
        }} />

        {/* Radial glows */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none opacity-20" style={{
          background: "radial-gradient(circle, rgba(29,158,117,0.3) 0%, transparent 65%)",
          transform: "translate(80px, -100px)"
        }} />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full pointer-events-none opacity-15" style={{
          background: "radial-gradient(circle, rgba(93,202,165,0.2) 0%, transparent 65%)",
          transform: "translate(-60px, 80px)"
        }} />

        {/* Content */}
        <div className="relative z-10 w-full text-center" style={{ maxWidth: "720px", margin: "0 auto", padding: "0 24px" }}>
          {/* Eyebrow */}
          <div className="flex items-center justify-center gap-2 mb-8" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(159,225,203,1)" }}>
            <div className="w-5 h-px bg-green-400" />
            <span>{t('home.eyebrow')}</span>
            <div className="w-5 h-px bg-green-400" />
          </div>

          {/* H1 */}
          <h1 style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "clamp(44px, 6vw, 68px)",
            fontWeight: 600,
            color: "white",
            lineHeight: 1.05,
            letterSpacing: "-2px",
            marginBottom: "16px",
            textWrap: "balance"
          }}>
            {t('home.title')}
          </h1>

          {/* Tagline */}
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            fontSize: "24px",
            color: "rgba(255,255,255,0.5)",
            marginBottom: "44px",
            lineHeight: 1.4,
            textWrap: "pretty"
          }}>
            {t('home.tagline')}
          </p>

          {/* Search Box */}
          <div className="mb-6" style={{
            maxWidth: "600px",
            margin: "0 auto 14px",
            display: "flex",
            background: "white",
            borderRadius: "12px",
            overflow: "hidden",
            border: "1.5px solid transparent",
            transition: "box-shadow 0.2s, border-color 0.2s",
            boxShadow: "0 4px 24px rgba(0,0,0,0.2)"
          }}>
            <input
              type="text"
              placeholder={t('home.input.placeholder')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && title.trim()) {
                  window.location.href = `/search?initialTitle=${encodeURIComponent(title)}`;
                }
              }}
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                padding: "15px 20px",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "14px",
                color: "#2D3748",
                background: "transparent"
              }}
            />
            <Link
              href={title.trim() ? `/search?initialTitle=${encodeURIComponent(title)}` : "/search"}
              style={{
                padding: "13px 24px",
                background: title.trim() ? "#1D9E75" : "#9CA3AF",
                border: "none",
                color: "white",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "14px",
                fontWeight: 500,
                cursor: title.trim() ? "pointer" : "not-allowed",
                transition: "background 0.18s",
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
                opacity: title.trim() ? 1 : 0.6
              }}
            >
              {t('home.button.start')}
            </Link>
          </div>

          {/* Hint */}
          <p style={{
            fontSize: "12px",
            color: "rgba(255,255,255,0.3)",
            letterSpacing: "0.03em",
            marginBottom: "60px"
          }}>
            {t('home.hint.prefix')} <strong style={{ color: "rgba(159,225,203,1)", fontWeight: 500 }}>{t('home.hint.example')}</strong>
          </p>

          {/* Stats */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: 0,
            paddingTop: "36px",
            borderTop: "1px solid rgba(255,255,255,0.08)"
          }}>
            {stats.map((stat, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  textAlign: "center",
                  padding: "0 24px",
                  borderRight: i < 2 ? "1px solid rgba(255,255,255,0.08)" : "none"
                }}
              >
                <div style={{
                  fontSize: "32px",
                  fontWeight: 600,
                  color: "white",
                  letterSpacing: "-1px",
                  display: "block",
                  fontVariantNumeric: "tabular-nums"
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.35)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginTop: "2px"
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="features" className="bg-white" style={{ maxWidth: "1100px", margin: "0 auto", padding: "72px 48px" }}>
        <div style={{ marginBottom: "48px" }}>
          <p style={{
            fontSize: "11px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "#1D9E75",
            marginBottom: "10px"
          }}>
            {t('home.process.label')}
          </p>
          <h2 style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "clamp(26px, 3vw, 34px)",
            fontWeight: 600,
            color: "#1B2A4A",
            letterSpacing: "-0.7px",
            lineHeight: 1.2,
            textWrap: "balance"
          }}>
            {t('home.process.title')}
          </h2>
        </div>

        {/* Timeline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {steps.map((step) => (
            <div
              key={step.num}
              style={{
                display: "grid",
                gridTemplateColumns: "80px 1fr",
                gap: "0 32px",
                padding: "32px 0",
                borderBottom: "1px solid #E8EDEB",
                alignItems: "start",
                transition: "background 0.2s"
              }}
            >
              <div style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "52px",
                fontWeight: 600,
                color: "#E8EDEB",
                lineHeight: 1,
                letterSpacing: "-2px",
                transition: "color 0.25s",
                fontVariantNumeric: "tabular-nums",
                paddingTop: "2px",
                cursor: "default"
              }} className="hover:text-green-500">
                {step.num}
              </div>
              <div style={{ paddingTop: "4px" }}>
                <h3 style={{
                  fontSize: "18px",
                  fontWeight: 600,
                  color: "#1B2A4A",
                  marginBottom: "8px",
                  letterSpacing: "-0.3px"
                }}>
                  {step.title}
                </h3>
                <p style={{
                  fontSize: "14px",
                  color: "#6B7280",
                  lineHeight: 1.7,
                  maxWidth: "56ch"
                }}>
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Databases Section */}
      <section id="databases" className="bg-green-50" style={{ maxWidth: "1100px", margin: "0 auto", padding: "72px 48px" }}>
        <div style={{ marginBottom: "48px" }}>
          <p style={{
            fontSize: "11px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "#1D9E75",
            marginBottom: "10px"
          }}>
            {t('home.databases.label')}
          </p>
          <h2 style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "clamp(26px, 3vw, 34px)",
            fontWeight: 600,
            color: "#1B2A4A",
            letterSpacing: "-0.7px",
            lineHeight: 1.2,
            textWrap: "balance"
          }}>
            {t('home.databases.title')}
          </h2>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "12px"
        }}>
          {[
            "PubMed", "ScienceDirect", "Google Scholar",
            "JSTOR", "arXiv", "Web of Science",
            "Scopus", "EBSCO", "IEEE Xplore",
            "ProQuest", "SpringerLink", "Taylor & Francis",
            "SSRN", "ResearchGate", "Semantic Scholar"
          ].map((db) => (
            <div
              key={db}
              style={{
                padding: "12px 16px",
                background: "white",
                border: "1px solid #E8EDEB",
                borderRadius: "8px",
                textAlign: "center",
                fontSize: "13px",
                fontWeight: 500,
                color: "#374151",
                transition: "all 0.2s",
                cursor: "default"
              }}
              className="hover:shadow-sm hover:border-green-300"
            >
              {db}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
