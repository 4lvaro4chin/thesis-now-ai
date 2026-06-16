# Rediseño UX/UI — ThesisNow v0.2+
**Objetivo:** Diferenciación visual clara. Elegante para académicos, moderno para estudiantes. No plantilla.

---

## 🎨 Principios de Diseño

### 1. **Tipografía como Protagonista**
- **Cormorant Garamond:** Mantener, pero MUCHO MÁS GRANDE en hero/titles
  - Landing hero: 72px → 96px (más drama)
  - Subtítulos: 24px → 36px
  - Body: 16px → 18px (más legibilidad, menos "startup")
- **DM Sans:** Solo para pequeños detalles (metadata, timestamps, botones)
- **Contraste:** Hierarchy clara. No confusión.

### 2. **Paleta: Neutral + Accent Audaz**
Cambio de: verde suave + gradientes blandos
Cambio a: **neutral dominante** + **verde como statement**

```
Primario:     #0a0a0a (casi negro, sofisticado)
Secundario:   #f5f5f5 (blanco roto, menos aséptico)
Accent:       #00d966 (verde brillante, statement — solo en CTAs, highlights)
Neutral:      #6b6b6b (gris cálido para body text)
Border:       #e5e5e5 (sutil, no dominante)
```

### 3. **Layout: Asimetría Intencional**
- Hero: Texto GRANDE en lado izquierdo, espacio vacío + pequeño gráfico derecha (no centrado)
- Secciones: Alterna left/right para ritmo visual
- Gridding: Columnas desalineadas propositalmente (no rectángular perfecto)
- Espaciado: Dramático (100px+ entre secciones vs 40px en v0.1)

### 4. **Micro-Interacciones sin Overdoing**
- **Hover en botones:** Cambio sutil de color + translateY(-2px), sin animaciones largas
- **Loading:** Skeleton cards + progress bar que avanza suave (no saltando)
- **Resultados aparecen:** Fade-in suave al llegar, no pop brusco
- **Inputs focus:** Border color accent, shadow suave, sin glow
- **Scroll:** Parallax sutil en hero (1-2% offset), NO excesivo

### 5. **Contenido > Forma**
- Menos elementos decorativos
- Mensajes claros: "Busca cientos de papers en segundos"
- Menos explicación: La herramienta habla por sí sola
- Copy confiado: "Encuentra. Organiza. Escribe." (vs "Descubre un mundo de posibilidades")

---

## 📄 Rediseño por Página

### Landing (`/`)

#### Hero Section
```
[Izquierda — 60% ancho]
"Encuentra Papers
Sin Perder Horas"

Subtítulo sutil: "Búsqueda bibliográfica inteligente en < 3 minutos"

[Botón primario verde] "Empezar Ahora"

[Derecha — 40% ancho]
[Simple icon/illustration: gráfico minimalista de papers/network]
```

**Estilo:**
- Cormorant 96px bold, #0a0a0a
- Subtítulo Cormorant 24px, #6b6b6b
- Fondo: #f5f5f5 (blanco roto)
- Espaciado top/bottom: 120px cada uno
- NO gradientes, NO efectos

