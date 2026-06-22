import httpx
import logging
import asyncio
from typing import List, Optional, Dict, Any
from schemas import SearchResult

logger = logging.getLogger(__name__)

class OpenAlexConnector:
    """OpenAlex API - Free, no auth required, includes full text search"""

    BASE_URL = "https://api.openalex.org/works"
    TIMEOUT = 30
    MAILTO = "digitalcorepro@gmail.com"  # Polite pool - improves rate limit

    async def search(self, query: str, filters: dict = None, max_results: int = 50) -> List[SearchResult]:
        """
        Search OpenAlex using the works endpoint.
        OpenAlex is free and doesn't require authentication.
        Note: OpenAlex uses simple keyword search, not boolean syntax.
        We extract key terms from the boolean query.
        """
        try:
            async with httpx.AsyncClient(timeout=self.TIMEOUT) as client:
                # OpenAlex doesn't support boolean syntax; extract main terms
                simple_query = self._simplify_query(query)

                params = {
                    "search": simple_query,
                    "per-page": min(max_results, 50),
                    "select": "id,title,authorships,publication_year,doi,cited_by_count,abstract_inverted_index,is_oa,primary_location",
                    "mailto": self.MAILTO,
                }

                # Apply filters via OpenAlex filter syntax
                filter_parts = []
                if filters:
                    if filters.get("year_from") or filters.get("year_to"):
                        year_from = filters.get("year_from", 1900)
                        year_to = filters.get("year_to", 9999)
                        filter_parts.append(f"publication_year:{year_from}-{year_to}")
                    if filters.get("doc_types"):
                        type_map = {"article": "journal-article", "thesis": "dissertation", "conference paper": "conference-proceeding", "preprint": "preprint", "review": "review"}
                        oa_types = [type_map.get(t, t) for t in filters["doc_types"]]
                        filter_parts.append(",".join([f"type:{t}" for t in oa_types]))
                    if filters.get("open_access_only"):
                        filter_parts.append("open_access.is_oa:true")

                if filter_parts:
                    params["filter"] = ",".join(filter_parts)

                logger.info(f"OpenAlex search: {query}")

                # OpenAlex is generally stable, but include one retry for network issues
                max_retries = 2
                for attempt in range(max_retries):
                    try:
                        response = await client.get(self.BASE_URL, params=params)

                        if response.status_code == 429:
                            # Rate limit - wait and retry
                            wait_time = (2 ** attempt) * 3  # 3s, 6s
                            logger.warning(f"OpenAlex rate limit. Waiting {wait_time}s...")
                            await asyncio.sleep(wait_time)
                            continue

                        response.raise_for_status()

                        data = response.json()
                        works = data.get("results", [])

                        if not works:
                            logger.info("OpenAlex: No results found")
                            return []

                        logger.info(f"OpenAlex: Found {len(works)} results")

                        # Convert to SearchResult
                        results = []
                        for work in works:
                            try:
                                result = SearchResult(
                                    source="openalex",
                                    title=work.get("title", "Unknown"),
                                    authors=self._extract_authors(work),
                                    year=work.get("publication_year"),
                                    doi=self._clean_doi(work.get("doi")),
                                    pmid=None,  # OpenAlex doesn't provide PMIDs
                                    url=work.get("id"),  # OpenAlex ID is a public URL
                                    abstract=self._reconstruct_abstract(work.get("abstract_inverted_index")),
                                    citation_count=work.get("cited_by_count", 0),
                                    relevance_score=0.5,
                                )
                                results.append(result)
                            except Exception as e:
                                logger.warning(f"Error parsing OpenAlex work: {str(e)}")
                                continue

                        return results

                    except httpx.HTTPStatusError as e:
                        if e.response.status_code == 429 and attempt < max_retries - 1:
                            continue  # Retry
                        else:
                            raise

                # All retries exhausted
                logger.error("OpenAlex: All retries exhausted")
                return []

        except asyncio.TimeoutError:
            logger.error("OpenAlex: Request timeout")
            return []
        except Exception as e:
            logger.error(f"OpenAlex error: {str(e)}")
            return []

    def _extract_authors(self, work: Dict[str, Any]) -> Optional[List[str]]:
        """Extract author names from OpenAlex authorships"""
        authors = []
        for authorship in work.get("authorships", []):
            if authorship.get("author", {}).get("display_name"):
                authors.append(authorship["author"]["display_name"])
        return authors[:10] if authors else None  # Cap to 10 authors

    def _clean_doi(self, doi: Optional[str]) -> Optional[str]:
        """OpenAlex returns DOI as URL: https://doi.org/10.1234/..."""
        if doi and doi.startswith("https://doi.org/"):
            return doi.replace("https://doi.org/", "")
        return doi

    def _reconstruct_abstract(self, inverted_index: Optional[Dict[str, List[int]]]) -> Optional[str]:
        """
        OpenAlex stores abstracts as inverted index: {word: [position, ...]}
        Reconstruct the original text.
        """
        if not inverted_index:
            return None

        # Build a position -> word map
        words = {}
        for word, positions in inverted_index.items():
            for pos in positions:
                words[pos] = word

        # Reconstruct in order
        if not words:
            return None

        return " ".join(words[i] for i in sorted(words.keys()))

    def _simplify_query(self, boolean_query: str) -> str:
        """
        Convert boolean query to simple keyword search for OpenAlex.
        Remove operators (AND, OR, NOT), parentheses, and wildcards.
        Keep only the search terms.
        Example: "education* AND machine AND learning* NOT (adult OR elderly)"
                 -> "education machine learning"
        """
        import re

        # Remove NOT clauses (NOT (...) or NOT term)
        query = re.sub(r'\bNOT\s+(?:\([^)]*\)|[^\s()]+)', '', boolean_query, flags=re.IGNORECASE)

        # Remove operators
        query = re.sub(r'\b(AND|OR)\b', '', query, flags=re.IGNORECASE)

        # Remove parentheses
        query = query.replace('(', '').replace(')', '')

        # Remove wildcards (*)
        query = query.replace('*', '')

        # Clean up excess whitespace
        query = ' '.join(query.split())

        return query if query.strip() else "research"  # Fallback to generic search
