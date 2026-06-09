# Plan de Trabajo — ThesisNow
**Stack:** Next.js · FastAPI · Supabase · GPT-4o-mini · Railway · Vercel · Sentry
**Ritmo:** 4 horas/día · Claude Code como copiloto
**Modelo:** Validate → Monetize → Retain → Scale → Differentiate

---

## FASE 0 — Concierge MVP (Semanas 0–3)
**Objetivo:** Cobrarle a alguien antes de construir la infraestructura completa.
**Presupuesto de tiempo:** ~75 horas (incluye pre-requisitos)

### Semana 0 — Pre-requisitos (cuentas y credenciales)
**Entregable:** Todas las cuentas de 3rd-party creadas con credenciales listas

| # | Actividad | Verificación | Estado | Observaciones |
|---|-----------|-------------|--------|---------------|
| 0.1 | Crear cuenta GitHub (github.com) | Perfil activo, email verificado, URL: `github.com/tu-usuario` | ✅ Completado | Usuario: `4lvaro4chin`. Hosting de código + deploy trigger. |
| 0.2 | Crear API key OpenAI (platform.openai.com) | API key generada y guardada de forma segura | ✅ Completado | Guardada en documento privado. Para generar queries booleanas con GPT-4o-mini. |
| 0.3 | Crear cuenta Supabase (supabase.com) | Proyecto gratuito creado, URL de proyecto visible | ✅ Completado | Proyecto `thesis-now`. Base de datos + autenticación para usuarios y búsquedas. |
| 0.4 | Crear cuenta Vercel (vercel.com) | Cuenta creada, conectada a GitHub | ✅ Completado | Conectada a `4lvaro4chin`. Hosting del frontend Next.js con deploy automático. |
| 0.5 | Crear cuenta Railway (railway.app) | Cuenta creada, conectada a GitHub | ✅ Completado | Conectada a `4lvaro4chin`. Hosting del backend FastAPI con deploy automático. |
| 0.6 | Crear cuenta Sentry (sentry.io) | Cuenta creada, proyecto inicial generado | ✅ Completado | 2 proyectos: `javascript-nextjs` y `python-fastapi`. Monitoreo de errores en producción. |

---

### Semana 1 — Setup e infraestructura base
**Entregable:** Deploy end-to-end funcionando (hello world en producción)

| # | Actividad | Verificación | Estado | Observaciones |
|---|-----------|-------------|--------|---------------|
| 1.1 | Crear repositorio GitHub con estructura `/frontend` `/backend` `/docs` | Repo visible en GitHub con 3 carpetas | Pendiente | |
| 1.2 | Inicializar proyecto Next.js en `/frontend` | `npm run dev` levanta sin errores | Pendiente | |
| 1.3 | Inicializar proyecto FastAPI en `/backend` con `uv` o `poetry` | `uvicorn main:app` responde en localhost | Pendiente | |
| 1.4 | Crear proyecto Supabase (auth + PostgreSQL) | Dashboard Supabase activo | Pendiente | |
| 1.5 | Crear tablas iniciales: `users`, `searches`, `results` | Tablas visibles en Supabase Table Editor | Pendiente | |
| 1.6 | Conectar Supabase Auth al frontend (registro + login por email) | Usuario puede registrarse y ver sesión activa | Pendiente | |
| 1.7 | Deployar frontend en Vercel (auto-deploy desde `main`) | URL de Vercel accesible públicamente | Pendiente | |
| 1.8 | Deployar backend en Railway | URL de Railway responde en `/health` | Pendiente | |
| 1.9 | Configurar variables de entorno en Railway y Vercel | Backend consume `SUPABASE_URL`, `OPENAI_API_KEY` sin errores | Pendiente | |
| 1.10 | Configurar Sentry en frontend y backend | Error de prueba aparece en dashboard Sentry | Pendiente | |

---

### Semana 2 — NLP básico + búsqueda en PubMed y Semantic Scholar
**Entregable:** Usuario ingresa título → ve resultados reales de 2 bases de datos

