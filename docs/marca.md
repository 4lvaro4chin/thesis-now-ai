# Manual de Marca — ThesisNow v1.0

**Versión:** 1.0 · Junio 2026  
**Referencia HTML interactiva:** [docs/ThesisNow_Manual_de_Marca.html](ThesisNow_Manual_de_Marca.html)  
**Preview UI:** [docs/preview-design.html](preview-design.html)

---

## 1. Identidad y posicionamiento

| Elemento | Definición |
|----------|-----------|
| **Propósito** | Convertir la búsqueda bibliográfica académica —un proceso de 20 a 40 horas— en un reporte organizado que se genera en menos de 3 minutos |
| **Audiencia primaria** | Estudiantes de grado y posgrado en Latinoamérica y el mundo hispanohablante |
| **Audiencia secundaria** | Docentes, investigadores, universidades como institución |
| **Personalidad** | Inteligente pero accesible · Precisa pero cálida · Tecnológica pero humana · Confiable sin ser aburrida |
| **Emoción central** | **Alivio.** El estudiante llega con frustración y tiempo perdido. ThesisNow le devuelve horas de su vida |
| **Posicionamiento** | La única plataforma donde ingresas el título de tu tesis y recibes una revisión bibliográfica completa, organizada y descargable en minutos |

---

## 2. Logotipo

- **Tipo:** Wordmark tipográfica
- **Fuente:** DM Sans 600 (SemiBold)
- **Escritura:** `ThesisNow` — siempre junto, capitalización mixta. Nunca "Thesis Now", "THESISNOW" ni "thesis now"
- **"Thesis":** color navy `#1B2A4A`
- **"Now":** color verde primario `#1D9E75`
- **Zona de respeto:** mínimo ½ × la altura de la "x" del logotipo en todos sus lados

### Versiones autorizadas

| Versión | Fondo | Uso |
|---------|-------|-----|
| Principal | Blanco / claro | Uso general |
| Invertida | `#04342C` verde oscuro | Hero, navbar dark |
| Sobre verde | `#0F6E56` verde profundo | Banners, cabeceras |

### Lo que NO se hace

- No reemplazar colores del logo por verdes de sistema u otros colores
- No usar tipografías serif ni system fonts en el logotipo
- No escribir en MAYÚSCULAS
- No colocar el logo sobre gradientes
- No usar el logo con opacidad reducida
- No distorsionar ni inclinar la wordmark

---

## 3. Paleta de colores

### Verde ThesisNow (primario)

| Token | Hex | Uso |
|-------|-----|-----|
| `--green-50`  | `#F0FBF7` | Fondos de sección suave |
| `--green-100` | `#E1F5EE` | Fondo AND tags · badge "gratis" |
| `--green-300` | `#9FE1CB` | Textos secundarios sobre fondo oscuro |
| `--green-400` | `#5DCAA5` | Branding sobre fondos oscuros · "Now" invertido |
| `--green-500` | `#1D9E75` | **CTAs · acentos · toggle activo** ← primario |
| `--green-700` | `#0F6E56` | Hover botones · texto sobre verde claro |
| `--green-800` | `#085041` | Texto sobre green-100 |
| `--green-900` | `#04342C` | Hero · navbar dark · cabecera de reporte |

### Azul marino

| Token | Hex | Uso |
|-------|-----|-----|
| `--navy` | `#1B2A4A` | Títulos · logo "Thesis" · encabezados de sección |

### Grises neutros

| Token | Hex | Uso |
|-------|-----|-----|
| `--text`       | `#2D3748` | Texto principal |
| `--text-mid`   | `#374151` | Texto de interfaz general |
| `--text-muted` | `#6B7280` | Texto secundario · subtítulos · labels |
| `--text-light` | `#9CA3AF` | Metadatos · textos terciarios |
| `--border`     | `#E8EDEB` | Bordes de tarjetas · separadores |
| `--bg`         | `#F4F6F5` | Fondo de página |
| `--white`      | `#FFFFFF` | Superficies de cards · inputs |

### Accesibilidad

- `#1D9E75` sobre blanco → ratio 3.8:1 (cumple AA para texto grande y componentes)
- Para texto pequeño (<18px) sobre blanco → usar `#0F6E56` (ratio 6.1:1, cumple AA)

---

## 4. Tags booleanos

Los chips de operadores booleanos usan `font-family: monospace` y los siguientes colores:

| Operador | Fondo | Texto | Uso |
|----------|-------|-------|-----|
| `AND`   | `#E1F5EE` | `#0F6E56` | Términos obligatorios |
| `OR`    | `#EBF4FD` | `#1B6FA8` | Sinónimos alternativos |
| `NOT`   | `#FEF0EC` | `#A33820` | Exclusiones semánticas |
| `TRUNC` | `#FDF4E3` | `#8A5100` | Truncaciones (`mindful*`) |

