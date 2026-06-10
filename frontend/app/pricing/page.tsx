import Link from "next/link";

export default function PricingPage() {
  const plans = [
    {
      name: "Estudiante",
      price: 4.99,
      credits: 100,
      features: [
        "1 búsqueda incluida",
        "Hasta 100 resultados",
        "Descargar en PDF",
        "Soporte por email",
      ],
      highlighted: false,
    },
    {
      name: "Profesional",
      price: 14.99,
      credits: 500,
      features: [
        "5 búsquedas incluidas",
        "Hasta 1000 resultados",
        "Descargar en PDF, CSV, BibTeX",
        "Filtros avanzados",
        "Soporte prioritario",
      ],
      highlighted: true,
      badge: "Más elegido",
    },
    {
      name: "Investigador",
      price: 19.99,
      credits: 1000,
      features: [
        "Búsquedas ilimitadas",
        "Todos los formatos de exportación",
        "API acceso",
        "Gestión de proyectos",
        "Soporte 24/7",
      ],
      highlighted: false,
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#FFFFFF", paddingTop: "72px", paddingBottom: "72px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 48px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "80px" }}>
          <h1 style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "clamp(32px, 4vw, 44px)",
            fontWeight: 600,
            color: "#1B2A4A",
            letterSpacing: "-1px",
            lineHeight: 1.2,
            marginBottom: "16px",
            textWrap: "balance"
          }}>
            Precios simples y transparentes
          </h1>
          <p style={{
            fontSize: "16px",
            color: "#6B7280",
            maxWidth: "600px",
            margin: "0 auto"
          }}>
            Elige el plan que mejor se adapte a tus necesidades. Siempre puedes cambiar después.
          </p>
        </div>

        {/* Pricing Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "32px",
          marginBottom: "80px"
        }}>
          {plans.map((plan, idx) => (
            <div
              key={idx}
              style={{
                borderRadius: "12px",
                border: plan.highlighted ? "2px solid #1D9E75" : "1px solid #E8EDEB",
                background: plan.highlighted ? "#04342C" : "white",
                padding: "32px",
                display: "flex",
                flexDirection: "column",
                transition: "all 0.2s",
                transform: plan.highlighted ? "scale(1.05)" : "scale(1)"
              }}
            >
              {/* Badge */}
              {plan.badge && (
                <div style={{
                  display: "inline-block",
                  padding: "6px 12px",
                  borderRadius: "4px",
                  background: plan.highlighted ? "rgba(29,158,117,0.2)" : "#F0FBF7",
                  color: plan.highlighted ? "#5DCAA5" : "#0F6E56",
                  fontSize: "12px",
                  fontWeight: 600,
                  marginBottom: "16px",
                  width: "fit-content"
                }}>
                  {plan.badge}
                </div>
              )}

              {/* Title */}
              <h3 style={{
                fontSize: "20px",
                fontWeight: 600,
                color: plan.highlighted ? "white" : "#1B2A4A",
                marginBottom: "12px"
              }}>
                {plan.name}
              </h3>

              {/* Price */}
              <div style={{ marginBottom: "8px" }}>
                <span style={{
                  fontSize: "36px",
                  fontWeight: 600,
                  color: plan.highlighted ? "white" : "#1B2A4A",
                  letterSpacing: "-1px"
                }}>
                  ${plan.price}
                </span>
                <span style={{
                  color: plan.highlighted ? "rgba(255,255,255,0.6)" : "#6B7280",
                  fontSize: "14px",
                  marginLeft: "4px"
                }}>
                  / mes
                </span>
              </div>

              <p style={{
                fontSize: "13px",
                color: plan.highlighted ? "rgba(255,255,255,0.6)" : "#6B7280",
                marginBottom: "32px"
              }}>
                {plan.credits} créditos incluidos
              </p>

              {/* Features */}
              <ul style={{
                listStyle: "none",
                marginBottom: "32px",
                flex: 1
              }}>
                {plan.features.map((feature, fidx) => (
                  <li
                    key={fidx}
                    style={{
                      display: "flex",
                      gap: "12px",
                      marginBottom: "16px",
                      fontSize: "14px",
                      color: plan.highlighted ? "rgba(255,255,255,0.8)" : "#6B7280"
                    }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={plan.highlighted ? "#5DCAA5" : "#1D9E75"}
                      strokeWidth="2"
                      style={{ flexShrink: 0, marginTop: "2px" }}
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                style={{
                  width: "100%",
                  padding: "12px 20px",
                  background: plan.highlighted ? "white" : "#1D9E75",
                  color: plan.highlighted ? "#04342C" : "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.18s"
                }}
              >
                Comenzar
              </button>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div style={{
          maxWidth: "700px",
          margin: "0 auto"
        }}>
          <h2 style={{
            fontSize: "24px",
            fontWeight: 600,
            color: "#1B2A4A",
            marginBottom: "32px"
          }}>
            Preguntas frecuentes
          </h2>

          <div style={{
            display: "grid",
            gap: "24px"
          }}>
            {[
              {
                q: "¿Puedo cambiar de plan?",
                a: "Sí, puedes cambiar de plan en cualquier momento. El cambio se reflejará en tu próxima facturación.",
              },
              {
                q: "¿Qué pasa si no uso todos mis créditos?",
                a: "Los créditos no utilizados se acumulan por 6 meses. Después expiran automáticamente.",
              },
              {
                q: "¿Hay un período de prueba?",
                a: "Sí, ofrecemos 5 búsquedas gratis para nuevos usuarios. No se requiere tarjeta de crédito.",
              },
            ].map((faq, idx) => (
              <div key={idx}>
                <h3 style={{
                  fontSize: "15px",
                  fontWeight: 600,
                  color: "#1B2A4A",
                  marginBottom: "8px"
                }}>
                  {faq.q}
                </h3>
                <p style={{
                  fontSize: "14px",
                  color: "#6B7280",
                  lineHeight: 1.6
                }}>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Bottom */}
        <div style={{
          textAlign: "center",
          marginTop: "80px"
        }}>
          <Link
            href="/search"
            style={{
              display: "inline-block",
              padding: "12px 28px",
              background: "#1D9E75",
              color: "white",
              textDecoration: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "background 0.18s"
            }}
          >
            Comenzar búsqueda gratuita
          </Link>
        </div>
      </div>
    </div>
  );
}