| # | Actividad | Verificación | Estado | Observaciones |
|---|-----------|-------------|--------|---------------|
| 2.1 | Servicio NLP: llamada GPT-4o-mini con título → conceptos + sinónimos + operadores AND/OR/NOT | Unit test: 3 títulos distintos generan booleanos correctos | Pendiente | |
| 2.2 | Conector PubMed (NCBI E-utilities): query → lista de artículos | Test: query "mindfulness AND adolescents" retorna >10 resultados | Pendiente | |
| 2.3 | Conector Semantic Scholar API: query → lista de artículos | Test: misma query retorna >10 resultados | Pendiente | |
| 2.4 | Motor paralelo: ejecutar ambas APIs con `asyncio.gather` | Ambas responden en <30 seg combinadas | Pendiente | |
| 2.5 | Endpoint `POST /search` → retorna `job_id` inmediatamente | Postman: responde en <200ms con job_id | Pendiente | |
| 2.6 | Endpoint `GET /search/{job_id}` → retorna status + resultados | Polling cada 3 seg hasta `status: completed` | Pendiente | |
| 2.7 | Guardar búsqueda y resultados en Supabase | Fila visible en tabla `searches` tras búsqueda | Pendiente | |
| 2.8 | Frontend: pantalla de búsqueda (campo título + botón) | Usuario puede escribir título y ejecutar | Pendiente | |
| 2.9 | Frontend: pantalla de resultados (lista con título, autores, año, DOI, abstract) | Resultados visibles tras polling | Pendiente | |
| 2.10 | Test end-to-end completo | Título → resultados en <3 minutos desde producción | Pendiente | |

---

### Semana 3 — PDF básico + pagos manuales + beta usuarios
**Entregable:** Usuario puede descargar PDF y pagar manualmente

| # | Actividad | Verificación | Estado | Observaciones |
|---|-----------|-------------|--------|---------------|
| 3.1 | Generación PDF básica con WeasyPrint (lista de artículos por base) | PDF descargable con al menos 10 artículos correctamente formateados | Pendiente | |
| 3.2 | Endpoint `GET /report/{job_id}/pdf` → descarga PDF | Postman descarga archivo `.pdf` válido | Pendiente | |
| 3.3 | Frontend: botón "Descargar PDF" en pantalla de resultados | Clic descarga PDF en el browser | Pendiente | |
| 3.4 | Lógica de créditos básica: 1 búsqueda gratis, luego bloqueado | Segundo intento sin créditos muestra mensaje de bloqueo | Pendiente | |
| 3.5 | Crear Stripe Payment Link para Pack Básico ($4.99) | Link de pago funciona con tarjeta de prueba | Pendiente | |
| 3.6 | Página de precios estática con Stripe Link visible | URL accesible públicamente | Pendiente | |
| 3.7 | Configurar dominio personalizado en Vercel | Sitio accesible en dominio final | Pendiente | |
| 3.8 | Reclutar 20 usuarios beta y compartir URL | 20 registros en tabla `users` de Supabase | Pendiente | |
| 3.9 | Enviar encuesta de feedback (Google Forms) | Respuestas recibidas de al menos 10 usuarios | Pendiente | |
| 3.10 | Procesar 5 pagos manuales (Stripe Link / Yape) | 5 usuarios con crédito adicional registrado manualmente | Pendiente | |

**✅ MILESTONE FASE 0**
- [ ] 20 usuarios registrados
- [ ] 5 pagos completados
- [ ] Feedback positivo >30%
- [ ] Búsqueda <3 minutos desde producción
- [ ] 2 bases funcionando sin errores en producción

---

## FASE 1 — MVP Comercial (Semanas 4–11)
**Objetivo:** Producto completo con monetización automatizada.
**Presupuesto de tiempo:** ~130 horas

### Semana 4 — Auth completa + schema de DB definitivo
**Entregable:** Todos los proveedores OAuth funcionando + DB lista para escalar

| # | Actividad | Verificación | Estado | Observaciones |
|---|-----------|-------------|--------|---------------|
| 4.1 | Google OAuth en Supabase configurado | Login con Google funciona en producción | Pendiente | |
| 4.2 | Facebook OAuth configurado | Login con Facebook funciona en producción | Pendiente | |
| 4.3 | Apple OAuth configurado | Login con Apple funciona en producción | Pendiente | |
| 4.4 | Recuperación de contraseña por email | Email de recuperación llega y permite cambiar contraseña | Pendiente | |
| 4.5 | Schema DB definitivo: `users`, `searches`, `results`, `credits`, `transactions` | Migraciones aplicadas en Supabase sin errores | Pendiente | |
| 4.6 | Panel de usuario: historial de búsquedas | Lista de búsquedas previas visible con fecha y estado | Pendiente | |
| 4.7 | Panel de usuario: créditos disponibles | Contador de créditos actualizado en tiempo real | Pendiente | |

---

