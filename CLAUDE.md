# CLAUDE.md

## 🎯 ThesisNow — Plataforma SaaS de Revisión Bibliográfica Académica

**Propósito:** Automatizar la revisión bibliográfica académica. Estudiante ingresa título de tesis → sistema genera queries booleanas → ejecuta búsquedas paralelas en múltiples bases de datos → entrega reporte descargable en <3 min.

**Problema:** Búsqueda manual consume 20–40 horas. **Solución:** ThesisNow lo reduce a minutos.

---

## 📚 Documentación del Proyecto

- **[docs/arquitectura.md](docs/arquitectura.md)** — Stack técnico (Next.js, FastAPI, Supabase, etc.), estructura del monorepo, decisiones arquitectónicas y escalamiento por fases
- **[docs/alcance.md](docs/alcance.md)** — Funcionalidades y criterios de éxito para Fases 0–4; flujo central y principios de desarrollo
- **[docs/plan-trabajo.md](docs/plan-trabajo.md)** — Plan detallado semana a semana (Fases 0–1) con tareas verificables y milestones
- **[docs/marca.md](docs/marca.md)** — Manual de marca v1.0: identidad, paleta, tipografía, componentes, voz y tono
- **[docs/preview-design.html](docs/preview-design.html)** — Preview interactivo del diseño de las 5 pantallas principales

---

## ⚡ Resumen Ejecutivo

| Elemento | Detalle |
|----------|---------|
| **Stack actual** | Next.js · FastAPI · Supabase · GPT-4o-mini · Railway · Vercel · Sentry |
| **Fase activa** | Fase 0 (Concierge MVP, ~60 horas) |
| **Objetivo Fase 0** | Validar willingness-to-pay: 20 usuarios, 5 pagos, <3 min búsqueda |
| **Objetivo Año 1** | Fase 1+2 completas, 3 universidades con licencia, 500 estudiantes, ~$12k MRR |
| **Modelo de ingresos** | B2C (packs de créditos $4.99–$19.99) + B2B (licencias institucionales $3k–$8k/año) |

---

## 🚀 Cómo empezar

1. **Lee primero:** [docs/alcance.md](docs/alcance.md) (qué construimos) y [docs/arquitectura.md](docs/arquitectura.md) (con qué)
2. **Plan de acción:** [docs/plan-trabajo.md](docs/plan-trabajo.md) (semana a semana, tarea a tarea)
3. **Preguntas específicas:**
   - Stack / infraestructura → arquitectura.md
   - Funcionalidades / fases → alcance.md
   - Tareas / verificaciones → plan-trabajo.md
   - Diseño / UI / colores / tipografía → marca.md

---

## 📋 Guías de Desarrollo

Behavioral guidelines to reduce common LLM coding mistakes.

**Tradeoff:** Estas guías favorecen la cautela sobre la velocidad. Para tareas triviales, usa tu criterio.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
