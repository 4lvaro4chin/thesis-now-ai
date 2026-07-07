import httpx
import logging
import asyncio
from urllib.parse import quote
from typing import List, Optional, Dict, Any
from schemas import SearchResult

logger = logging.getLogger(__name__)

class DOAJConnector:
    """DOAJ API - Directory of Open Access Journals, free, no auth required"""

    BASE_URL = "https://doaj.org/api/search/articles"
    TIMEOUT = 30

    async def search(self, query: str, filters: dict = None, max_results: int = 50) -> List[SearchResult]:
        """
        Search DOAJ articles. DOAJ indexes ~9M open-access journal articles
        across all disciplines. No citation counts are available.
        """
        try:
            async with httpx.AsyncClient(timeout=self.TIMEOUT) as client:
                # DOAJ takes the query in the URL path (Elasticsearch syntax)
                simple_query = self._simplify_query(query)
                url = f"{self.BASE_URL}/{quote(simple_query)}"

                params = {
                    "pageSize": min(max_results, 100),  # DOAJ allows up to 100 per page
                    "page": 1,
                }

                logger.info(f"DOAJ search: {simple_query}")

                max_retries = 2
                for attempt in range(max_retries):
                    try:
                        response = await client.get(url, params=params)

                        if response.status_code == 429:
                            wait_time = (2 ** attempt) * 3
                            logger.warning(f"DOAJ rate limit. Waiting {wait_time}s...")
                            await asyncio.sleep(wait_time)
                            continue

                        response.raise_for_status()

                        data = response.json()
                        items = data.get("results", [])

                        if not items:
                            logger.info("DOAJ: No results found")
                            return []

                        logger.info(f"DOAJ: Found {len(items)} results")

                        results = []
                        for item in items:
                            try:
                                bibjson = item.get("bibjson", {})
                                doi = self._extract_doi(bibjson)
                                result = SearchResult(
                                    source="doaj",
                                    title=bibjson.get("title", "Unknown") or "Unknown",
                                    authors=self._extract_authors(bibjson),
                                    year=self._get_year(bibjson),
                                    doi=doi,
                                    pmid=None,  # DOAJ doesn't provide PMIDs
                                    url=self._extract_url(bibjson, doi),
                                    abstract=bibjson.get("abstract"),
                                    citation_count=0,  # DOAJ doesn't provide citation counts
                                    relevance_score=0.5,
                                    doc_type="article",
                                )
                                results.append(result)
                            except Exception as e:
                                logger.warning(f"Error parsing DOAJ item: {str(e)}")
                                continue

                        return results

                    except httpx.HTTPStatusError as e:
                        if e.response.status_code == 429 and attempt < max_retries - 1:
                            continue
                        else:
                            raise

                logger.error("DOAJ: All retries exhausted")
                return []

        except asyncio.TimeoutError:
            logger.error("DOAJ: Request timeout")
            return []
        except Exception as e:
            logger.error(f"DOAJ error: {str(e)}")
            return []

    def _extract_authors(self, bibjson: Dict[str, Any]) -> Optional[List[str]]:
        """Extract author names from DOAJ bibjson"""
        authors = []
        for author in bibjson.get("author", []):
            name = author.get("name")
            if name:
                authors.append(name)
        return authors[:10] if authors else None

    def _extract_doi(self, bibjson: Dict[str, Any]) -> Optional[str]:
        """Extract DOI from the identifier list"""
        for ident in bibjson.get("identifier", []):
            if ident.get("type") == "doi" and ident.get("id"):
                return ident["id"]
        return None

    def _extract_url(self, bibjson: Dict[str, Any], doi: Optional[str]) -> Optional[str]:
        """Prefer the DOI URL; fall back to the first fulltext link"""
        if doi:
            return f"https://doi.org/{doi}"
        for link in bibjson.get("link", []):
            if link.get("url"):
                return link["url"]
        return None

    def _get_year(self, bibjson: Dict[str, Any]) -> Optional[int]:
        """Extract publication year (DOAJ stores it as a string)"""
        year = bibjson.get("year")
        if year:
            try:
                return int(str(year)[:4])
            except (ValueError, TypeError):
                return None
        return None

    def _simplify_query(self, boolean_query: str) -> str:
        """
        Convert boolean query to simple keyword search for DOAJ.
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