### Semana 5 — Motor NLP completo
**Entregable:** Booleanos de calidad con visualización y edición manual

| # | Actividad | Verificación | Estado | Observaciones |
|---|-----------|-------------|--------|---------------|
| 5.1 | Prompt engineering mejorado: truncaciones (`mindful*`, `adolescen*`) | Output incluye truncaciones correctas para 5 títulos de prueba | Pendiente | |
| 5.2 | Operadores NOT automáticos (exclusiones semánticas) | Output incluye al menos 1 exclusión relevante por título | Pendiente | |
| 5.3 | Frontend: tarjetas de booleanos (AND / OR / NOT / truncaciones) | Términos visualizados con colores por tipo (verde AND, azul OR, rojo NOT) | Pendiente | |
| 5.4 | Frontend: edición manual de booleanos antes de ejecutar | Usuario puede agregar/eliminar términos y ejecutar la búsqueda modificada | Pendiente | |
| 5.5 | Unit tests NLP: 5 categorías de título | Tests pasan para título corto, ambiguo, médico, social, técnico | Pendiente | |
| 5.6 | Validación de sintaxis boolean builder | Query malformada es corregida o rechazada con mensaje claro | Pendiente | |

---

### Semana 6 — Integración arXiv + ERIC
**Entregable:** 4 bases de datos funcionando en paralelo

| # | Actividad | Verificación | Estado | Observaciones |
|---|-----------|-------------|--------|---------------|
| 6.1 | Conector arXiv API con adaptación de sintaxis | Query retorna >5 resultados para título de ejemplo | Pendiente | |
| 6.2 | Conector ERIC API con adaptación de sintaxis | Query retorna >5 resultados para título educativo | Pendiente | |
| 6.3 | Toggle de selección de bases en frontend | Usuario puede activar/desactivar bases individualmente | Pendiente | |
| 6.4 | Integration tests: timeouts | Timeout de 30 seg por base no rompe las demás | Pendiente | |
| 6.5 | Integration tests: rate limits | Rate limit manejado con backoff automático | Pendiente | |
| 6.6 | Integration tests: respuestas vacías | Respuesta vacía muestra mensaje "Sin resultados en esta base" | Pendiente | |

---

### Semana 7 — OpenAlex + deduplicación + scoring
**Entregable:** 5 bases completas con resultados limpios y rankeados

| # | Actividad | Verificación | Estado | Observaciones |
|---|-----------|-------------|--------|---------------|
| 7.1 | Conector OpenAlex API | Query retorna >10 resultados para título de ejemplo | Pendiente | |
| 7.2 | Algoritmo de deduplicación por DOI y título normalizado | Misma publicación en 2 bases aparece 1 sola vez | Pendiente | |
| 7.3 | Algoritmo de scoring de relevancia (%) | Cada resultado tiene score entre 0–100 | Pendiente | |
| 7.4 | Motor paralelo completo: 5 bases con `asyncio.gather` | Las 5 bases responden en <120 seg combinadas | Pendiente | |
| 7.5 | Barra de progreso en frontend (polling + estado por base) | Usuario ve qué bases están buscando y cuáles terminaron | Pendiente | |
| 7.6 | Métricas: total encontrados, alta relevancia, tiempo total | Panel de métricas visible en pantalla de resultados | Pendiente | |

---

### Semana 8 — Reportes PDF y Word completos
**Entregable:** Reportes descargables con diseño profesional

| # | Actividad | Verificación | Estado | Observaciones |
|---|-----------|-------------|--------|---------------|
| 8.1 | Template HTML para PDF (basado en prototipo: header, índice, secciones por base) | PDF generado visualmente similar al prototipo | Pendiente | |
| 8.2 | PDF: índice por base con conteo de artículos | Índice navegable con número correcto por sección | Pendiente | |
| 8.3 | PDF: metadata completa por artículo (título, autores, año, revista, DOI, abstract, relevancia) | Todos los campos presentes en al menos 10 artículos | Pendiente | |
| 8.4 | Word (.docx): misma estructura que PDF | Archivo `.docx` abre correctamente en Word y Google Docs | Pendiente | |
| 8.5 | Endpoint `GET /report/{job_id}/docx` | Postman descarga archivo `.docx` válido | Pendiente | |
| 8.6 | Frontend: botones "Exportar PDF" y "Exportar Word" | Ambos botones descargan el archivo correcto | Pendiente | |

---

