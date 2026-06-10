import Link from "next/link";

export default function AuthCodeError() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#F9FAFB" }}>
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6" style={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}>
          <span style={{ fontSize: "28px" }}>⚠️</span>
        </div>

        <h1 style={{ fontSize: "28px", fontWeight: 600, color: "#1F2937", marginBottom: "12px" }}>
          Error de Autenticación
        </h1>

        <p style={{ color: "#6B7280", marginBottom: "32px", lineHeight: 1.6 }}>
          El código de verificación es inválido o ha expirado. Por favor, intenta de nuevo.
        </p>

        <Link
          href="/login"
          style={{
            display: "inline-block",
            padding: "12px 32px",
            backgroundColor: "#1D9E75",
            color: "white",
            borderRadius: "10px",
            textDecoration: "none",
            fontWeight: 600,
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#0F6E56";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#1D9E75";
          }}
        >
          Volver al Login
        </Link>
      </div>
    </div>
  );
}
