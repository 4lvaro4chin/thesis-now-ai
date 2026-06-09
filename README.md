# ThesisNow

Plataforma SaaS de revisión bibliográfica académica automatizada.

**Propósito:** Estudiante ingresa título de tesis → sistema genera queries booleanas → ejecuta búsquedas paralelas en múltiples bases de datos → entrega reporte descargable en <3 min.

## Estructura

```
thesis-now-ai/
├── frontend/          # Next.js app
├── backend/           # FastAPI app
├── docs/              # Documentación
├── .gitignore
└── README.md
```

## Stack

- **Frontend:** Next.js, TypeScript, Tailwind CSS
- **Backend:** FastAPI, Python, asyncio
- **Database:** Supabase (PostgreSQL + Auth)
- **Hosting:** Vercel (frontend), Railway (backend)
- **AI:** OpenAI GPT-4o-mini
- **Monitoring:** Sentry

## Documentación

- [Alcance](docs/alcance.md) — Qué construimos
- [Arquitectura](docs/arquitectura.md) — Cómo lo construimos
- [Plan de Trabajo](docs/plan-trabajo.md) — Semana a semana

## Fase actual

**Fase 0 — Concierge MVP (Semanas 0–3)**
- Objetivo: 20 usuarios, 5 pagos, <3 min búsqueda
- Milestone: Deploy end-to-end funcional en producción
