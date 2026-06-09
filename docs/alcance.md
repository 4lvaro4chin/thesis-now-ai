# Alcance Funcional — ThesisNow

## Contexto

ThesisNow es una plataforma SaaS que automatiza la revisión bibliográfica académica. El estudiante ingresa el título de su tesis y el sistema genera queries booleanas, ejecuta búsquedas paralelas en múltiples bases de datos y entrega un reporte descargable en menos de 3 minutos. El problema que resuelve es real y cuantificable: la búsqueda manual consume entre 20 y 40 horas.

---

## Flujo funcional central (invariante en todas las fases)

```
Título de tesis → NLP → Booleanos → Búsqueda paralela → Resultados rankeados → Reporte descargable
```

El prototipo HTML documenta esto en 5 pantallas:
1. **Landing / Ingreso** — campo de texto para el título + botón buscar
2. **Booleanos + bases** — términos AND/OR/NOT/truncaciones generados automáticamente, editables; toggles para seleccionar bases de datos
3. **Resultados** — listado con % de relevancia, metadatos, abstract, agrupado por base
4. **Reporte preview** — índice por base, artículos con relevancia, descarga Word/PDF
5. **Precios** — packs de créditos por pago único + licencias institucionales anuales

---

## Fase 0 — Concierge / Validación rápida (2–3 semanas)

**Objetivo:** Confirmar willingness-to-pay antes de construir infraestructura.

### Funcionalidades

| Área | Funcionalidad |
|------|--------------|
| Auth | Registro email + login básico |
| Búsqueda | Campo título → booleanos → PubMed + Semantic Scholar |
| Resultados | Lista simple: título, autores, año, DOI, abstract |
| Reporte | PDF básico descargable |
| Pagos | 1 búsqueda gratis; pago manual (Stripe Link) |

### Criterio de éxito

- 20 usuarios reales usando plataforma
- 5 usuarios pagos
- Feedback positivo >30%
- Búsqueda <3 minutos
- Al menos 2 bases funcionando sin errores

---

## Fase 1 — MVP Comercial (6–8 semanas)

**Objetivo:** Primer producto comercializable con monetización automatizada.

### Funcionalidades

#### Autenticación y perfil
- Registro email/password
- Login Google OAuth
- Recuperación de contraseña
- Panel de usuario con historial y créditos disponibles

#### Motor NLP
- Extracción automática de conceptos clave
- Generación de sinónimos
- Operadores AND / OR / NOT
- Truncaciones (`*`)
- Visualización de términos generados
- Edición manual de booleanos antes de ejecutar

#### Bases de datos (5 gratuitas)
- PubMed / MEDLINE
- arXiv
- ERIC
- Semantic Scholar
- OpenAlex

#### Motor de búsqueda
- Ejecución paralela (async)
- Retry automático
- Timeout handling
- Deduplicación de resultados
- Ranking por relevancia (%)

#### Resultados y filtros
- Listado con % de relevancia
- Metadatos: título, autores, año, revista, DOI, abstract
- Filtros por año, tipo de estudio, base, relevancia
- Agrupación por base de datos

#### Reportes
- Exportación PDF con índice por base
- Exportación Word (.docx)

#### Sistema de créditos y pagos
- 1 búsqueda gratis por usuario registrado
- Packs: Básico ($4.99/3), Tesis ($9.99/8), Investigador ($19.99/20)
- Integración Stripe
- Historial de transacciones
- Recibos por email
- Créditos sin vencimiento

#### Analytics básicos
- Conversion rate
- Search completion rate
- Usage metrics

### Criterio de éxito

- 100 usuarios registrados
- 20 usuarios pagos
- Conversión >8%
- Tiempo promedio <180 segundos
- Uptime >98%
- Rate limiting implementado
- Seguridad JWT validada

---

## Fase 2 — Product-Market Fit (2 meses)

**Objetivo:** Optimizar engagement, retención y recompra.

### Nuevas bases de datos
- SciELO
- Redalyc
- BASE (Bielefeld)

### NLP mejorado
- Soporte idiomas: español, inglés, portugués
- Sugerencias MeSH automáticas
- Clasificación temática automática

