import httpx
import logging
import asyncio
from typing import List, Optional, Dict, Any
from schemas import SearchResult

logger = logging.getLogger(__name__)

class CoreConnector:
    """CORE API - Aggregated academic repository (500M+ papers globally).

    Free API, no authentication required.
    Covers: preprints, peer-reviewed articles, open access journals.
    Strong in: Computer Science, Engineering, Medicine, and broad coverage of LATAM.
    """

    BASE_URL = "https://api.core.ac.uk/v3/search/works"
    TIMEOUT = 30

    async def search(self, query: str, filters: dict = None, max_results: int = 50) -> List[SearchResult]:
        """
        Search CORE using the public API.
        """
        try:
            async with httpx.AsyncClient(timeout=self.TIMEOUT) as client:
                # Simplify query for CORE (doesn't support complex boolean)
                simple_query = self._simplify_query(query)

                # Build search parameters
                params = {
                    "q": simple_query,
                    "limit": min(max_results, 100),
                    "offset": 0,
                }

                # Apply year filters if provided
                if filters:
                    if filters.get("year_from"):
                        params["publishedDateFrom"] = f"{filters.get('year_from')}-01-01"
                    if filters.get("year_to"):
                        params["publishedDateTo"] = f"{filters.get('year_to')}-12-31"

                logger.info(f"CORE search: {simple_query}")

                max_retries = 2
                for attempt in range(max_retries):
                    try:
                        response = await client.get(self.BASE_URL, params=params)

                        if response.status_code == 429:
                            wait_time = (2 ** attempt) * 3
                            logger.warning(f"CORE rate limit. Waiting {wait_time}s...")
                            await asyncio.sleep(wait_time)
                            continue

                        response.raise_for_status()

                        # Parse JSON response
                        data = response.json()

                        # CORE returns: {"results": [...], "totalHits": N}
                        results_data = data.get("results", [])

                        if not results_data:
                            logger.info("CORE: No results found")
                            return []

                        logger.info(f"CORE: Found {len(results_data)} results")

                        results = []
                        for item in results_data:
                            try:
                                result = SearchResult(
                                    source="core",
                                    title=item.get("title", "Unknown"),
                                    authors=self._extract_authors(item),
                                    year=self._get_year(item),
                                    doi=item.get("doi"),
                                    pmid=None,  # CORE doesn't use PMIDs
                                    url=self._get_url(item),
                                    abstract=item.get("abstract") or item.get("description"),
                                    citation_count=item.get("citationCount", 0),
                                    relevance_score=0.5,
                                )
                                results.append(result)
                            except Exception as e:
                                logger.warning(f"Error parsing CORE entry: {str(e)}")
                                continue

                        return results

                    except httpx.HTTPStatusError as e:
                        if e.response.status_code == 429 and attempt < max_retries - 1:
                            continue
                        else:
                            raise

                logger.error("CORE: All retries exhausted")
                return []

        except asyncio.TimeoutError:
            logger.error("CORE: Request timeout")
            return []
        except Exception as e:
            logger.error(f"CORE error: {str(e)}")
            return []

    def _extract_authors(self, item: Dict[str, Any]) -> Optional[List[str]]:
        """Extract author names from CORE item"""
        authors_data = item.get("authors", [])
        if isinstance(authors_data, list):
            authors = [a.get("name", "Unknown") if isinstance(a, dict) else str(a) for a in authors_data if a]
            return authors[:10] if authors else None
        return None

    def _get_year(self, item: Dict[str, Any]) -> Optional[int]:
        """Extract publication year from CORE item"""
        # Try publishedDate first (ISO format: YYYY-MM-DD)
        pub_date = item.get("publishedDate") or item.get("createdDate")
        if pub_date:
            try:
                year_str = pub_date.split("-")[0] if isinstance(pub_date, str) else str(pub_date)
                return int(year_str)
            except (ValueError, IndexError, AttributeError):
                pass
        return None

    def _get_url(self, item: Dict[str, Any]) -> Optional[str]:
        """Get CORE URL for the paper"""
        # Try to get direct URL or CORE landing page
        if item.get("urls") and len(item.get("urls", [])) > 0:
            return item["urls"][0]

        # Fallback: use CORE ID to construct URL
        core_id = item.get("id")
        if core_id:
            return f"https://core.ac.uk/display/{core_id}"
        return None

    def _simplify_query(self, boolean_query: str) -> str:
        """
        Convert boolean query to CORE search syntax.
        CORE doesn't support complex boolean operators,
        so we extract keywords and join with spaces.
        """
        import re

        query = boolean_query

        # Remove boolean operators (AND, OR, NOT)
        query = re.sub(r"\b(AND|OR|NOT)\b", "", query, flags=re.IGNORECASE)

        # Remove parentheses
        query = query.replace("(", "").replace(")", "")

        # Remove wildcard asterisks
        query = query.replace("*", "")

        # Clean up excess whitespace
        query = " ".join(query.split())

        return query if query.strip() else "research"
