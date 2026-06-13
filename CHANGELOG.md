# CHANGELOG — ThesisNow

Todos los cambios notables en este proyecto están documentados aquí.
Formato basado en [Keep a Changelog](https://keepachangelog.com/).

---

## [Unreleased]

### Planeado para v0.2.0 (Semana 3, ~2026-06-25)
- [ ] PDF básico con WeasyPrint
- [ ] Sistema de créditos (1 gratis, bloqueado después)
- [ ] Stripe Payment Link ($4.99 / 3 créditos)
- [ ] Webhook payment_intent.succeeded
- [ ] Reclutar 20 usuarios beta

---

## [0.1.0] — 2026-06-12 — Fase 0 Alpha

### ✨ Features
- **Backend FastAPI** en Railway con `/health`, `/search`, `/search/{job_id}`
- **PubMed Connector:** 15-20 resultados por búsqueda en <20 seg
- **Semantic Scholar Connector:** 5-10 resultados altamente relevantes, rate limiting resuelto (x-api-key header)
- **Scoring Híbrido:** 30% recencia + 70% citas (resultado: papers recientes + citados ranking primero)
- **Frontend Next.js** con design system profesional (DM Sans + Cormorant Garamond)
- **Auth email/password** via Supabase
- **i18n completo:** español, inglés, portugués + selector manual
- **Query Builder visual:** tokens arrastrables, colores semánticos (AND verde, OR azul, NOT rojo)
- **Página de resultados:** título, autores, año, DOI, URL, abstract expandible, relevancia %
- **Deploy producción:** Vercel (frontend) + Railway (backend)

### 🐛 Fixes (esta semana)
- Fixed: Semantic Scholar rate limit con exponential backoff (3s → 6s → 12s)
- Fixed: API key header `x-api-key` en lugar de URL param
- Fixed: NLP fallback diccionario con soporte Unicode/acentos (ñ, á, é, etc.)
- Fixed: React hooks en página `/searching`
- Fixed: PubMed URL construction (`https://pubmed.ncbi.nlm.nih.gov/{pmid}/`)

### 🏗️ Tech Stack
- **Frontend:** Next.js 16.2.9 · TypeScript · Tailwind CSS v4 · Supabase SSR
- **Backend:** FastAPI · Python 3.9+ · asyncio · SQLAlchemy (Supabase)
- **APIs:** PubMed E-utilities · Semantic Scholar v1 · OpenAI (fallback)
- **Hosting:** Vercel (frontend) · Railway (backend)
- **Observability:** Sentry (errors), Railway logs

### 📊 Métricas Fase 0
- ✅ Búsqueda end-to-end: <3 minutos (verificado: 90-120 seg)
- ✅ 2 bases de datos funcionales en paralelo
- ✅ Cero errores críticos en producción
- ✅ Uptime Railway: ~99%

### 🔐 Security
- Nada crítico en Fase 0
- Auth tokens vía Supabase (best practice)
- API keys en variables de entorno (no en código)

### 📝 Notas
- OpenAI API con quota limitado → fallback diccionario (60% calidad, mejorará en Semana 3)
- Semantic Scholar rate limited sin API key → PubMed es primary, SS es secondary
- Test scoring verificado: papers recientes con 80+ citas ranking primero ✅

---

## Convenciones para Futuros Releases

### Secciones CHANGELOG
- **[Unreleased]** — trabajo en progreso
- **Features** — funcionalidades nuevas
- **Fixes** — bugfixes y hotfixes
- **Changes** — cambios en comportamiento existente (breaking o no)
- **Deprecated** — features en camino a remoción
- **Removed** — features removidas en esta versión
- **Security** — vulnerabilidades encontradas y parcheadas
- **Tech** — cambios internos (refactors, deps updates)

### Versionamiento
- **v0.x.y** — Fase 0 (MVP concierge)
- **v1.x.y** — Fase 1 (MVP comercial)
- **v2.x.y** — Fase 2 (Product-market fit)
- **v3.x.y** — Fase 3 (Mobile + B2B)
- **v4.x.y** — Fase 4 (AI Research Assistant)

Detalles en [docs/versionamiento.md](docs/versionamiento.md).

---

## Cómo Contribuir

1. Develop en rama separada (ej: `scoring-improvement`)
2. Merge a `main` con PR
3. Tag version: `git tag -a vX.Y.Z -m "mensaje"`
4. Push: `git push origin vX.Y.Z`
5. Update CHANGELOG.md
6. Deploy a producción (Vercel + Railway auto-deploy)
