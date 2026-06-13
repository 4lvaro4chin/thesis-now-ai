# Estrategia de Versionamiento — ThesisNow

## 🎯 Objetivo
Versioning claro y trazable para MVP → Fase 1-4, con distinción entre desarrollo y releases públicas.

---

## 📋 Esquema Recomendado

### 1. **Versioning Interno** (Git tags + package.json/pyproject.toml)
**Patrón:** `MAJOR.MINOR.PATCH` (Semantic Versioning)

```
v0.1.0 — Fase 0 Alpha (2026-06-12)
  ├─ v0.1.1 — Bugfixes de scoring
  ├─ v0.1.2 — PDF básico
  └─ v0.2.0 — Créditos + Stripe

v1.0.0 — Fase 1 MVP (2026-07-30)
  ├─ v1.1.0 — 4 bases de datos (arXiv + ERIC)
  ├─ v1.2.0 — OpenAlex + scoring mejorado
  └─ v1.3.0 — Reports Word

v2.0.0 — Fase 2 (2026-09-15)
v3.0.0 — Fase 3 Mobile + B2B (2026-12-15)
```

**Convención SemVer:**
- **MAJOR (0 → 1):** Fase alcanzada (MVP → Commercial)
- **MINOR (1 → 2):** Feature nueva importante (nueva base de datos, nueva capacidad)
- **PATCH (0 → 1):** Bugfixes, performance, scoring tuning

---

### 2. **Versioning Público** (Lo que ven usuarios)
**Patrón:** `FASE_X.Y (YYYY-MM-DD)`

```
Fase 0 Beta (2026-06-12)
  └─ "Fase 0 v1 · Jun 12 2026" — First working MVP

Fase 1 MVP (2026-07-30)
  └─ "Fase 1 v1 · Jul 30 2026" — 4 bases, reportes PDF+Word, Stripe funcional

Fase 2 Commercial (2026-09-15)
  └─ "Fase 2 v1 · Sep 15 2026" — NPS >40, D30 retention >25%
```

---

## 📁 Implementación

### Backend (`pyproject.toml`)
```toml
[project]
name = "thesis-now-ai"
version = "0.1.0"  # Cambiar con cada release

[tool.poetry]
name = "thesis-now-ai"
version = "0.1.0"
description = "Academic bibliography search engine"
```

### Frontend (`package.json`)
```json
{
  "name": "thesis-now",
  "version": "0.1.0",
  "description": "ThesisNow - Academic bibliography assistant"
}
```

### Git Tags
```bash
git tag -a v0.1.0 -m "Fase 0 Alpha: scoring + PubMed + Semantic Scholar"
git push origin v0.1.0
```

### Release Notes (en README)
```markdown
## Version History

### v0.1.0 (2026-06-12) — Fase 0 Alpha
- ✅ Backend FastAPI en Railway
- ✅ PubMed + Semantic Scholar en paralelo
- ✅ Scoring híbrido (30% recencia / 70% citas)
- ✅ Frontend Next.js + Auth email/password
- ✅ i18n ES/EN/PT

### v0.2.0 (TBD) — Fase 0 Beta
- [ ] PDF básico con WeasyPrint
- [ ] Sistema de créditos (1 gratis, bloqueado después)
- [ ] Stripe Payment Link básico
- [ ] 20 usuarios beta reclutados
```

---

## 🔄 Flujo de Versionamiento

```
feature branch (dev)
    ↓
    Desarrolla features hasta hito (1-2 semanas)
    ↓
    Merge a main → QA + testing
    ↓
    git tag vX.Y.Z → Release a producción
    ↓
    Newsletter + changelog a usuarios
```

### Checklist antes de Release
- [ ] Todos los tests pasan (`pytest`, `npm run build`)
- [ ] Sentry: cero errores críticos en últimas 24h
- [ ] Plan de trabajo: hitos completados documentados
- [ ] Changelog completado (qué cambió, para quién, por qué)
- [ ] Frontend + Backend versión sincronizada
- [ ] Deploy a producción (Vercel + Railway) verificado

---

## 💡 Notas Prácticas

| Aspecto | Recomendación |
|---------|--------------|
| **Frecuencia de releases** | Semanal en Fase 0 (rápida iteración); quincenal en Fase 1+ |
| **Quién controla versioning** | Tú (tu rama es source of truth). Claude Code actualiza automáticamente tras merge. |
| **Comunicación a usuarios** | Email + in-app toast en Vercel. "Versión nueva disponible" cada semana |
| **Rollback strategy** | Git revert commits; Railway + Vercel permiten instant rollback a versión anterior |
| **Breaking changes** | Documentar en CHANGELOG.md. Notificar a usuarios si upgrade requiere acción. |

---

## 📊 Ejemplo Real: Próximo Release

**Planeado:** v0.2.0 (Semana 3, ~2026-06-25)

```
CHANGELOG:

## v0.2.0 (2026-06-25) — Fase 0 Beta: Payments + PDF

### ✨ Features
- PDF download con WeasyPrint (15KB avg, <100ms generation)
- Sistema de créditos: 1 gratis, luego bloqueado con modal
- Stripe Payment Link integrado (Pack Básico $4.99 / 3 créditos)
- Webhook payment_intent.succeeded → +3 credits automático

### 🐛 Fixes
- Scoring: papers recientes con 80+ citas ranking primero (fue: 70/30, ahora: 30/70)
- Frontend: abstracts no truncaban en mobile (fix: line-clamp-3 responsive)
- Backend: Semantic Scholar rate limit timeout de 30s (fue: causaba 502, ahora: graceful fallback)

### 📊 Metrics
- Tiempo búsqueda: 90-120 seg (SLA <180 seg ✅)
- Uptime Railway: 99.2% (↑ from 98.1%)
- Usuarios beta: 20 registrados, 5 pagos completados

### 🔧 Breaking Changes
- Cambio en JSON SearchResult: agregado campo `citation_count` (nullable, default 0)
  → Clientes API deben actualizar parsers (afecta a máximo 2 usuarios en beta)

### 🔐 Security
- Nada de relevancia

### 📋 Deployment
- Frontend: Vercel auto-deploy desde tag
- Backend: Railway auto-deploy desde tag
- Database: Supabase schema stable (no migrations)
```

---

## 🚀 Resumen

**Para Fase 0 (hoy):** Usa `v0.1.0` en todos los repos. 
**Actualizaciones:** `v0.1.1`, `v0.1.2`, `v0.2.0`, etc.
**Fase 1:** Salta a `v1.0.0` cuando milestone completo.

Simple, escalable, trazable. ✅