### Nuevas features
- Búsquedas favoritas
- Comparación lado a lado de resultados
- Compartir búsqueda mediante link
- Export RIS y BibTeX

### Growth
- Referral system (invita amigos, gana créditos)
- Sistema de cupones
- Onboarding flow mejorado
- Emails automáticos (bienvenida, recordatorios, recompra)

### Analytics avanzados
- Funnel de conversión
- D30 retention
- NPS (Net Promoter Score)
- Tasa de recompra

### Infraestructura
- Redis para cachear búsquedas repetidas
- GitHub Actions con test suite antes de deploy

### Criterio de éxito

- 500 usuarios registrados
- 100 usuarios pagos
- NPS >40
- D30 retention >25%
- Tasa de recompra >15%

---

## Fase 3 — Mobile + Institucional (3–4 meses)

**Objetivo:** Canal B2B y app móvil.

### App móvil
- Android (Play Store)
- iOS (App Store)
- Push notifications
- Misma funcionalidad que versión web

### Portal universitario
- Gestión de usuarios institucionales
- Dashboard de administrador
- Estadísticas de uso en tiempo real
- Reportes mensuales

### Licencias institucionales
- Licencia Estándar: $3,000/año hasta 2,000 alumnos
- Licencia Premium: $8,000/año alumnos ilimitados
- Búsquedas ilimitadas por usuario
- Facturación automática
- Firma digital de contratos

### Bases de datos premium
- Scopus
- Web of Science
- PsycINFO
- JSTOR

### Autenticación enterprise
- SAML/SSO para sistemas universitarios

### Infraestructura
- Migración backend a Google Cloud Run
- Multi-tenant con aislamiento de datos por universidad
- Migración de Supabase a Cloud SQL si es necesario

### Criterio de éxito

- 3 universidades con licencia activa
- MRR >$5,000 USD
- Multi-tenant operativo y testado
- Cero data leaks entre instituciones
- App disponible en ambas tiendas

---

## Fase 4 — AI Research Assistant (post-Fase 3)

**Objetivo:** Diferenciación mediante IA generativa.

### IA Generativa
- Resumen automático del estado del arte
- Identificación de brechas de investigación
- Sugerencias de hipótesis de investigación

### Chat académico
- Refinamiento de búsquedas mediante lenguaje natural
- Respuestas sobre el contenido de papers encontrados

### Recomendador
- Sugerencias inteligentes basadas en historial

### Integraciones LMS
- Moodle
- Canvas
- Blackboard
- Vía LTI 1.3

### API pública
- Integraciones B2B con plataformas de investigación

### Internacionalización
- Interfaz en inglés
- Soporte títulos: chino, francés, alemán, árabe
- Bases regionales: J-STAGE (Japón), CNKI (China), Persée (Francia)
- Adaptación de precios por mercado

### Infraestructura
- Cloud Run multi-región
- Cloud CDN global
- Modelo NLP fine-tuneado o RAG

---

## Lo que está fuera del alcance (todas las fases)

- Descarga completa de artículos/PDFs
- Gestor de referencias interno
- Escritura asistida de la tesis
- Detección de plagio
- Integración con MyLOFT u otros portales de universidades

---

## Principios de desarrollo

1. **Build Less, Learn Faster** — el riesgo principal no es tecnológico, es de adopción
2. **Monetize Early** — cobrar desde Fase 0 (aunque sea manual)
3. **Desktop First** — el uso académico ocurre en laptop/desktop
4. **Avoid Premature Scaling** — no ML avanzado, no mobile, no bases premium hasta validar PMF

Modelo evolutivo: **Validate → Monetize → Retain → Scale → Differentiate**

---

## Timeline estimado

| Fase | Duración | Acumulado |
|------|----------|-----------|
| Fase 0 | 2–3 semanas | Semana 2–3 |
| Fase 1 | 6–8 semanas | Semana 10–11 |
| Fase 2 | 2 meses | Mes 5–6 |
| Fase 3 | 3–4 meses | Mes 9–10 |
| Fase 4 | A definir | Mes 12+ |

**Objetivo año 1:** Fases 1 + 2 completadas, 3 universidades con licencia, 500 estudiantes activos, ~$12,000 MRR