### Semana 9 — Sistema de créditos + Stripe automatizado
**Entregable:** Compra de créditos completamente automatizada

| # | Actividad | Verificación | Estado | Observaciones |
|---|-----------|-------------|--------|---------------|
| 9.1 | Lógica de créditos: consumir 1 crédito al iniciar búsqueda | Saldo baja 1 tras cada búsqueda; no ejecuta si saldo = 0 | Pendiente | |
| 9.2 | Stripe Checkout para Pack Básico ($4.99 / 3 créditos) | Pago de prueba completa y acredita 3 créditos automáticamente | Pendiente | |
| 9.3 | Stripe Checkout para Pack Tesis ($9.99 / 8 créditos) | Pago de prueba completa y acredita 8 créditos automáticamente | Pendiente | |
| 9.4 | Stripe Checkout para Pack Investigador ($19.99 / 20 créditos) | Pago de prueba completa y acredita 20 créditos automáticamente | Pendiente | |
| 9.5 | Webhook Stripe: `payment_intent.succeeded` → acreditar créditos | Webhook funciona en producción (verificado con Stripe CLI) | Pendiente | |
| 9.6 | Historial de transacciones en panel de usuario | Lista de compras con fecha, pack y monto | Pendiente | |
| 9.7 | Recibo por email automático via Stripe | Email de confirmación llega tras pago de prueba | Pendiente | |
| 9.8 | Página de precios funcional (3 packs con botón de compra) | Usuario puede completar flujo completo sin intervención manual | Pendiente | |

---

### Semana 10 — Filtros + UI/UX completa + rate limiting
**Entregable:** Interfaz terminada y lista para usuarios reales

| # | Actividad | Verificación | Estado | Observaciones |
|---|-----------|-------------|--------|---------------|
| 10.1 | Filtros de resultados: por año | Filtro por "2020–2024" muestra solo artículos del período | Pendiente | |
| 10.2 | Filtros de resultados: por base de datos | Filtro "Solo PubMed" muestra solo esos resultados | Pendiente | |
| 10.3 | Filtros de resultados: por relevancia | Filtro ">80%" muestra solo artículos de alta relevancia | Pendiente | |
| 10.4 | Agrupación de resultados por base de datos | Resultados organizados en secciones con header por base | Pendiente | |
| 10.5 | UI responsive completa (desktop y tablet) | Diseño funcional en pantallas de 1280px y 768px | Pendiente | |
| 10.6 | Página landing / precios / cómo funciona | Todas las secciones del prototipo implementadas | Pendiente | |
| 10.7 | Rate limiting en backend (por IP y por usuario) | Más de 10 requests/min bloquea con 429 | Pendiente | |
| 10.8 | Eventos de analytics: búsqueda iniciada, completada, reporte descargado, crédito comprado | Eventos visibles en logs de Supabase o herramienta de analytics | Pendiente | |

---

### Semana 11 — Testing integral + beta privada
**Entregable:** Producto estable validado con usuarios reales

| # | Actividad | Verificación | Estado | Observaciones |
|---|-----------|-------------|--------|---------------|
| 11.1 | Performance test: 10 usuarios concurrentes | Todos completan búsqueda sin errores | Pendiente | |
| 11.2 | Performance test: 50 usuarios concurrentes | Degradación controlada, ningún crash | Pendiente | |
| 11.3 | Security: rutas protegidas inaccesibles sin JWT | Request sin token retorna 401 en todas las rutas privadas | Pendiente | |
| 11.4 | Beta privada: 20–30 estudiantes completan búsqueda end-to-end | 20+ búsquedas en tabla `searches` con `status: completed` | Pendiente | |
| 11.5 | Encuesta UAT enviada y procesada | Respuestas a: ¿encontraste artículos relevantes? ¿te ahorró tiempo? ¿pagarías? | Pendiente | |
| 11.6 | Bug fixes críticos identificados en beta | Cero errores bloqueantes en Sentry tras correcciones | Pendiente | |
| 11.7 | Uptime validado en Railway | Dashboard Railway muestra >98% uptime en últimos 7 días | Pendiente | |

**✅ MILESTONE FASE 1**
- [ ] 100 usuarios registrados
- [ ] 20 pagos completados vía Stripe
- [ ] Conversión >8%
- [ ] Tiempo promedio búsqueda <180 segundos
- [ ] Uptime >98%
- [ ] Cero errores críticos en Sentry

---

## FASE 2 — Product-Market Fit (Meses 3–5)
**Objetivo:** Retención, recompra y crecimiento orgánico.

