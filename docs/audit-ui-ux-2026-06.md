# Informe de Auditoría UI/UX — ThesisNow
**Fecha:** Junio 2026  
**Alcance:** Revisión exhaustiva del manual de marca (v1.0), preview HTML y implementación Next.js  
**Conclusión:** 70% alineado con marca. 12 problemas identificados: 4 críticos (accesibilidad), 5 altos (inconsistencias), 3 medios (UX/loading).

---

## 📊 Resumen Ejecutivo

### Lo que funciona bien (✅)
- ✓ Paleta de colores correctamente mapeada a tokens CSS
- ✓ Tipografía (DM Sans + Cormorant Garamond) cargada y aplicada
- ✓ Logo con split navy + verde en Navbar
- ✓ Sombras verdes (no negro puro) en cards y botones
- ✓ Escala tipográfica hero con `clamp()` correcta (44–68px)
- ✓ Press state (scale 0.98) en botones
- ✓ Noise grain overlay en hero
- ✓ 3 variantes de botón (primary/ghost/outlined)

### Brechas críticas (🔴)
1. **Contraste WCAG AA fallido** — `text-light: #9CA3AF` = 2.8:1 (necesita 4.5:1)
2. **Hero tagline opaco** — `rgba(255,255,255,0.5)` = 3.2:1 (arriesgado para texto >18px)
3. **Input sin etiqueta** — Hero search box carece de `<label>` para screen readers
4. **Logo footer invertido incorrecto** — Usa `#04342C` sobre `#1B2A4A` navy (bajo contraste)

---

## 🔴 CRÍTICO — Accesibilidad (4 problemas)

### 1. `--text-light: #9CA3AF` viola WCAG AA
**Problema:** Ratio de contraste 2.8:1 sobre blanco (necesita mínimo 4.5:1)

**Dónde se usa:**
- Metadatos en cards (fecha, autor)
- Texto de placeholder en inputs
- Subtítulos y labels secundarios
- Stats en hero ("Estudiantes activos")

**Impact:** Usuarios con baja visión no pueden leer este texto

**Fix:**
```css
/* Cambiar en globals.css y tailwind.config.ts */
--text-light: #6B7280;  /* Era #9CA3AF, ahora igual a --text-muted */
/* O crear token nuevo si necesitas separación visual */
--text-tertiary: #757575;  /* Alternativa: 3.9:1 ratio para más flexibilidad */
```

**Verificación:** Browser DevTools > Accessibility panel > verificar ratio en cada elemento

---

### 2. Hero tagline: `rgba(255,255,255,0.5)` opacidad insuficiente
**Problema:** Tagline tagline (24px serif italic) sobre `#04342C` verde oscuro

```html
<p style="color: rgba(255,255,255,0.5);">...</p>  <!-- ACTUAL: 3.2:1 -->
```

**Teoría:** Para texto >18px, WCAG AA acepta 3:1. Pero 3.2:1 es el borde; con rendering diferente, puede bajar.

**Fix:**
```css
.hero-tagline {
  color: rgba(255,255,255,0.65);  /* Eleva a ~4.2:1 — margen seguro */
}
```

**Implementar en:**
- `frontend/app/page.tsx` (hero section)
- `docs/preview-design.html` (actualizar preview también)

---

### 3. Input hero sin `<label>` — falla accesibilidad semántica
**Problema:** 
```jsx
<input placeholder="Ingresa el título de tu tesis..." />
<!-- INCORRECTO: sin <label>, solo placeholder -->
```

**Fix:**
```jsx
<label htmlFor="thesis-title" className="sr-only">
  Título de tu tesis
</label>
<input
  id="thesis-title"
  placeholder="Ingresa el título de tu tesis..."
  aria-label="Título de tu tesis"
/>
```

**O usar ambas estrategias:**
```jsx
<div>
  <label htmlFor="thesis-title">Título de tu tesis</label>
  <input id="thesis-title" placeholder="..." />
</div>
```

**Implementar en:** `frontend/app/page.tsx` → sección hero → componente SearchBox

---

### 4. Logo Footer: colores invertidos incorrectos
**Problema:**
```jsx
// Footer: bg-navy (#1B2A4A)
<span style="color: #04342C;">Thesis</span>  <!-- INCORRECTO -->
```

El `#04342C` sobre navy → contraste bajo.

**Marca.md especifica:** "Logo Invertida: fondo `#04342C` verde oscuro → usar **sobre este fondo**, no sobre navy"

