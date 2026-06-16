# Bases de Datos API — ThesisNow

## Conectores Implementados

### 1. **PubMed / MEDLINE** (NCBI)
- **API:** E-utilities (RESTful XML)
- **Base URL:** `https://eutils.ncbi.nlm.nih.gov/entrez/eutils`
- **Cobertura:** 35M+ biomedical/life sciences papers
- **Campos retornados:** PMID, título, autores, año, DOI, abstract
- **Auth:** Sin requerimiento
- **Rate limits:** 3 req/seg (sin API key), 10 req/seg (con email)
- **Implementación:** `backend/connectors/pubmed.py`
- **Estado:** ✅ Producción (Fase 0)

### 2. **Semantic Scholar**
- **API:** RESTful JSON
- **Base URL:** `https://api.semanticscholar.org/graph/v1/paper/search`
- **Cobertura:** 200M+ papers multidisciplinarios
- **Campos retornados:** Título, autores, año, DOI, abstract, citationCount, openAccessPdf
- **Auth:** x-api-key header (gratuita, requiere registro)
- **Rate limits:** 100 req/seg
- **Implementación:** `backend/connectors/semantic_scholar.py`
- **Estado:** ✅ Producción (Fase 0)
- **Notas:** Exponential backoff implementado (3s → 6s → 12s para 429)

### 3. **Europe PMC** ⭐ (NUEVO)
- **API:** RESTful JSON
- **Base URL:** `https://www.ebi.ac.uk/europepmc/webservices/rest/search`
- **Cobertura:** 40M+ papers life sciences, biomedicine, humanities
- **Campos retornados:** Título, autores, año, DOI, PMID, PMCID, abstract, journalTitle, isOpenAccess
- **Auth:** Sin requerimiento
- **Rate limits:** 100 req/seg
- **Implementación:** `backend/connectors/europepmc.py`
- **Estado:** ✅ Producción (Fase 0+)
- **Ventaja:** Más papers que PubMed, mejor cobertura de humanities
- **Deduplicación:** Por DOI, PMID, o título normalizado

### 4. **arXiv** (Preparado, no activado)
- **API:** OAI-PMH + REST
- **Base URL:** `http://export.arxiv.org/api/query`
- **Cobertura:** 2.3M papers Physics, CS, Math, Stats, Q-Bio
- **Campos:** ArXiv ID, título, autores, año, abstract
- **Auth:** Sin requerimiento
- **Rate limits:** Respetuoso (documentación poco clara)
- **Implementación:** `backend/connectors/arxiv.py`
- **Estado:** ⏳ Disponible (usar en Fase 1+)

### 5. **OpenAlex** (Preparado, no activado)
- **API:** RESTful JSON
- **Base URL:** `https://api.openalex.org/works`
- **Cobertura:** 250M+ papers, metadata de publicaciones
- **Campos:** OpenAlex ID, título, autores, año, DOI, citationCount
- **Auth:** Sin requerimiento
- **Rate limits:** 100 mil req/día
- **Implementación:** `backend/connectors/openalex.py`
- **Estado:** ⏳ Disponible (usar en Fase 1+)

### 6. **CrossRef** (Preparado, no activado)
- **API:** RESTful JSON
- **Base URL:** `https://api.crossref.org/works`
- **Cobertura:** 150M+ artículos indexados
- **Campos:** DOI, título, autores, año, citationCount
- **Auth:** Sin requerimiento (mejor con User-Agent)
- **Rate limits:** 50 req/seg
- **Implementación:** `backend/connectors/crossref.py`
- **Estado:** ⏳ Disponible (usar en Fase 1+)

---

## Flujo de Búsqueda Actual (Fase 0+)

```
Usuario ingresa título
        ↓
Backend NLP genera query booleana
        ↓
SearchService ejecuta en paralelo:
        ├─ PubMed search()
        ├─ Semantic Scholar search()
        └─ Europe PMC search()
        ↓
Deduplicación por DOI/PMID/título
        ↓
RelevanceScorer: 30% recencia + 70% citas
        ↓
Resultados ordenados por relevancia
        ↓
Frontend muestra resultados agrupados por fuente
```

---

## Cómo Activar una Base de Datos Nueva

### Paso 1: Crear conector
```python
# backend/connectors/my_database.py
class MyDatabaseConnector:
    async def search(self, query: str, max_results: int = 50) -> List[SearchResult]:
        # Implementar búsqueda
        pass
```

### Paso 2: Registrar en SearchService
```python
# backend/services/search_service.py
from connectors.my_database import MyDatabaseConnector

self.connectors = {
    "pubmed": PubMedConnector(),
    "semantic_scholar": SemanticScholarConnector(),
    "europepmc": EuropePMCConnector(),
    "my_database": MyDatabaseConnector(),  # ← agregar aquí
}
```

### Paso 3: Actualizar documentación
- Agregar en `docs/alcance.md`
- Agregar en `docs/databases-api.md`
- Actualizar frontend si necesita UI específica

### Paso 4: Testear
```python
# backend/test_connectors.py
async def test_my_database():
    connector = MyDatabaseConnector()
    results = await connector.search("test query", max_results=10)
    assert len(results) > 0
```

---

## Status de Bases de Datos por Fase

| BD | Fase 0 | Fase 1 | Fase 2 | Notas |
|---|--------|--------|--------|-------|
| PubMed | ✅ | ✅ | ✅ | Activa, producción |
| Semantic Scholar | ✅ | ✅ | ✅ | Activa, producción |
| Europe PMC | ✅ | ✅ | ✅ | Activa (nueva) |
| arXiv | — | ✅ | ✅ | Implementada, inactiva |
| OpenAlex | — | ✅ | ✅ | Implementada, inactiva |
| CrossRef | — | ✅ | ✅ | Implementada, inactiva |
| ScienceDirect | — | — | ✅ | Requiere API key paga |
| Scopus | — | — | ⏳ | Requiere API key paga + contract |

---

## Métricas de Cobertura

Búsqueda típica: "mindfulness adolescents anxiety"

| BD | Resultados | Tiempo | Metadata | Open Access |
|---|-----------|--------|----------|------------|
| PubMed | 15–20 | ~18s | ⭐⭐⭐⭐ | ~30% |
| Semantic Scholar | 5–10 | ~4s | ⭐⭐⭐⭐⭐ | 100% |
| Europe PMC | 20–30 | ~6s | ⭐⭐⭐⭐ | ~50% |
| **Total (dedup)** | **25–35** | **~30s** | | |

---

## Deduplicación de Resultados

Orden de prioridad:
1. **DOI** (exactitud máxima)
2. **PMID/PMCID** (papers en NCBI)
3. **Título normalizado** (fallback, requiere match exacto)

Si un paper aparece en múltiples BDs:
- Conservar el resultado con metadata más completa
- Unificar URL (prioridad: DOI → PMCID → PMID → DOI URL)
- Usar citation_count del que tenga mayor valor

---

## Próximos Pasos (Fase 1+)

- [ ] Activar arXiv (preprints recientes)
- [ ] Activar OpenAlex (cobertura global)
- [ ] Investigar ScienceDirect API (requiere contrato)
- [ ] Agregar CrossRef para citas en papers sin Semantic Scholar
- [ ] Implementar caché Redis para búsquedas duplicadas
