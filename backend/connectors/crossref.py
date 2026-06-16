import httpx
import logging
import asyncio
from typing import List, Optional, Dict, Any
from schemas import SearchResult

logger = logging.getLogger(__name__)

class CrossrefConnector:
    """Crossref API - Global DOI index, free, no auth required"""

    BASE_URL = "https://api.crossref.org/works"
    TIMEOUT = 30
    MAILTO = "digitalcorepro@gmail.com"  # Polite pool - improves rate limit to 50 req/sec

    async def search(self, query: str, max_results: int = 50) -> List[SearchResult]:
        """
        Search Crossref using the works endpoint.
        Crossref indexes ~130M articles, journals, conferences, datasets.
        """
        try:
            async with httpx.AsyncClient(timeout=self.TIMEOUT) as client:
                # Crossref supports keyword search without boolean syntax
                simple_query = self._simplify_query(query)

                params = {
                    "query": simple_query,
                    "rows": min(max_results, 100),  # Crossref allows up to 100 per page
                    "mailto": self.MAILTO,
                }

                logger.info(f"Crossref search: {simple_query}")

                max_retries = 2
                for attempt in range(max_retries):
                    try:
                        response = await client.get(self.BASE_URL, params=params)

                        if response.status_code == 429:
                            wait_time = (2 ** attempt) * 3
                            logger.warning(f"Crossref rate limit. Waiting {wait_time}s...")
                            await asyncio.sleep(wait_time)
                            continue

                        response.raise_for_status()

                        data = response.json()
                        items = data.get("message", {}).get("items", [])

                        if not items:
                            logger.info("Crossref: No results found")
                            return []

                        logger.info(f"Crossref: Found {len(items)} results")

                        results = []
                        for item in items:
                            try:
                                result = SearchResult(
                                    source="crossref",
                                    title=item.get("title", ["Unknown"])[0] if item.get("title") else "Unknown",
                                    authors=self._extract_authors(item),
                                    year=self._get_year(item),
                                    doi=item.get("DOI"),
                                    pmid=None,  # Crossref doesn't provide PMIDs
                                    url=f"https://doi.org/{item.get('DOI')}" if item.get("DOI") else None,
                                    abstract=None,  # Crossref rarely has abstracts
                                    citation_count=item.get("is-referenced-by-count", 0),
                                    relevance_score=0.5,
                                )
                                results.append(result)
                            except Exception as e:
                                logger.warning(f"Error parsing Crossref item: {str(e)}")
                                continue

                        return results

                    except httpx.HTTPStatusError as e:
                        if e.response.status_code == 429 and attempt < max_retries - 1:
                            continue
                        else:
                            raise

                logger.error("Crossref: All retries exhausted")
                return []

        except asyncio.TimeoutError:
            logger.error("Crossref: Request timeout")
            return []
        except Exception as e:
            logger.error(f"Crossref error: {str(e)}")
            return []

    def _extract_authors(self, item: Dict[str, Any]) -> Optional[List[str]]:
        """Extract author names from Crossref item"""
        authors = []
        for author in item.get("author", []):
            name_parts = []
            if author.get("given"):
                name_parts.append(author["given"])
            if author.get("family"):
                name_parts.append(author["family"])
            if name_parts:
                authors.append(" ".join(name_parts))
        return authors[:10] if authors else None

    def _get_year(self, item: Dict[str, Any]) -> Optional[int]:
        """Extract publication year from Crossref item"""
        # Crossref stores dates as [year, month, day]
        date_parts = item.get("issued", {}).get("date-parts")
        if date_parts and date_parts[0]:
            return date_parts[0][0]
        return None

    def _simplify_query(self, boolean_query: str) -> str:
        """
        Convert boolean query to simple keyword search for Crossref.
        Remove operators, parentheses, and wildcards.
        """
        import re

        # Remove NOT clauses
        query = re.sub(r'\bNOT\s+(?:\([^)]*\)|[^\s()]+)', '', boolean_query, flags=re.IGNORECASE)

        # Remove operators
        query = re.sub(r'\b(AND|OR)\b', '', query, flags=re.IGNORECASE)

        # Remove parentheses
        query = query.replace('(', '').replace(')', '')

        # Remove wildcards
        query = query.replace('*', '')

        # Clean up excess whitespace
        query = ' '.join(query.split())

        return query if query.strip() else "research"
