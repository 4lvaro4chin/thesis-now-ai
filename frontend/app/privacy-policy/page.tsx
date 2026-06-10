'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/useTranslation';

type Section = 'privacy' | 'terms';

export default function LegalPages() {
  const router = useRouter();
  const { t } = useTranslation();
  const [section, setSection] = useState<Section>('privacy');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <section className="relative bg-green-900 overflow-hidden min-h-screen pt-24 pb-20">
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
      <div className="relative z-10 w-full px-6 sm:px-8" style={{ maxWidth: "800px", margin: "0 auto" }}>
        {/* Header */}
        <div className="text-center mb-12">
          <button
            onClick={() => router.push('/')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: 'rgba(255, 255, 255, 0.7)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '14px',
              marginBottom: '24px',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}
          >
            ← Volver
          </button>

          <h1 style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "clamp(28px, 5vw, 42px)",
            fontWeight: 600,
            color: "white",
            lineHeight: 1.1,
            letterSpacing: "-1px",
            marginBottom: "12px"
          }}>
            ThesisNow
          </h1>

          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "16px",
            color: "rgba(255, 255, 255, 0.7)",
            fontStyle: "italic"
          }}>
            Información Legal
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          display: "flex",
          gap: "12px",
          marginBottom: "28px",
          justifyContent: "center",
          flexWrap: "wrap"
        }}>
          {(['privacy', 'terms'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSection(tab)}
              style={{
                padding: "12px 24px",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "14px",
                fontWeight: 600,
                color: section === tab ? "white" : "rgba(255, 255, 255, 0.6)",
                background: section === tab ? "rgba(29, 158, 117, 0.3)" : "transparent",
                border: section === tab ? "1.5px solid #1D9E75" : "1.5px solid rgba(29, 158, 117, 0.3)",
                borderRadius: "10px",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                if (section !== tab) {
                  e.currentTarget.style.background = "rgba(29, 158, 117, 0.2)";
                }
              }}
              onMouseLeave={(e) => {
                if (section !== tab) {
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              {tab === 'privacy' ? 'Política de Privacidad' : 'Términos de Servicio'}
            </button>
          ))}
        </div>

        {/* Content Card */}
        <div style={{
          background: "white",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 12px 48px rgba(0,0,0,0.25)",
          border: "1px solid rgba(255,255,255,0.1)"
        }}>
          <div style={{ padding: "40px 36px" }}>
            {section === 'privacy' ? (
              <div>
                <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "24px", fontWeight: 600, color: "#1D9E75", marginBottom: "8px" }}>
                  Política de Privacidad
                </h2>
                <p style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: "28px" }}>
                  Última actualización: junio 2026
                </p>

                {[
                  {
                    title: '1. Introducción',
                    content: 'ThesisNow es una plataforma SaaS de revisión bibliográfica académica. Esta Política de Privacidad explica cómo recopilamos, usamos y protegemos tu información personal.'
                  },
                  {
                    title: '2. Información que Recopilamos',
                    content: 'Recopilamos información de las siguientes formas:\n• Autenticación OAuth: email y perfil básico\n• Búsquedas bibliográficas: temas y queries\n• Datos de uso: páginas, tiempo de sesión\n• Información técnica: IP, navegador, dispositivo'
                  },
                  {
                    title: '3. Cómo Usamos tu Información',
                    content: '• Proporcionar y mejorar el servicio\n• Procesar búsquedas bibliográficas\n• Autenticar usuarios\n• Detectar fraude y mejorar seguridad\n• Enviar actualizaciones (con consentimiento)'
                  },
                  {
                    title: '4. Compartición de Datos',
                    content: 'No vendemos tu información personal. Compartimos datos con proveedores de servicios (Supabase, Vercel, Railway) y APIs académicas autorizadas, solo cuando lo exige la ley.'
                  },
                  {
                    title: '5. Seguridad',
                    content: 'Usamos encriptación SSL/TLS, autenticación segura y servidores protegidos. No podemos garantizar seguridad absoluta en internet.'
                  },
                  {
                    title: '6. Retención de Datos',
                    content: 'Retenemos tu información mientras tu cuenta esté activa. Puedes solicitar la eliminación de tu cuenta en cualquier momento contactándonos.'
                  },
                  {
                    title: '7. Tus Derechos',
                    content: '• Acceder a tus datos personales\n• Corregir información inexacta\n• Solicitar eliminación de tu cuenta\n• Opt-out de comunicaciones de marketing'
                  },
                  {
                    title: '8. Cambios en esta Política',
                    content: 'Podemos actualizar esta política ocasionalmente. Te notificaremos de cambios significativos por email o a través de la plataforma.'
                  },
                  {
                    title: '9. Contacto',
                    content: 'Si tienes preguntas, contáctanos en: support@thesisnow.ai'
                  }
                ].map((section, idx) => (
                  <div key={idx} style={{ marginBottom: "24px" }}>
                    <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "16px", fontWeight: 600, color: "#1F2937", marginBottom: "8px" }}>
                      {section.title}
                    </h3>
                    <p style={{ fontSize: "14px", color: "#6B7280", lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                      {section.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "24px", fontWeight: 600, color: "#1D9E75", marginBottom: "8px" }}>
                  Términos de Servicio
                </h2>
                <p style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: "28px" }}>
                  Última actualización: junio 2026
                </p>

                {[
                  {
                    title: '1. Aceptación de Términos',
                    content: 'Al acceder y usar ThesisNow, aceptas estar vinculado por estos Términos de Servicio. Si no aceptas, no uses la plataforma.'
                  },
                  {
                    title: '2. Licencia de Uso',
                    content: 'Te concedemos una licencia limitada, no exclusiva y revocable para usar ThesisNow con fines académicos personales. No puedes vender, transferir o sublicenciar el servicio.'
                  },
                  {
                    title: '3. Cuenta de Usuario',
                    content: 'Eres responsable de mantener la confidencialidad de tu cuenta. Aceptas toda la actividad que ocurra bajo tu cuenta. Debes notificarnos inmediatamente de cualquier acceso no autorizado.'
                  },
                  {
                    title: '4. Restricciones de Uso',
                    content: 'No debes:\n• Usar la plataforma para actividades ilegales\n• Acceder a datos de otros usuarios\n• Interferir con la operación del servicio\n• Automatizar acceso sin permiso'
                  },
                  {
                    title: '5. Contenido del Usuario',
                    content: 'Eres propietario de tu contenido. Al usar ThesisNow, nos otorgas licencia para procesar y almacenar tu información para proporcionar el servicio.'
                  },
                  {
                    title: '6. Limitación de Responsabilidad',
                    content: 'ThesisNow se proporciona "tal cual". No somos responsables por daños indirectos, pérdida de datos o lucro cesante. Nuestra responsabilidad máxima es el monto pagado.'
                  },
                  {
                    title: '7. Garantías y Exclusiones',
                    content: 'No garantizamos que el servicio sea ininterrumpido o libre de errores. Descargamos todas las garantías implícitas en la medida permitida por la ley.'
                  },
                  {
                    title: '8. Modificaciones del Servicio',
                    content: 'Podemos modificar o descontinuar ThesisNow en cualquier momento. Te notificaremos de cambios significativos. Tu uso continuado constituye aceptación.'
                  },
                  {
                    title: '9. Terminación',
                    content: 'Podemos terminar o suspender tu cuenta si violas estos términos. Puedes cancelar tu cuenta en cualquier momento desde tu perfil.'
                  },
                  {
                    title: '10. Ley Aplicable',
                    content: 'Estos términos se rigen por las leyes aplicables. Cualquier disputa se resolverá en los tribunales competentes.'
                  }
                ].map((section, idx) => (
                  <div key={idx} style={{ marginBottom: "24px" }}>
                    <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "16px", fontWeight: 600, color: "#1F2937", marginBottom: "8px" }}>
                      {section.title}
                    </h3>
                    <p style={{ fontSize: "14px", color: "#6B7280", lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                      {section.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <p style={{
          textAlign: "center",
          fontSize: "12px",
          color: "rgba(255, 255, 255, 0.6)",
          fontFamily: "'DM Sans', sans-serif",
          marginTop: "28px",
          lineHeight: 1.5
        }}>
          © 2026 ThesisNow. Todos los derechos reservados.
        </p>
      </div>
    </section>
  );
}