### Sprint 1 (Semanas 12–13) — Nuevas bases + NLP multilenguaje

| # | Actividad | Verificación | Estado | Observaciones |
|---|-----------|-------------|--------|---------------|
| S1.1 | Conector SciELO API | Query retorna resultados para título en español | Pendiente | |
| S1.2 | Conector Redalyc API | Query retorna resultados para título en español | Pendiente | |
| S1.3 | Conector BASE (Bielefeld) API | Query retorna resultados multidisciplinarios | Pendiente | |
| S1.4 | NLP en español e inglés (prompts bilingüales) | Booleanos correctos para título en español e inglés | Pendiente | |
| S1.5 | NLP en portugués | Booleanos correctos para título en portugués | Pendiente | |
| S1.6 | Sugerencias MeSH automáticas integradas al booleano | Sugerencias aparecen para títulos de ciencias de la salud | Pendiente | |
| S1.7 | Tests de regresión NLP | NLP en español no degrada calidad en inglés | Pendiente | |

### Sprint 2 (Semanas 14–15) — Features de retención

| # | Actividad | Verificación | Estado | Observaciones |
|---|-----------|-------------|--------|---------------|
| S2.1 | Búsquedas favoritas (guardar y recuperar) | Usuario guarda búsqueda y la encuentra en "Mis favoritos" | Pendiente | |
| S2.2 | Comparación lado a lado de 2 búsquedas | Vista comparativa muestra diferencias de resultados | Pendiente | |
| S2.3 | Compartir búsqueda mediante link público | Link público muestra resultados sin login | Pendiente | |
| S2.4 | Export RIS (compatible con Zotero y Mendeley) | Archivo RIS importable en Zotero sin errores | Pendiente | |
| S2.5 | Export BibTeX (compatible con LaTeX) | Archivo BibTeX compila en LaTeX sin errores | Pendiente | |

### Sprint 3 (Semanas 16–17) — Growth + emails

| # | Actividad | Verificación | Estado | Observaciones |
|---|-----------|-------------|--------|---------------|
| S3.1 | Referral system: código único por usuario + crédito al referir | Referido recibe crédito al registrarse con código | Pendiente | |
| S3.2 | Sistema de cupones en Stripe | Cupón de descuento aplica correctamente en checkout | Pendiente | |
| S3.3 | Onboarding flow: tutorial en primer login | Usuario nuevo ve guía paso a paso en primer acceso | Pendiente | |
| S3.4 | Email bienvenida automático | Email llega en los primeros 5 min tras registro | Pendiente | |
| S3.5 | Email recordatorio a los 7 días sin nueva búsqueda | Email enviado automáticamente a usuarios inactivos | Pendiente | |
| S3.6 | Email de recompra cuando créditos = 0 | Email enviado al llegar a saldo cero | Pendiente | |

### Sprint 4 (Semanas 18–19) — Analytics + infraestructura

| # | Actividad | Verificación | Estado | Observaciones |
|---|-----------|-------------|--------|---------------|
| S4.1 | Redis como Railway add-on (cache búsquedas repetidas) | Búsqueda idéntica en <5 seg desde cache | Pendiente | |
| S4.2 | PostHog integrado: funnel registro → búsqueda → pago | Funnel visible en dashboard PostHog | Pendiente | |
| S4.3 | Dashboard NPS (encuesta automática a los 30 días) | Encuesta se envía automáticamente al mes de registro | Pendiente | |
| S4.4 | GitHub Actions: test suite antes de deploy a `main` | PR fallido bloquea merge si tests no pasan | Pendiente | |
| S4.5 | Cobertura de tests >70% | `pytest --cov` reporta ≥70% en backend | Pendiente | |

**✅ MILESTONE FASE 2**
- [ ] 500 usuarios registrados
- [ ] 100 pagos
- [ ] NPS >40
- [ ] D30 retention >25%
- [ ] Recompra >15%

---

## FASE 3 — Mobile + Institucional (Meses 6–9)
**Objetivo:** Canal B2B con licencias universitarias + app móvil.

### Sprint 1–2 — Portal universitario

