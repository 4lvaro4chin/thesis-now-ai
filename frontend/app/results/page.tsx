'use client';

import { useAuthProtection } from "@/lib/useAuthProtection";

export default function ResultsPage() {
  useAuthProtection();
  const mockArticles = [
    {
      id: 1,
      title: "Climate Change and Human Migration: A Comprehensive Analysis",
      authors: "Smith, J., Johnson, M., Williams, K.",
      year: 2023,
      database: "PubMed",
      relevance: "high" as const,
      abstract: "This study examines the relationship between climate change and human migration patterns across multiple continents...",
      doi: "10.1234/climate.2023.001",
    },
    {
      id: 2,
      title: "Environmental Factors Driving Population Displacement",
      authors: "Brown, A., Davis, L.",
      year: 2022,
      database: "ScienceDirect",
      relevance: "high" as const,
      abstract: "An investigation into the environmental determinants of forced migration and their global implications...",
      doi: "10.5678/env.2022.045",
    },
    {
      id: 3,
      title: "Migration Patterns in the Anthropocene",
      authors: "García, R., López, M., Chen, S.",
      year: 2023,
      database: "Google Scholar",
      relevance: "medium" as const,
      abstract: "This paper explores how human activities in the Anthropocene are reshaping migration dynamics...",
    },
  ];

  const relevanceConfig = {
    high: { bg: "#E1F5EE", text: "#0F6E56", label: "Alta" },
    medium: { bg: "#EBF4FD", text: "#1B6FA8", label: "Media" },
    low: { bg: "#FEF0EC", text: "#A33820", label: "Baja" },
  };

  return (
    <div style={{ minHeight: "100vh", background: "#FFFFFF", paddingTop: "72px", paddingBottom: "100px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 48px" }}>
        {/* Header */}
        <div style={{ marginBottom: "48px" }}>
          <h1 style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "clamp(26px, 3vw, 34px)",
            fontWeight: 600,
            color: "#1B2A4A",
            letterSpacing: "-0.7px",
            lineHeight: 1.2,
            marginBottom: "8px"
          }}>
            Resultados
          </h1>
          <p style={{
            fontSize: "14px",
            color: "#6B7280"
          }}>
            Se encontraron <span style={{ fontWeight: 600, color: "#1B2A4A" }}>847</span> artículos en 6 bases de datos
          </p>
        </div>

        {/* Filter Bar */}
        <div style={{
          display: "flex",
          gap: "12px",
          marginBottom: "32px",
          flexWrap: "wrap"
        }}>
          <select style={{
            padding: "10px 14px",
            border: "1px solid #E8EDEB",
            borderRadius: "8px",
            background: "white",
            fontSize: "13px",
            color: "#6B7280",
            cursor: "pointer",
            transition: "all 0.18s"
          }}>
            <option>Relevancia: Alta a Baja</option>
            <option>Año: Más reciente</option>
            <option>Año: Más antiguo</option>
          </select>
          <select style={{
            padding: "10px 14px",
            border: "1px solid #E8EDEB",
            borderRadius: "8px",
            background: "white",
            fontSize: "13px",
            color: "#6B7280",
            cursor: "pointer",
            transition: "all 0.18s"
          }}>
            <option>Todas las bases</option>
            <option>PubMed</option>
            <option>ScienceDirect</option>
            <option>Google Scholar</option>
          </select>
          <input
            type="search"
            placeholder="Filtrar por palabra clave..."
            style={{
              flex: 1,
              minWidth: "200px",
              padding: "10px 14px",
              border: "1px solid #E8EDEB",
              borderRadius: "8px",
              background: "white",
              fontSize: "13px",
              color: "#6B7280",
              transition: "all 0.18s"
            }}
          />
        </div>

        {/* Articles Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "20px",
          marginBottom: "48px"
        }}>
          {mockArticles.map((article) => {
            const config = relevanceConfig[article.relevance];
            return (
              <article
                key={article.id}
                style={{
                  background: "white",
                  border: "1px solid #E8EDEB",
                  borderRadius: "8px",
                  padding: "20px",
                  transition: "all 0.2s",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  height: "100%"
                }}
              >
                <div style={{ marginBottom: "16px" }}>
                  <div style={{
                    display: "flex",
                    gap: "8px",
                    flexWrap: "wrap",
                    marginBottom: "12px",
                    alignItems: "center"
                  }}>
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: 500,
                        padding: "4px 10px",
                        borderRadius: "4px",
                        backgroundColor: config.bg,
                        color: config.text
                      }}
                    >
                      {config.label}
                    </span>
                    <span style={{
                      fontSize: "12px",
                      color: "rgba(107,114,128,1)",
                      padding: "4px 10px",
                      backgroundColor: "#F4F6F5",
                      borderRadius: "4px"
                    }}>
                      {article.database}
                    </span>
                    <span style={{
                      fontSize: "12px",
                      color: "#9CA3AF",
                      marginLeft: "auto"
                    }}>
                      {article.year}
                    </span>
                  </div>

                  <h3 style={{
                    fontWeight: 600,
                    color: "#1B2A4A",
                    fontSize: "14px",
                    lineHeight: 1.5,
                    marginBottom: "8px"
                  }}>
                    {article.title}
                  </h3>

                  <p style={{
                    fontSize: "12px",
                    color: "#6B7280",
                    marginBottom: "8px"
                  }}>
                    {article.authors}
                  </p>
                </div>

                {article.abstract && (
                  <p style={{
                    fontSize: "12px",
                    color: "#6B7280",
                    marginBottom: "12px",
                    lineHeight: 1.5,
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden"
                  }}>
                    {article.abstract}
                  </p>
                )}

                <div style={{
                  display: "flex",
                  gap: "8px",
                  marginTop: "auto",
                  paddingTop: "12px",
                  borderTop: "1px solid #f0f0f0"
                }}>
                  {article.doi && (
                    <a
                      href={`https://doi.org/${article.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: "12px",
                        fontWeight: 500,
                        color: "#0F6E56",
                        textDecoration: "none",
                        transition: "color 0.18s"
                      }}
                    >
                      DOI
                    </a>
                  )}
                  <button style={{
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "#0F6E56",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    marginLeft: "auto",
                    transition: "color 0.18s"
                  }}>
                    Ver más
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {/* Pagination */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <button style={{
            padding: "12px 28px",
            background: "transparent",
            border: "1px solid #E8EDEB",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 500,
            color: "#6B7280",
            cursor: "pointer",
            transition: "all 0.18s"
          }}>
            Cargar más resultados
          </button>
        </div>
      </div>

      {/* Export Bar */}
      <div style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "white",
        borderTop: "1px solid #E8EDEB",
        padding: "16px 0",
        boxShadow: "0 -4px 20px rgba(15,110,86,0.08)"
      }}>
        <div style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "0 48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px"
        }}>
          <p style={{
            fontSize: "13px",
            color: "#6B7280"
          }}>
            <span style={{ fontWeight: 600, color: "#1B2A4A" }}>5</span> artículos seleccionados
          </p>
          <div style={{
            display: "flex",
            gap: "8px"
          }}>
            <button style={{
              padding: "10px 20px",
              background: "transparent",
              border: "1px solid #E8EDEB",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 500,
              color: "#6B7280",
              cursor: "pointer",
              transition: "all 0.18s"
            }}>
              PDF
            </button>
            <button style={{
              padding: "10px 20px",
              background: "transparent",
              border: "1px solid #E8EDEB",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 500,
              color: "#6B7280",
              cursor: "pointer",
              transition: "all 0.18s"
            }}>
              CSV
            </button>
            <button style={{
              padding: "10px 20px",
              background: "#1D9E75",
              border: "none",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 500,
              color: "white",
              cursor: "pointer",
              transition: "background 0.18s"
            }}>
              Descargar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
