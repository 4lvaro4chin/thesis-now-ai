# ThesisNow Backend

FastAPI service para automatizar búsqueda bibliográfica académica.

**Stack:** FastAPI · Uvicorn · Pydantic · Supabase · OpenAI (GPT-4o-mini)

## Setup Rápido

### Opción 1: Con Poetry (Recomendado)
```bash
# Linux/Mac
chmod +x setup.sh && ./setup.sh

# Windows (PowerShell)
.\setup.ps1

# O manualmente:
poetry install
poetry run uvicorn main:app --reload --port 8000
```

### Opción 2: Con pip
```bash
pip install -r requirements.txt
cp .env.example .env
# Edita .env con tus credenciales
uvicorn main:app --reload --port 8000
```

## Configuración

Copia `.env.example` a `.env` y completa:
```bash
OPENAI_API_KEY=sk-...                          # Tu API key OpenAI
SUPABASE_URL=https://...supabase.co            # Tu proyecto Supabase  
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...          # Service role key
PORT=8000
ENV=development
```

**Acceder:**
- API: http://localhost:8000
- Docs (Swagger): http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### Health Check
```
GET /health
Response: {"status": "ok", "timestamp": "2024-06-10T12:00:00"}
```

### Start Search
```
POST /search
Request: {
  "title": "Mindfulness interventions in adolescents",
  "databases": ["pubmed", "semantic_scholar"]
}
Response: {"job_id": "uuid", "status": "pending"}
```

### Poll Search Status
```
GET /search/{job_id}
Response: {
  "id": "uuid",
  "title": "...",
  "status": "completed",
  "boolean_query": "...",
  "results": [...],
  "error": null
}
```

## Architecture

```
main.py
  ├── /services
  │   ├── nlp_service.py (GPT-4o-mini)
  │   └── search_service.py (Orchestrator)
  └── /connectors
      ├── pubmed.py (NCBI E-utilities)
      └── semantic_scholar.py (Semantic Scholar API)
```

## Status Flow

1. **pending** → Initial state
2. **generating_query** → Creating boolean query with GPT
3. **searching** → Fetching results from databases
4. **completed** → Done (results available)
5. **error** → Failed (check error field)

## Database Connectors

### PubMed
- API: NCBI E-utilities
- Query type: Boolean search operators
- Max results: 100 per request
- Response format: XML

### Semantic Scholar
- API: Semantic Scholar Graph v1
- Query type: Keyword search
- Max results: 100 per request
- Response format: JSON

## Próximos Pasos (Semana 2)

### Prioridad Crítica
- **[⚠️ BLOQUEADOR]** Reactivar OpenAI (agregar créditos o esperar reset de quota)
  - Sin esto, NLP usa fallback diccionario (baja calidad)
  - Con esto: GPT-4o-mini generará queries avanzadas

### Testing
- [ ] Unit tests NLP: 5 títulos distintos → queries válidas
- [ ] Integration tests PubMed: conexión + query parsing
- [ ] Integration tests Semantic Scholar: conexión + response handling
- [ ] End-to-end test: título → query → búsqueda → resultados

### Deploy
- [ ] Crear `poetry.lock` (`poetry lock`)
- [ ] Deploy a Railway con uvicorn
- [ ] Configurar CORS para vercel.app en producción
- [ ] Conectar frontend a `/search` y `/search/{job_id}`

### Nice-to-have (Post-MVP)
- Deduplicación avanzada (DOI, PMID, título normalizado)
- Scoring de relevancia por base
- Caching de queries repetidas
- Métricas (tiempo, count por base)
