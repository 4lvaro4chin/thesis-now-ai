'use client';

import Link from "next/link";
import { useAuthProtection } from "@/lib/useAuthProtection";

export default function SearchingPage() {
  useAuthProtection();
  const databases = [
    { name: "PubMed", progress: 85, status: "searching" as const, count: 234 },
    { name: "ScienceDirect", progress: 60, status: "searching" as const, count: 156 },
    { name: "Google Scholar", progress: 40, status: "searching" as const, count: 0 },
    { name: "JSTOR", progress: 100, status: "done" as const, count: 89 },
    { name: "arXiv", progress: 30, status: "searching" as const, count: 0 },
    { name: "Web of Science", progress: 0, status: "waiting" as const, count: 0 },
  ];

  const totalFound = databases.reduce((sum, db) => sum + db.count, 0);

  return (
    <div style={{ minHeight: "100vh", background: "#04342C", paddingTop: "72px", paddingBottom: "72px", display: "flex", alignItems: "center" }}>
      {/* Noise overlay */}
      <div style={{
        position: "absolute",
        inset: 0,
        opacity: 0.6,
        pointerEvents: "none",
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E\")",
        backgroundSize: "512px"
      }} />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "1100px", margin: "0 auto", padding: "0 48px", textAlign: "center" }}>
        {/* Header */}
        <h1 style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "clamp(26px, 3vw, 34px)",
          fontWeight: 600,
          color: "white",
          letterSpacing: "-0.7px",
          lineHeight: 1.2,
          marginBottom: "16px",
          textWrap: "balance"
        }}>
          Búsqueda en progreso
        </h1>
        <p style={{
          fontSize: "15px",
          color: "rgba(255,255,255,0.6)",
          marginBottom: "48px"
        }}>
          Estamos buscando en múltiples bases de datos...
        </p>

        {/* Loader Animation */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "8px",
          marginBottom: "48px"
        }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: "8px",
                height: "8px",
                backgroundColor: "#5DCAA5",
                borderRadius: "50%",
                animation: `bounce 1.4s infinite ease-in-out`,
                animationDelay: `${i * 0.16}s`
              }}
            />
          ))}
        </div>

        {/* Progress Cards */}
        <div style={{
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "12px",
          padding: "32px",
          marginBottom: "32px"
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
            {databases.map((db) => (
              <div key={db.name}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "8px"
                }}>
                  <span style={{
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "white"
                  }}>
                    {db.name}
                  </span>
                  <span style={{
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.6)"
                  }}>
                    {db.status === "done" && `${db.count} artículos`}
                    {db.status === "searching" && "Buscando..."}
                    {db.status === "waiting" && "Esperando..."}
                  </span>
                </div>
                <div style={{
                  position: "relative",
                  width: "100%",
                  height: "6px",
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: "3px",
                  overflow: "hidden"
                }}>
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      height: "100%",
                      backgroundColor: db.status === "done" ? "#1D9E75" : "#5DCAA5",
                      width: `${db.progress}%`,
                      transition: "width 0.3s ease-out",
                      borderRadius: "3px",
                      opacity: db.status === "searching" ? 0.7 : 1
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div style={{
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "12px",
          padding: "32px",
          marginBottom: "32px",
          textAlign: "center"
        }}>
          <div style={{
            fontSize: "48px",
            fontWeight: 600,
            color: "white",
            marginBottom: "8px",
            fontVariantNumeric: "tabular-nums"
          }}>
            {totalFound}
          </div>
          <p style={{
            fontSize: "14px",
            color: "rgba(255,255,255,0.6)"
          }}>
            artículos encontrados hasta ahora
          </p>
        </div>

        {/* Estimated Time */}
        <p style={{
          fontSize: "12px",
          color: "rgba(255,255,255,0.5)",
          marginBottom: "32px"
        }}>
          Tiempo estimado: ~2 minutos 15 segundos
        </p>

        {/* Skip Button */}
        <Link
          href="/results"
          style={{
            padding: "12px 28px",
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: "8px",
            textDecoration: "none",
            color: "white",
            fontSize: "14px",
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 0.18s",
            display: "inline-block"
          }}
        >
          Ver resultados provisionales
        </Link>

        <style>{`
          @keyframes bounce {
            0%, 80%, 100% { opacity: 0.4; }
            40% { opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );
}
