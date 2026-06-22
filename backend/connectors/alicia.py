import httpx
import logging
import asyncio
from typing import List, Optional, Dict, Any
from schemas import SearchResult

logger = logging.getLogger(__name__)

class AliciaConnector:
    """
    ALICIA (CONCYTEC) - national aggregator of Peruvian academic output,
    powered by VuFind. Free JSON REST API, no auth required. Aggregates
    theses and articles from Peruvian institutional repositories (incl. USIL).
    No DOIs or citation counts are available (mostly grey literature / theses).
    """

    BASE_URL = "https://alicia.concytec.gob.pe/vufind/api/v1/search"
    TIMEOUT = 30

    async def search(self, query: str, filters: dict = None, max_results: int = 50) -> List[SearchResult]:
        try:
            async with httpx.AsyncClient(timeout=self.TIMEOUT) as client:
                # VuFind/Solr understands the native boolean syntax (quoted
                # phrases, AND/OR/NOT, parentheses), so we pass the boolean
                # query through unchanged. Flattening it to bare keywords would
                # make Solr require ALL terms (implicit AND) and return nothing.
                # `field[]` trims the response to only the metadata we map below.
                params = [
                    ("lookfor", query),
                    ("type", "AllFields"),
                    ("limit", str(min(max_results, 100))),  # VuFind caps at 100
                    ("page", "1"),
                    ("field[]", "title"),
                    ("field[]", "authors"),
                    ("field[]", "publicationDates"),
                    ("field[]", "urls"),
                    ("field[]", "formats"),
                    ("field[]", "summary"),
                ]

                logger.info(f"ALICIA search: {query}")

                max_retries = 2
                for attempt in range(max_retries):
                    try:
                        response = await client.get(self.BASE_URL, params=params)

                        if response.status_code == 429:
                            wait_time = (2 ** attempt) * 3
                            logger.warning(f"ALICIA rate limit. Waiting {wait_time}s...")
                            await asyncio.sleep(wait_time)
                            continue

                        response.raise_for_status()

                        data = response.json()
                        items = data.get("records", [])

                        if not items:
                            logger.info("ALICIA: No results found")
                            return []

                        logger.info(f"ALICIA: Found {len(items)} results")

                        results = []
                        for item in items:
                            try:
                                result = SearchResult(
                                    source="alicia",
                                    title=item.get("title", "Unknown") or "Unknown",
                                    authors=self._extract_authors(item),
                                    year=self._get_year(item),
                                    doi=None,  # Theses don't carry DOIs
                                    pmid=None,
                                    url=self._extract_url(item),
                                    abstract=self._extract_abstract(item),
                                    citation_count=0,  # Not provided by ALICIA
                                    relevance_score=0.5,
                                )
                                results.append(result)
                            except Exception as e:
                                logger.warning(f"Error parsing ALICIA item: {str(e)}")
                                continue

                        return results

                    except httpx.HTTPStatusError as e:
                        if e.response.status_code == 429 and attempt < max_retries - 1:
                            continue
                        else:
                            raise

                logger.error("ALICIA: All retries exhausted")
                return []

        except asyncio.TimeoutError:
            logger.error("ALICIA: Request timeout")
            return []
        except Exception as e:
            logger.error(f"ALICIA error: {str(e)}")
            return []

    def _extract_authors(self, item: Dict[str, Any]) -> Optional[List[str]]:
        """VuFind nests primary authors as the keys of authors.primary"""
        primary = item.get("authors", {}).get("primary", {})
        authors = [name for name in primary.keys() if name]
        return authors[:10] if authors else None

    def _extract_url(self, item: Dict[str, Any]) -> Optional[str]:
        """Use the first handle URL"""
        for link in item.get("urls", []):
            if link.get("url"):
                return link["url"]
        return None

    def _extract_abstract(self, item: Dict[str, Any]) -> Optional[str]:
        """summary is a list of strings; take the first non-empty one"""
        summary = item.get("summary", [])
        for text in summary:
            if text:
                return text
        return None

    def _get_year(self, item: Dict[str, Any]) -> Optional[int]:
        """publicationDates is a list like ['2018'] or ['2023-11']"""
        dates = item.get("publicationDates", [])
        if dates and dates[0]:
            try:
                return int(str(dates[0])[:4])
            except (ValueError, TypeError):
                return None
        return None
