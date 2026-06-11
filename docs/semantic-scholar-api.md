# Semantic Scholar API - Guía de Implementación

## Estado Actual

**Endpoint:** `https://api.semanticscholar.org/graph/v1/paper/search`

**Rate Limit sin API Key:** ❌ 1 request cada 5 segundos (muy restrictivo)  
**Rate Limit con API Key:** ✅ Hasta 100 requests/segundo

---

## Respuesta Exitosa (Ejemplo)

```json
{
  "data": [
    {
      "paperId": "649def34f8be52c8b66281af98ae884c09aef38b",
      "title": "Mindfulness-Based Stress Reduction for Anxiety Disorders",
      "authors": [
        {
          "name": "Jon Kabat-Zinn",
          "authorId": "123456"
        },
        {
          "name": "Susan David",
          "authorId": "789012"
        }
      ],
      "year": 2005,
      "abstract": "Mindfulness-based interventions have shown significant effects on reducing anxiety...",
      "url": "https://www.semanticscholar.org/paper/649def34f8be52c8b66281af98ae884c09aef38b",
      "doi": "10.1176/appi.ajp.162.12.2236",
      "citationCount": 2345,
      "influence": 42.5,
      "isOpenAccess": true
    },
    {
      "paperId": "abcd1234efgh5678ijkl9012mnop3456qrst7890",
      "title": "Effects of Mindfulness Meditation on Adolescent Anxiety",
      "authors": [
        {
          "name": "Sara Johnson",
          "authorId": "345678"
        }
      ],
      "year": 2018,
      "abstract": "This study examines the effects of 8-week mindfulness training on anxiety...",
      "url": "https://www.semanticscholar.org/paper/abcd1234efgh5678ijkl9012mnop3456qrst7890",
      "doi": "10.1080/10717437.2018.1451635",
      "citationCount": 156,
      "influence": 8.3,
      "isOpenAccess": false
    }
  ],
  "total": 4521
}
```

---

## Campos Disponibles

| Campo | Tipo | Descripción |
|-------|------|------------|
| `paperId` | string | ID único del paper |
| `title` | string | Título del artículo |
| `authors` | array | Lista de autores con nombre e ID |
| `year` | int | Año de publicación |
| `abstract` | string | Resumen del artículo |
| `url` | string | URL del paper en Semantic Scholar |
| `doi` | string | Digital Object Identifier |
| `citationCount` | int | Número de citas |
| `influence` | float | Puntuación de influencia (0-100) |
| `isOpenAccess` | boolean | Si está disponible gratis |

---

## Obtener API Key (Gratuito)

### Pasos:

1. Ir a: https://www.semanticscholar.org/product/api
2. Hacer clic en "Register for a free API key"
3. Completar formulario con:
   - Email
   - Nombre
   - Institución/Empresa
   - Propósito de uso

4. API key se envía por email (formato: `{random-hex-string}`)

### Configurar en Backend

```bash
# En .env
SEMANTIC_SCHOLAR_API_KEY=your-api-key-here
```

### Usar en Requests

```bash
curl "https://api.semanticscholar.org/graph/v1/paper/search?query=mindfulness&limit=10&apiKey=YOUR_API_KEY"
```

---

## Cálculo de Relevancia (Actual)

```python
# Basado en citationCount
citation_count = paper.get("citationCount", 0) or 0
relevance_score = min(1.0, (citation_count + 1) / 100)

# Ejemplo:
# - 0 citas → 0.01 (1%)
# - 50 citas → 0.51 (51%)
# - 100+ citas → 1.0 (100%)
```

**Mejora Propuesta:**

```python
# Usar influence score (0-100) directamente
influence = paper.get("influence", 0) or 0
relevance_score = influence / 100.0  # Más preciso
```

---

## Comparación: Con/Sin API Key

| Aspecto | Sin Key | Con Key |
|---------|---------|---------|
| **Rate Limit** | 1 req/5s | 100 req/s |
| **Resultado** | ❌ 429 | ✅ Éxito |
| **Costo** | Gratis | Gratis (hasta cierto límite) |
| **Tiempo** | ✅ ~5 min para 50 papers | ✅ ~0.5s para 50 papers |

---

## Ejemplos de Uso

### Búsqueda Básica

```bash
curl -s "https://api.semanticscholar.org/graph/v1/paper/search?query=mindfulness+anxiety&limit=10&fields=title,authors,year,abstract,citationCount" \
  -H "x-api-key: YOUR_API_KEY"
```

### Búsqueda Avanzada con Filtros

```bash
# Query booleana
curl -s "https://api.semanticscholar.org/graph/v1/paper/search?query=(mindfulness+AND+adolescents)+NOT+elderly&limit=20&fields=title,authors,year,abstract,doi" \
  -H "x-api-key: YOUR_API_KEY"
```

---

## Manejo de Rate Limits (Implementado)

Tu código actual:

```python
# Retry con exponential backoff
max_retries = 3
for attempt in range(max_retries):
    response = await client.get(search_url, params=params)
    
    if response.status_code == 429:
        wait_time = (2 ** attempt) * 3  # 3s, 6s, 12s
        await asyncio.sleep(wait_time)
        continue
```

✅ **Correcto** - Espera antes de reintentar

---

## Problema Actual

❌ **Sin API Key:** Rate limited inmediatamente  
✅ **Con API Key:** Funcionará perfectamente

## Siguiente Paso

Obtener API key gratuito de Semantic Scholar y agregarlo a las variables de entorno.