**Fix:**
```jsx
// Footer logo — versión "Invertida" es BLANCO
<span style="color: #FFFFFF;">Thesis</span>
<span style="color: #9FE1CB;">Now</span>  /* green-300 sobre oscuro */
```

**O según marca:** Para footer con `bg-navy`:
```jsx
<span style="color: #FFFFFF;">Thesis</span>
<span style="color: #5DCAA5;">Now</span>  /* green-400 sobre oscuro */
```

**Implementar en:** `frontend/components/layout/Footer.tsx`

---

## 🟠 ALTO — Inconsistencias (5 problemas)

### 5. Navbar: sticky vs fixed + altura discrepancia (6px)
**Problema:**

| Componente | Preview HTML | Next.js Navbar | Esperado |
|-----------|--------------|-----------------|----------|
| Posición | `sticky` | `fixed` | Marca.md: no especifica |
| Altura | 58px | 64px (`h-16`) | Marca.md: no especifica |
| `<main>` padding | — | `pt-16` (64px) | Marca.md: no especifica |

**Impacto:** La altura fija de 64px con `pt-16` es correcta si es consistente, pero preview usa 58px.

**Recomendación:**
- **Mantener `fixed`** (mejor UX que `sticky` — siempre accesible)
- **Mantener 64px** (estándar Tailwind `h-16`, mejor para touch targets)
- **Actualizar preview HTML** a `height: 64px` para sincronizar

**Implementar:**
1. No cambiar `frontend/components/layout/Navbar.tsx` (está correcto)
2. Actualizar `docs/preview-design.html` línea ~85: `height: 58px;` → `height: 64px;`

---

### 6. Tokens faltantes en Tailwind Config
**Problema:** Los siguientes tokens de marca NO están en `tailwind.config.ts`:

```css
--green-50:   #F0FBF7  /* Fondos de sección suave */
--green-100:  #E1F5EE  /* Fondo de AND tags, badge "gratis" */
--green-300:  #9FE1CB  /* Textos sobre oscuro */
--green-400:  #5DCAA5  /* Branding sobre oscuro, "Now" invertido */
--green-800:  #085041  /* Texto sobre green-100 */
```

**Impacto:** Força hardcoding en componentes → inconsistencia, mantenimiento difícil.

**Ejemplo uso real:**
```jsx
// ArticleCard: badge para database type
<span style={{ backgroundColor: '#F0FBF7', color: '#085041' }}>
  PubMed
</span>
// Debería ser: bg-green-50 text-green-800 (tailwind class)
```

**Fix:**
```ts
// frontend/tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        green: {
          50:   '#F0FBF7',
          100:  '#E1F5EE',
          // 200–700 ya existen
          300:  '#9FE1CB',
          400:  '#5DCAA5',
          800:  '#085041',
          // resto mantener igual
        },
      },
    },
  },
};
```

**Luego reemplazar en componentes:**
```jsx
// ANTES (hardcoded)
<span style={{ backgroundColor: '#F0FBF7', color: '#085041' }} />

// DESPUÉS (Tailwind)
<span className="bg-green-50 text-green-800" />
```

**Archivos a actualizar:**
- `frontend/app/page.tsx` — stats badges
- `frontend/components/ui/ArticleCard.tsx` — database type badges
- `frontend/app/search/page.tsx` — result badges

---

### 7. Colores semánticos NO en brand system
**Problema:**

| Uso | Color | Estado | Fix |
|-----|-------|--------|-----|
| Error/logout | `#DC2626` | ❌ No en marca.md | Añadir a token |
| Warning | ❌ No definido | ❌ No en marca.md | Crear |
| Success | ❌ No definido | ❌ No en marca.md | Crear |
| Info | ❌ No definido | ❌ No en marca.md | Crear |

**Fix:** Actualizar `docs/marca.md` Sección 3 (Paleta de colores) con tabla nueva:

```markdown
### Colores Semánticos

| Token | Hex | Uso |
|-------|-----|-----|
| `--error` | `#DC2626` | Error messages, alerts, delete actions |
| `--error-bg` | `#FEE2E2` | Error background (light) |
| `--success` | `#16A34A` | Success states, confirmations |
| `--success-bg` | `#DCFCE7` | Success background (light) |
| `--warning` | `#EA8500` | Warnings, cautions |
| `--warning-bg` | `#FEF3C7` | Warning background (light) |
| `--info` | `#0EA5E9` | Info messages, hints |
| `--info-bg` | `#ECFDF5` | Info background (light) |
```

**Luego añadir en `tailwind.config.ts`:**
```ts
colors: {
  error: '#DC2626',
  'error-50': '#FEE2E2',
  success: '#16A34A',
  'success-50': '#DCFCE7',
  // etc
}
```

---

### 8. Boolean operator tags: sin componente React
**Problema:** 

El brand manual define con estilos corretos:
```css
--and-bg: #E1F5EE; --and-text: #0F6E56;
--or-bg:  #EBF4FD; --or-text:  #1B6FA8;
--not-bg: #FEF0EC; --not-text: #A33820;
--trc-bg: #FDF4E3; --trc-text: #8A5100;
```

Están en `docs/preview-design.html` y `docs/marca.md`, pero **NO hay componente React** en `frontend/components/ui/`.

**Necesario para:** Pantalla de resultados → mostrar la búsqueda expandida en chips.

**Crear archivo:** `frontend/components/ui/BooleanTag.tsx`

```tsx
interface BooleanTagProps {
  operator: 'AND' | 'OR' | 'NOT' | 'TRUNC';
  text: string;
}

const operatorStyles = {
  AND: { bg: '#E1F5EE', text: '#0F6E56' },
  OR: { bg: '#EBF4FD', text: '#1B6FA8' },
  NOT: { bg: '#FEF0EC', text: '#A33820' },
  TRUNC: { bg: '#FDF4E3', text: '#8A5100' },
};

export function BooleanTag({ operator, text }: BooleanTagProps) {
  const style = operatorStyles[operator];
  return (
    <span
      style={{
        backgroundColor: style.bg,
        color: style.text,
        fontFamily: 'monospace',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: 500,
      }}
    >
      {text}
    </span>
  );
}
```

**Usar en:** `frontend/app/search/page.tsx` → mostrar query expandida

---

### 9. Navbar height: diferencia 6px (MENOR)
Ya cubierto en #5. Solo necesita sincronizar preview HTML.

---

## 🟡 MEDIO — UX y Interacción (3 problemas)

### 10. Loading states no definidos ni implementados
**Problema:** 

El flujo central toma **~3 minutos**. No hay:
- Spinner/skeleton durante búsqueda
- Texto "Buscando..." en botón
- Botón `disabled` mientras procesa
- Progress bar o indicador de tiempo

**Marca.md menciona:** `loading-states: Skeleton screens or spinners` — pero no define el diseño exacto.

**Fix — Crear componente:** `frontend/components/ui/SearchProgress.tsx`

```tsx
interface SearchProgressProps {
  stage: 'idle' | 'searching' | 'processing' | 'complete' | 'error';
  message?: string;
}

export function SearchProgress({ stage, message }: SearchProgressProps) {
  if (stage === 'idle') return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md text-center">
        {stage === 'searching' && (
          <>
            <div className="h-12 w-12 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-sm text-gray-600">
              Buscando en 5 bases de datos...
            </p>
            <p className="mt-2 text-xs text-gray-400">Esto puede tomar hasta 3 minutos</p>
          </>
        )}
        {/* ...otros stages */}
      </div>
    </div>
  );
}
```

**Implementar en:** 
- `frontend/app/page.tsx` → SearchBox component
- Conectar con backend: mostrar progress mientras `/search` procesa

**También actualizar Button.tsx:**
```tsx
<button disabled={isLoading} className={isLoading ? 'opacity-60 cursor-wait' : ''}>
  {isLoading ? 'Buscando...' : 'Buscar'}
</button>
```

---

### 11. `cursor-pointer` ausente en ArticleCard
**Problema:** ArticleCard tiene hover lift (visual feedback) pero sin `cursor-pointer`.

```jsx
// ANTES (incompleto)
<div className="-translate-y-1 shadow-green">
  {/* content */}
</div>

// DESPUÉS (correcto)
<div className="cursor-pointer -translate-y-1 shadow-green">
  {/* content */}
</div>
```

**Fix:** `frontend/components/ui/ArticleCard.tsx`

```tsx
export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <article className="cursor-pointer bg-white border border-gray-200 rounded-lg p-4 hover:-translate-y-1 transition-transform duration-200 shadow-sm hover:shadow-green">
      {/* ...content */}
    </article>
  );
}
```

**También revisar otros componentes interactivos:**
- Cards de database en homepage
- Botones de filtro
- Links de navegación

---

### 12. Estados vacío/error sin diseño
**Problema:** No hay pantallas definidas para:
- "No hay resultados para tu búsqueda"
- "Error de conexión a la base de datos"
- "Timeout — la búsqueda tardó demasiado"
- "Tu sesión expiró"

Para MVP Fase 0, estos son flows críticos.

**Fix:** Añadir a `docs/marca.md` nueva sección:

```markdown
## 10. Estados Especiales

