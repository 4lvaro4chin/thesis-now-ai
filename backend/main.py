import os
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import logging
import uuid
from typing import Optional
from datetime import datetime

# Config
from dotenv import load_dotenv
load_dotenv()

# Services
from services.nlp_service import NLPService
from services.search_service import SearchService

# Schemas
from schemas import SearchRequest, SearchStatus

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="ThesisNow Backend", version="0.1.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://thesis-now-ai.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Services
try:
    nlp_service = NLPService()
    search_service = SearchService()
except Exception as e:
    logger.error(f"Failed to initialize services: {str(e)}")
    logger.warning("Services will be unavailable until credentials are configured")
    nlp_service = None
    search_service = None

# In-memory job store (TODO: move to Supabase)
jobs = {}

@app.get("/health")
async def health():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}

@app.post("/nlp/generate-query")
async def generate_query_only(request: SearchRequest):
    """
    Generate a boolean query without executing the search.
    Used for preview/validation before full search.
    """
    try:
        query = await nlp_service.generate_query(request.title)
        return {"query": query}
    except Exception as e:
        logger.error(f"Error generating query: {str(e)}")
        return {"query": f'"{request.title}"', "error": str(e)}

@app.post("/search")
async def start_search(request: SearchRequest, background_tasks: BackgroundTasks):
    """
    Start a new bibliographic search.
    Returns immediately with a job_id for polling.
    """
    job_id = str(uuid.uuid4())

    jobs[job_id] = {
        "id": job_id,
        "title": request.title,
        "status": "pending",
        "boolean_query": None,
        "results": None,
        "error": None,
        "created_at": datetime.utcnow().isoformat(),
    }

    # Queue the search in background
    background_tasks.add_task(execute_search, job_id, request)

    return {"job_id": job_id, "status": "pending"}

@app.get("/search/{job_id}")
async def get_search_status(job_id: str):
    """
    Poll for search status and results.
    """
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Search not found")

    return jobs[job_id]

async def execute_search(job_id: str, request: SearchRequest):
    """
    Execute the search in background:
    1. Generate boolean query from title
    2. Search in multiple databases in parallel
    3. Deduplicate and score results
    """
    try:
        # Step 1: NLP - Generate boolean query
        jobs[job_id]["status"] = "generating_query"
        logger.info(f"[{job_id}] Generating boolean query for: {request.title}")

        boolean_query = await nlp_service.generate_query(request.title)
        jobs[job_id]["boolean_query"] = boolean_query

        # Step 2: Search
        jobs[job_id]["status"] = "searching"
        logger.info(f"[{job_id}] Searching with query: {boolean_query}")

        results = await search_service.search_all_databases(
            boolean_query,
            request.databases or ["pubmed", "semantic_scholar"]
        )

        jobs[job_id]["results"] = results
        jobs[job_id]["status"] = "completed"
        jobs[job_id]["completed_at"] = datetime.utcnow().isoformat()
        logger.info(f"[{job_id}] Search completed. Found {len(results)} results.")

    except Exception as e:
        logger.error(f"[{job_id}] Error: {str(e)}")
        jobs[job_id]["status"] = "error"
        jobs[job_id]["error"] = str(e)

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
