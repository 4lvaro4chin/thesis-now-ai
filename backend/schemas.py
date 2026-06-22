from typing import Optional, List
from pydantic import BaseModel, Field

class SearchRequest(BaseModel):
    title: str = Field(..., min_length=3, max_length=500)
    databases: Optional[List[str]] = None
    lang: Optional[str] = "es"
    year_from: Optional[int] = None
    year_to: Optional[int] = None
    doc_types: Optional[List[str]] = None
    lang_filter: Optional[List[str]] = None
    open_access_only: Optional[bool] = False
    peer_reviewed_only: Optional[bool] = False

    class Config:
        example = {
            "title": "Mindfulness interventions in adolescents",
            "databases": ["pubmed", "semantic_scholar", "openalex", "crossref", "arxiv"],
            "lang": "es",
            "year_from": 2015,
            "year_to": 2024,
            "doc_types": ["article", "thesis"],
            "lang_filter": ["en", "es"],
            "open_access_only": False,
            "peer_reviewed_only": False
        }

class BooleanQuery(BaseModel):
    query: str
    terms: List[str]
    operators: dict

class SearchResult(BaseModel):
    source: str
    title: str
    authors: Optional[List[str]]
    year: Optional[int]
    doi: Optional[str]
    pmid: Optional[str]
    url: Optional[str]
    abstract: Optional[str]
    citation_count: Optional[int] = Field(default=0)
    relevance_score: float = Field(default=0.5, ge=0, le=1)

class SearchStatus(BaseModel):
    id: str
    title: str
    status: str
    boolean_query: Optional[str]
    explanation: Optional[str]
    results: Optional[List[SearchResult]]
    error: Optional[str]
    created_at: str
    completed_at: Optional[str] = None