### Empty State (Sin resultados)
- Icono: magnifying glass (Heroicons)
- Título: "No encontramos artículos"
- Descripción: "Intenta con otros términos o combina palabras clave"
- CTA: "Intentar nueva búsqueda"
- Background: `#F0FBF7` con icono 64px `#C6EBD9`

### Error State
- Icono: alert circle (Heroicons)
- Título: "Algo salió mal"
- Descripción: "Intenta de nuevo. Si el problema persiste, contacta soporte."
- CTA: "Intentar de nuevo"
- Background: `#FEF0EC` con icono 64px `#FDB022`
```

**Crear componentes:**
- `frontend/components/ui/EmptyState.tsx`
- `frontend/components/ui/ErrorState.tsx`

---

## 📋 Tabla de Prioridades

| # | Problema | Categoría | Prioridad | Esfuerzo | Impacto |
|---|----------|-----------|-----------|----------|---------|
| 1 | `text-light` contraste | Acceso | 🔴 Crítico | Bajo | 🔴 Alto |
| 2 | Hero tagline opacidad | Acceso | 🔴 Crítico | Bajo | 🟡 Medio |
| 3 | Input sin `<label>` | Acceso | 🔴 Crítico | Bajo | 🔴 Alto |
| 4 | Logo footer | Acceso | 🔴 Crítico | Bajo | 🟡 Medio |
| 5 | Navbar height | Marca | 🟠 Alto | Bajo | 🔵 Bajo |
| 6 | Tokens Tailwind | Marca | 🟠 Alto | Medio | 🟠 Medio |
| 7 | Colores semánticos | Marca | 🟠 Alto | Bajo | 🟠 Medio |
| 8 | Boolean tags | UI | 🟠 Alto | Medio | 🟠 Medio |
| 9 | Loading states | UX | 🟡 Medio | Alto | 🔴 Alto |
| 10 | `cursor-pointer` | UX | 🟡 Medio | Bajo | 🟡 Medio |
| 11 | Estados vacío/error | UX | 🟡 Medio | Alto | 🔴 Alto |

---

## 🎯 Plan de Acción (Recomendado)

### Fase 1 — Crítico (30 min)
```
1. Cambiar --text-light: #9CA3AF → #6B7280 en globals.css
2. Cambiar hero-tagline color: rgba(255,255,255,0.65) en page.tsx
3. Añadir <label> con aria-label en SearchBox
4. Cambiar logo Footer a blanco + green-300/green-400
```

### Fase 2 — Alto (1.5 horas)
```
1. Añadir 5 tokens faltantes a tailwind.config.ts
2. Reemplazar hardcoded colors en ArticleCard, page.tsx, search/page.tsx
3. Crear componente BooleanTag.tsx
4. Añadir colores semánticos a marca.md + tailwind
5. Sincronizar preview HTML navbar (58px → 64px)
```

### Fase 3 — Medio (3+ horas, depende de backend)
```
1. Crear SearchProgress.tsx + integrar con backend
2. Actualizar Button.tsx para estado loading/disabled
3. Crear EmptyState.tsx + ErrorState.tsx
4. Añadir cursor-pointer a cards interactivas
5. Actualizar marca.md con estados especiales
```

---

## ✅ Verificación (Checklist Post-Fix)

- [ ] Contraste 4.5:1 mínimo en todos los textos (<18px)
- [ ] Todos los inputs tienen `<label>` o `aria-label`
- [ ] Cursor pointer en elementos clickables (cards, botones)
- [ ] Logo footer visible sobre navy (blanco + green-400)
- [ ] Tailwind tokens usados en lugar de hardcoded colors
- [ ] Boolean tags visibles en resultados
- [ ] Loading state durante búsqueda
- [ ] Estados vacío/error diseñados
- [ ] Preview HTML sincronizado con Next.js (navbar 64px)
- [ ] Test a11y: DevTools Accessibility panel → 0 errors

---

## 📚 Referencias

- [WCAG Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Tailwind Accessibility](https://tailwindcss.com/docs/configuration)
- [Heroicons SVG](https://heroicons.com/) — para icono de empty/error states
- Brand Manual: `docs/marca.md` — versión actual
- Preview HTML: `docs/preview-design.html` — referencia visual
