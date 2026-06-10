'use client';

import { useState } from "react";
import Link from "next/link";
import { useAuthProtection } from "@/lib/useAuthProtection";

export default function SearchPage() {
  useAuthProtection();
  const [selectedOperators, setSelectedOperators] = useState<string[]>(["AND"]);
  const [selectedDatabases, setSelectedDatabases] = useState<Record<string, boolean>>({
    pubmed: true,
    sciencedirect: true,
    scholar: true,
    jstor: true,
    arxiv: true,
    wos: true,
  });

  const toggleOperator = (op: string) => {
    setSelectedOperators((prev) =>
      prev.includes(op) ? prev.filter((x) => x !== op) : [...prev, op]
    );
  };

  const toggleDatabase = (db: string, value: boolean) => {
    setSelectedDatabases((prev) => ({ ...prev, [db]: value }));
  };

  const operatorConfig: Record<string, { bg: string; text: string; desc: string }> = {
    AND: { bg: "#E1F5EE", text: "#0F6E56", desc: "Incluye todos los términos" },
    OR: { bg: "#EBF4FD", text: "#1B6FA8", desc: "Incluye alguno de los términos" },
    NOT: { bg: "#FEF0EC", text: "#A33820", desc: "Excluye el término" },
    TRUNC: { bg: "#FDF4E3", text: "#8A5100", desc: "Busca palabras con prefijo" },
  };

  return (
    <div style={{ minHeight: "100vh", background: "#FFFFFF", paddingTop: "72px", paddingBottom: "72px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 48px" }}>
        {/* Header */}
        <div style={{ marginBottom: "64px" }}>
          <p style={{
            fontSize: "11px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "#1D9E75",
            marginBottom: "10px"
          }}>
            Constructor
          </p>
          <h1 style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "clamp(26px, 3vw, 34px)",
            fontWeight: 600,
            color: "#1B2A4A",
            letterSpacing: "-0.7px",
            lineHeight: 1.2,
            marginBottom: "16px"
          }}>
            Construye tu búsqueda
          </h1>
          <p style={{
            fontSize: "15px",
            color: "#6B7280",
            lineHeight: 1.65,
            maxWidth: "56ch"
          }}>
            Ajusta los operadores booleanos y selecciona las bases de datos donde buscar.
          </p>
        </div>

        {/* Boolean Operators Section */}
        <div style={{ marginBottom: "80px" }}>
          <h2 style={{
            fontSize: "18px",
            fontWeight: 600,
            color: "#1B2A4A",
            marginBottom: "16px",
            letterSpacing: "-0.3px"
          }}>
            Operadores booleanos
          </h2>
          <p style={{
            fontSize: "14px",
            color: "#6B7280",
            marginBottom: "24px"
          }}>
            Usa estos operadores para refinar tu búsqueda:
          </p>

          {/* Chips Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            gap: "12px",
            marginBottom: "24px"
          }}>
            {Object.entries(operatorConfig).map(([op, config]) => (
              <button
                key={op}
                onClick={() => toggleOperator(op)}
                style={{
                  padding: "12px 16px",
                  backgroundColor: config.bg,
                  color: config.text,
                  border: selectedOperators.includes(op) ? `2px solid ${config.text}` : "1px solid transparent",
                  borderRadius: "6px",
                  fontFamily: "monospace",
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.18s",
                  transform: selectedOperators.includes(op) ? "scale(0.95)" : "scale(1)",
                  textAlign: "center"
                }}
              >
                {op}
              </button>
            ))}
          </div>

          {/* Legend */}
          <div style={{
            background: "#F0FBF7",
            border: "1px solid #E1F5EE",
            borderRadius: "8px",
            padding: "24px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px"
          }}>
            {Object.entries(operatorConfig).map(([op, config]) => (
              <div key={op}>
                <div style={{
                  fontWeight: 600,
                  color: config.text,
                  fontSize: "13px",
                  marginBottom: "4px"
                }}>
                  {op}:
                </div>
                <div style={{
                  fontSize: "13px",
                  color: "#6B7280"
                }}>
                  {config.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Databases Section */}
        <div style={{ marginBottom: "80px" }}>
          <h2 style={{
            fontSize: "18px",
            fontWeight: 600,
            color: "#1B2A4A",
            marginBottom: "16px",
            letterSpacing: "-0.3px"
          }}>
            Bases de datos
          </h2>
          <p style={{
            fontSize: "14px",
            color: "#6B7280",
            marginBottom: "24px"
          }}>
            Selecciona dónde deseas buscar:
          </p>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
            marginBottom: "32px"
          }}>
            {[
              { id: "pubmed", label: "PubMed" },
              { id: "sciencedirect", label: "ScienceDirect" },
              { id: "scholar", label: "Google Scholar" },
              { id: "jstor", label: "JSTOR" },
              { id: "arxiv", label: "arXiv" },
              { id: "wos", label: "Web of Science" },
            ].map((db) => (
              <label
                key={db.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  cursor: "pointer",
                  padding: "12px",
                  borderRadius: "8px",
                  transition: "background 0.18s",
                  background: selectedDatabases[db.id] ? "#F0FBF7" : "transparent"
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedDatabases[db.id]}
                  onChange={(e) => toggleDatabase(db.id, e.target.checked)}
                  style={{
                    width: "20px",
                    height: "20px",
                    cursor: "pointer",
                    accentColor: "#1D9E75"
                  }}
                />
                <span style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: selectedDatabases[db.id] ? "#0F6E56" : "#6B7280",
                  transition: "color 0.18s"
                }}>
                  {db.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* CTA Buttons */}
        <div style={{
          display: "flex",
          gap: "12px",
          justifyContent: "center",
          flexWrap: "wrap"
        }}>
          <Link
            href="/"
            style={{
              padding: "12px 28px",
              background: "transparent",
              border: "1px solid #E8EDEB",
              borderRadius: "8px",
              textDecoration: "none",
              color: "#6B7280",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.18s",
              textAlign: "center"
            }}
          >
            Volver
          </Link>
          <Link
            href="/searching"
            style={{
              padding: "12px 28px",
              background: "#1D9E75",
              border: "none",
              borderRadius: "8px",
              textDecoration: "none",
              color: "white",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "background 0.18s",
              boxShadow: "0 2px 8px rgba(29,158,117,0.3)",
              textAlign: "center"
            }}
          >
            Ejecutar búsqueda
          </Link>
        </div>
      </div>
    </div>
  );
}