#### Section "Cómo Funciona"
- 3 pasos en VERTICAL (no horizontal)
- Números grandes (#00d966) + Cormorant 64px
- Cada paso: icono + título Cormorant 28px + descripción corpo
- Alternancia left/right por drama visual

#### Bases de Datos
- Grid de 3 columnas (no 5)
- Cards minimalistas: solo logo + nombre
- Border sutil, sin hover exagerado
- Text: "Buscamos en 2 bases de datos públicas. Más próximamente."

#### Footer
- Minimal: links + copyright
- Fondo #0a0a0a (casi negro)
- Text #f5f5f5

### Search (`/search`)

#### Layout: "Dos Columnas Asimétricas"
```
[Izquierda — 70%]
Title input: Cormorant 36px, placeholder gris
Descripción: "Tu pregunta de investigación. Sé específico."
Query builder: Tokens coloridos sobre fondo #f5f5f5 (sin borde grueso)

[Derecha — 30%]
"Bases de datos"
Checkboxes simples (sin toggle switch)
Texto: "Selecciona dónde buscar"
```

**Estilo:**
- Input focus: border color #00d966 (1px, no shadow)
- Query builder: fondo neutral, border sutil
- Botón "Buscar": Verde #00d966, texto #0a0a0a, padding 16px 40px
- Hover: fondo más oscuro, sin shadow

### Searching (`/searching`)

#### Progress Visual
- Barra de progreso: ancho de pantalla, altura 4px, color #00d966
- Abajo de la barra: "Buscando en X base(s)... 45%"
- Cards de status: minimal (solo nombre base + estado dot: ⚪ pendiente, 🟢 done)
- NO animation excessive, NO 3-dots bouncing

#### Copy Tono
"Estamos revisando publicaciones académicas para ti"
(vs "Cargando resultados...")

### Results (`/results`)

#### Filtros (Sidebar Izquierda)
- Mínimos: Año, Fuente, Relevancia
- Sin expansión visual dramática
- Fondo: #f5f5f5

#### Grid de Resultados (Derecha)
- Cards sin shadow (solo border #e5e5e5)
- Hover: fondo #f5f5f5 (sutil, no popup)
- Badge fuente: pequeño, esquina superior derecha
- Relevancia: barra horizontal 4px debajo del title (color #00d966 si >70%, #6b6b6b si <70%)
- Abstract: 3 líneas, truncado, "Leer más" expandible

#### Export Bar (Abajo)
- Sticky, blanco con border top sutil
- Botones: "Descargar PDF" (verde), "Descargar Word" (gris)

---

## 🎬 Micro-Interacciones Clave

### 1. Input Focus
```css
input:focus {
  border-color: #00d966;
  box-shadow: none;  /* NO shadow */
  outline: none;
}
```

### 2. Button Hover
```css
button:hover {
  background-color: darken(#00d966, 10%);
  transform: translateY(-2px);
  transition: all 0.2s ease;
}
```

### 3. Card Hover (Results)
```css
.result-card:hover {
  background-color: #f5f5f5;
  border-color: #d0d0d0;
  /* No shadow, no scale */
}
```

### 4. Loading Animation
```
Progress bar: 0% → 100% smooth over 90 seconds (no jumps)
Status dot: pulse suave (opacity 0.8 → 1.0 en 1s loop)
```

### 5. Result Entrance
```
Fade-in: opacity 0 → 1 over 0.3s
No translate, no scale
Stagger: cada card entra 30ms después (efecto cascada suave)
```

---

## 📱 Responsive (Mobile First)

### Mobile (<768px)
- Hero: single column, Cormorant 56px (no 96px)
- Sections: full-width stacking
- Query builder: single column
- Results: single column cards
- Footer: vertical stacking

### Tablet (768px - 1024px)
- Hero: 2 columnas pero apretadas
- Seções: 2 columnas
- Query builder: vertical stacking

### Desktop (1024px+)
- Como diseño arriba

---

## 🔄 Diferenciadores vs Plantilla Genérica

| Aspecto | Plantilla Genérica | ThesisNow Rediseño |
|---------|-------------------|-------------------|
| **Tipografía** | San-serif uniforme 16px | Serif 96px hero + sans detalles |
| **Colores** | Gradientes blandos + blur | Neutral #0a0a0a + verde statement |
| **Layout** | Centrado simétrico | Asimetría intencional |
| **Decoración** | Glassmorphism, blobs | Minimal, bordes sutiles |
| **Interacciones** | Animaciones largas (300ms+) | Transiciones rápidas (200ms) |
| **Jerarquía** | Confusa, muchas capas | Clara: 3 niveles max |
| **Tono Copy** | Aspiracional ("Revoluciona tu...") | Directo ("Encuentra papers rápido") |

---

## 🛠️ Implementación Sugerida

### Fase 1: Crítico
- [ ] Landing hero nuevo (tipografía grande, layout asimetría)
- [ ] Paleta CSS update (neutral + verde)
- [ ] Search/Searching/Results cleanup (menos elementos)

### Fase 2: Pulido
- [ ] Micro-interacciones refinadas
- [ ] Mobile testing en dispositivos reales
- [ ] Copy tono unificado

### Fase 3: Detalles
- [ ] Animaciones de entrada suaves
- [ ] Hover states finales
- [ ] Dark mode (si aplica)

---

## 🎯 Validación

**Para estudiantes:** "Se ve moderno, no es una plantilla aburrida"
**Para académicos:** "Se ve profesional, no es un juguete"

Si ambos piensan eso → ganamos. ✅

