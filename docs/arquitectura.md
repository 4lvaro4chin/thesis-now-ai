# Arquitectura ThesisNow

## Stack por fase

### Fase 0–1 (MVP, ~$5–10/mes)

| Capa | Tecnología | Hosting | Costo |
|------|-----------|---------|-------|
| Frontend | Next.js + React | Vercel | Gratis |
| Backend | Python + FastAPI | Railway | ~$5/mes |
| Auth + Base de datos | Supabase (PostgreSQL) | Supabase Cloud | Gratis hasta 50k usuarios |
| NLP | OpenAI GPT-4o-mini | OpenAI API | Variable (~$0.0003/búsqueda) |
| Reportes PDF | WeasyPrint | En backend | — |
| Reportes Word | python-docx | En backend | — |
| Pagos | Stripe + Culqi/Yape | — | % por transacción |
| Monitoreo errores | Sentry | Sentry Cloud | Gratis hasta 5k errores/mes |

### Fase 2 (Product-Market Fit)

| Cambio | Decisión |
|--------|---------|
| NLP | Evaluar spaCy para reducir costos si volumen > 5,000 búsquedas/mes |
| Cache | Introducir Redis (Railway add-on, ~$5/mes) para cachear búsquedas repetidas |
| Analytics | Agregar PostHog o Mixpanel para funnel de conversión y retención |
| CI/CD | GitHub Actions con test suite antes de deploy a `main` |

### Fase 3 (Mobile + Institucional)

| Cambio | Decisión |
|--------|---------|
| Infraestructura | Migrar backend de Railway a Google Cloud Run (escala a cero, multi-región) |
| Base de datos | Migrar de Supabase a Cloud SQL si se requiere multi-tenant con aislamiento de datos por universidad |
| Auth | Agregar SAML/SSO para integraciones con sistemas universitarios |
| Mobile | React Native (comparte lógica de negocio con Next.js) |
| Repos | Evaluar separar `/frontend`, `/backend`, `/mobile` con git subtree |

### Fase 4 (IA + Global)

| Cambio | Decisión |
|--------|---------|
| NLP | Modelo fine-tuneado o RAG sobre corpus académico |
| Infraestructura | Cloud Run + Cloud CDN global |
| LMS | Integraciones via LTI 1.3 (Moodle, Canvas, Blackboard) |
| API pública | FastAPI + API Gateway de GCP |

---

## Estructura del repositorio

```
thesis-now-ai/          ← monorepo
├── frontend/           → Next.js → despliega en Vercel
│   ├── app/
│   ├── components/
│   └── ...
├── backend/            → FastAPI → despliega en Railway
│   ├── main.py
│   ├── routers/
│   ├── services/
│   │   ├── nlp.py          # GPT-4o-mini
│   │   ├── search.py       # motor paralelo
│   │   └── reports/
│   │       ├── pdf.py      # WeasyPrint
│   │       └── docx.py     # python-docx
│   └── ...
└── docs/
    ├── arquitectura.md  ← este archivo
    └── alcance.md
```

---

## Decisiones de arquitectura

| Decisión | Elección | Razón |
|----------|---------|-------|
| Backend language | Python + FastAPI | Ecosistema NLP/ML superior |
| Auth provider | Supabase Auth | OAuth (Google, Facebook, Apple, email) sin código |
| Búsquedas async | Polling cada 2–3 seg + FastAPI BackgroundTasks | Simplicidad; sin Redis ni Celery en Fase 0–1 |
| Reportes | WeasyPrint (PDF) + python-docx (Word) | HTML→PDF natural, python-docx estándar |
| Pagos locales | Stripe + Culqi (Yape/Plin) | Stripe para tarjetas, Culqi para billeteras peruanas |
| Deploy | Push a `main` → deploy automático | Sin fricción en Fase 0–1; GitHub Actions se agrega en Fase 2 |
| Repos | Monorepo `/frontend` + `/backend` | Equipo pequeño; separación trivial con git subtree cuando escale |
| Redis | ❌ Fase 0–1 | Innecesario hasta tener volumen real |
| Mobile | ❌ Fase 0–1 | Desktop first; usuarios académicos en laptop |

---

## Escalamiento por fase

```
Fase 0–1   Railway + Supabase + Vercel       ~$10/mes
Fase 2     + Redis + GitHub Actions           ~$20/mes
Fase 3     Cloud Run + Cloud SQL + mobile     ~$100–500/mes (cubre con MRR de universidades)
Fase 4     Cloud Run multi-región + CDN       escala con ingresos
```

## Checklist de setup

- [ ] Repositorio creado con estructura `/frontend` `/backend` `/docs`
- [ ] Variables de entorno configuradas en Railway y Vercel
- [ ] Supabase project creado con tablas iniciales (users, credits, searches)
- [ ] Sentry DSN configurado en frontend y backend
- [ ] Deploy de "hello world" funcionando end-to-end antes de escribir lógica de negocio
