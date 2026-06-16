from typing import Optional, List
from pydantic import BaseModel, Field

class SearchRequest(BaseModel):
    title: str = Field(..., min_length=3, max_length=500)
    databases: Optional[List[str]] = None
    lang: Optional[str] = "es"

    class Config:
        example = {
            "title": "Mindfulness interventions in adolescents",
            "databases": ["pubmed", "semantic_scholar", "openalex", "crossref", "arxiv"],
            "lang": "es"
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