| # | Actividad | Verificación | Estado | Observaciones |
|---|-----------|-------------|--------|---------------|
| F3.1 | Multi-tenant: aislamiento de datos por institución | Universidad A no accede datos de Universidad B | Pendiente | |
| F3.2 | Panel de administrador universitario | Dashboard muestra usuarios activos, búsquedas y reportes | Pendiente | |
| F3.3 | Licencias anuales en Stripe (pago recurrente anual) | Suscripción anual se renueva automáticamente | Pendiente | |
| F3.4 | Contrato digital con firma electrónica | Contrato firmado digitalmente genera PDF válido | Pendiente | |
| F3.5 | SAML/SSO para sistemas universitarios | Login con SSO universitario redirige correctamente | Pendiente | |

### Sprint 3–4 — Bases premium

| # | Actividad | Verificación | Estado | Observaciones |
|---|-----------|-------------|--------|---------------|
| F3.6 | Integración Scopus API | Query retorna resultados con acuerdo Elsevier | Pendiente | Requiere acuerdo comercial previo |
| F3.7 | Integración Web of Science API | Query retorna resultados con acuerdo Clarivate | Pendiente | Requiere acuerdo comercial previo |
| F3.8 | Integración PsycINFO (vía EBSCO) | Query retorna resultados psicología | Pendiente | Requiere acuerdo EBSCO |
| F3.9 | Bases premium solo accesibles con licencia institucional | Usuario sin licencia ve bases deshabilitadas | Pendiente | |

### Sprint 5–6 — App móvil

| # | Actividad | Verificación | Estado | Observaciones |
|---|-----------|-------------|--------|---------------|
| F3.10 | Proyecto React Native inicializado | App corre en emulador Android e iOS | Pendiente | |
| F3.11 | Auth con Supabase en mobile | Login/registro funcionan en app móvil | Pendiente | |
| F3.12 | Flujo completo de búsqueda en mobile | Búsqueda end-to-end en smartphone | Pendiente | |
| F3.13 | Reporte PDF descargable en mobile | PDF abre en visor del dispositivo | Pendiente | |
| F3.14 | Push notifications | Notificación llega al completar búsqueda | Pendiente | |
| F3.15 | Publicación en Google Play Store | App disponible para descarga pública | Pendiente | |
| F3.16 | Publicación en Apple App Store | App disponible para descarga pública | Pendiente | |

### Sprint 7 — Migración infraestructura

| # | Actividad | Verificación | Estado | Observaciones |
|---|-----------|-------------|--------|---------------|
| F3.17 | Backend migrado de Railway a Google Cloud Run | Endpoints responden igual que en Railway | Pendiente | |
| F3.18 | Load test: 1,000 búsquedas concurrentes | Sistema no cae bajo carga máxima | Pendiente | |
| F3.19 | Security test: OWASP Top 10 | Cero vulnerabilidades críticas | Pendiente | |

**✅ MILESTONE FASE 3**
- [ ] 3 universidades con licencia activa
- [ ] MRR >$5,000 USD
- [ ] App en Play Store y App Store
- [ ] Cero data leaks entre instituciones

---

## FASE 4 — AI Research Assistant (Mes 10+)
**Objetivo:** Diferenciación por IA generativa.
*Actividades a detallar al inicio de la fase según aprendizajes de Fases 1–3.*

Áreas clave:
- Resumen automático del estado del arte (RAG sobre papers encontrados)
- Identificación de brechas de investigación
- Chat académico para refinamiento por lenguaje natural
- Integraciones LMS via LTI 1.3
- API pública ThesisNow
- Internacionalización (inglés + idiomas adicionales)

---

## Resumen de milestones

| Milestone | Semana | KPI principal |
|-----------|--------|--------------|
| Fase 0 completa | Semana 3 | 5 pagos manuales |
| Fase 1 completa | Semana 11 | 20 pagos Stripe, conversión >8% |
| Fase 2 completa | Semana 19 | NPS >40, D30 retention >25% |
| Fase 3 completa | Semana ~35 | 3 universidades, MRR >$5,000 |
| Fase 4 inicio | Mes 10+ | A definir |

---

## Convención de seguimiento

- **Estado:** cambiar de `Pendiente` → `Completado` al cerrar la tarea
- **Observaciones:** registrar bloqueos, decisiones tomadas o desvíos del plan original
- El commit de cierre referencia el número de tarea: `feat: integrar Stripe webhook [9.5]`
- Cada semana debe terminar con el entregable desplegado en **producción**, no solo en local

---

## Notas de desarrollo

- **Nunca deployar directo a `main` con features incompletas** — usar rama `dev`
- **Sentry es la primera fuente de verdad** cuando algo falla en producción
- **El milestone de cada fase es binario**: se cumple o no — no hay "casi listo"
