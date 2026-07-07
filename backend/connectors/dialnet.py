import httpx
import logging
import asyncio
from typing import List, Optional, Dict, Any
from schemas import SearchResult

logger = logging.getLogger(__name__)

class DialnetConnector:
    """Dialnet API - Spanish academic database (SSHU: Social Sciences, Humanities).

    NOTE: Dialnet API endpoint appears to be private/restricted.
    Public API access may not be available for programmatic queries.
    ~4M articles/chapters from Spanish and Portuguese universities.
    Strong in: Law, Philosophy, History, Languages, Education, Social Sciences.
    """

    BASE_URL = "https://dialnet.unirioja.es/api/articulos"
    TIMEOUT = 30

    async def search(self, query: str, filters: dict = None, max_results: int = 50) -> List[SearchResult]:
        """
        Search Dialnet using the public API.
        """
        try:
            async with httpx.AsyncClient(timeout=self.TIMEOUT) as client:
                # Simplify query for Dialnet (doesn't support complex boolean)
                simple_query = self._simplify_query(query)

                # Build search parameters
                params = {
                    "q": simple_query,
                    "inicio": 0,
                    "registros": min(max_results, 100),
                }

                # Apply year filters if provided
                if filters:
                    if filters.get("year_from"):
                        params["anyoDesde"] = filters.get("year_from")
                    if filters.get("year_to"):
                        params["anyoHasta"] = filters.get("year_to")

                logger.info(f"Dialnet search: {simple_query}")

                max_retries = 2
                for attempt in range(max_retries):
                    try:
                        response = await client.get(self.BASE_URL, params=params)

                        if response.status_code == 429:
                            wait_time = (2 ** attempt) * 3
                            logger.warning(f"Dialnet rate limit. Waiting {wait_time}s...")
                            await asyncio.sleep(wait_time)
                            continue

                        response.raise_for_status()

                        # Parse JSON response
                        data = response.json()

                        # Dialnet returns: {"resultados": [...]}
                        results_data = data.get("resultados", [])

                        if not results_data:
                            logger.info("Dialnet: No results found")
                            return []

                        logger.info(f"Dialnet: Found {len(results_data)} results")

                        results = []
                        for item in results_data:
                            try:
                                result = SearchResult(
                                    source="dialnet",
                                    title=item.get("titulo", "Unknown"),
                                    authors=self._extract_authors(item),
                                    year=self._get_year(item),
                                    doi=item.get("doi"),
                                    pmid=None,  # Dialnet doesn't use PMIDs
                                    url=self._get_dialnet_url(item),
                                    abstract=item.get("resumen") or item.get("abstract"),
                                    citation_count=item.get("citaciones", 0),
                                    relevance_score=0.5,
                                    doc_type="article",
                                )
                                results.append(result)
                            except Exception as e:
                                logger.warning(f"Error parsing Dialnet entry: {str(e)}")
                                continue

                        return results

                    except httpx.HTTPStatusError as e:
                        if e.response.status_code == 429 and attempt < max_retries - 1:
                            continue
                        else:
                            raise

                logger.error("Dialnet: All retries exhausted")
                return []

        except asyncio.TimeoutError:
            logger.error("Dialnet: Request timeout")
            return []
        except Exception as e:
            logger.error(f"Dialnet error: {str(e)}")
            return []

    def _extract_authors(self, item: Dict[str, Any]) -> Optional[List[str]]:
        """Extract author names from Dialnet item"""
        authors_data = item.get("autores", [])
        if isinstance(authors_data, list):
            authors = [a.get("nombre", "Unknown") for a in authors_data if isinstance(a, dict)]
            return authors[:10] if authors else None
        return None

    def _get_year(self, item: Dict[str, Any]) -> Optional[int]:
        """Extract publication year from Dialnet item"""
        year = item.get("anyo")
        if year:
            try:
                return int(year)
            except (ValueError, TypeError):
                pass
        return None

    def _get_dialnet_url(self, item: Dict[str, Any]) -> Optional[str]:
        """Get Dialnet URL for the article"""
        dialnet_id = item.get("id")
        if dialnet_id:
            return f"https://dialnet.unirioja.es/servlet/articulo?codigo={dialnet_id}"
        return None

    def _simplify_query(self, boolean_query: str) -> str:
        """
        Convert boolean query to Dialnet search syntax.
        Dialnet doesn't support complex boolean operators,
        so we extract keywords and join with spaces.
        """
        import re

        query = boolean_query

        # Remove boolean operators (AND, OR, NOT) — Dialnet does implicit AND
        query = re.sub(r"\b(AND|OR|NOT)\b", "", query, flags=re.IGNORECASE)

        # Remove parentheses
        query = query.replace("(", "").replace(")", "")

        # Remove wildcard asterisks
        query = query.replace("*", "")

        # Clean up excess whitespace
        query = " ".join(query.split())

        return query if query.strip() else "research"