---

## 5. Tipografía

### Fuentes

| Fuente | Pesos | Rol |
|--------|-------|-----|
| **DM Sans** | 300 · 400 · 500 · 600 | Fuente principal de toda la UI |
| **Cormorant Garamond** | 400 · 600 · italic | Editorial: taglines de hero, portadas, pullquotes |

Google Fonts import:
```
DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400
Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600
```

### Escala tipográfica

| Nombre | Tamaño | Peso | Uso |
|--------|--------|------|-----|
| Display | 38–68px | 600 | Hero H1 · portadas |
| H1 | 24–34px | 600 | Títulos de sección |
| H2 | 20px | 600 | Subtítulos de contenido |
| H3 | 16–18px | 600 | Nombres de tarjeta |
| Body | 14–15px | 400 | Texto de interfaz · descripciones |
| Small | 13px | 400 | Metadatos · labels de formulario |
| Caption | 11px | 600 | Etiquetas · badges · eyebrows (uppercase) |

**Regla sobre fondos de color:** texto sobre fondos verdes 100–300 siempre en stop 700 o más oscuro.

---

## 6. Componentes de UI

### Botones

| Variante | Fondo | Texto | Uso |
|----------|-------|-------|-----|
| Primary | `#1D9E75` | Blanco | CTA principal |
| Primary hover | `#0F6E56` | Blanco | Estado hover |
| Secondary | Blanco | `#374151` | Acciones secundarias |
| Outlined | Blanco | `#1D9E75` | Acciones terciarias |
| Soft | `#E1F5EE` | `#0F6E56` | Acciones contextuales |

**Shadow en botones primary:** `0 2px 8px rgba(29,158,117,0.3)`  
**Press state:** `transform: scale(0.98)` en `:active`

### Badges y etiquetas

| Badge | Fondo | Texto |
|-------|-------|-------|
| Gratis | `#E1F5EE` | `#0F6E56` |
| Premium | `#FDF4E3` | `#8A5100` |
| Match % | `#EBF4FD` | `#1B6FA8` |
| Base de datos | `#F0FBF7` con borde `#C6EBD9` | `#085041` |
| Más elegido | `#1D9E75` | Blanco |

### Toggle / Switch

- Activo: fondo `#1D9E75`, thumb blanco a la derecha
- Inactivo: fondo `#D1D5DB`, thumb blanco a la izquierda

### Callout / Nota informativa

- Fondo: `#F0FBF7`
- Borde izquierdo: 3px `#1D9E75`
- Texto: `#4B7A68`

### Banner de comunicación

- Fondo: `#04342C`
- Texto: `#9FE1CB`

---

## 7. Sombras

Siempre tintadas en verde, nunca negro puro:

```css
--shadow-sm:       0 1px 4px rgba(27,42,74,0.06);
--shadow-green:    0 4px 20px rgba(15,110,86,0.12);
--shadow-green-lg: 0 8px 40px rgba(15,110,86,0.16);
```

---

## 8. Voz y tono

| Atributo | Descripción |
|----------|-------------|
| Directa y precisa | Elimina el ruido. Cada palabra existe para ayudar al estudiante a avanzar |
| Cálida, no condescendiente | Habla como un amigo que sabe más. Usa "tú" siempre, nunca "usted" |
| Orientada a la acción | Los botones dicen exactamente qué pasa al presionarlos |
| Inteligente sin ser técnica | Menciona tecnología solo cuando añade valor para el usuario |

### Ejemplos

| Sí | No |
|----|-----|
| "Ingresa el título de tu tesis. El resto lo hacemos nosotros." | "Por favor ingrese el texto de su consulta bibliográfica para iniciar el proceso de recuperación de información." |
| "Tu búsqueda está lista. Encontramos 847 artículos en 5 bases de datos." | "El proceso de búsqueda ha concluido satisfactoriamente. Se han recuperado un total de 847 registros bibliográficos." |
| "Sin suscripciones. Pagas una vez, los créditos no vencen nunca." | "Nuestro innovador modelo de créditos le ofrece total flexibilidad sin compromisos de suscripción recurrente." |

---

## 9. Layout y espaciado

- **Max-width contenedor:** `1100px` con padding lateral `48px`
- **Radios:** `6px` chips · `8px` botones/inputs · `10–12px` cards · `14–16px` modales
- **Tema:** Light (no dark) como base — el único dark es el hero y pantalla de progreso
- **Responsive:** Desktop-first · funcional en 1280px y 768px
- **Animaciones de entrada:** `fade-up` staggered (0.6s ease, delays de 50–420ms)
