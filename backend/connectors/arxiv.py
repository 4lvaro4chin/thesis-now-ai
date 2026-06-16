import httpx
import logging
import asyncio
import xml.etree.ElementTree as ET
from typing import List, Optional, Dict, Any
from schemas import SearchResult

logger = logging.getLogger(__name__)

class ArxivConnector:
    """arXiv API - Preprints in Physics, Mathematics, CS, etc. Free, no auth required"""

    BASE_URL = "https://export.arxiv.org/api/query"
    TIMEOUT = 30

    async def search(self, query: str, max_results: int = 50) -> List[SearchResult]:
        """
        Search arXiv using the API.
        arXiv indexes ~2.5M preprints in STEM fields.
        """
        try:
            async with httpx.AsyncClient(timeout=self.TIMEOUT) as client:
                simple_query = self._simplify_query(query)

                # arXiv API requires search_query parameter
                params = {
                    "search_query": simple_query,
                    "start": 0,
                    "max_results": min(max_results, 100),
                    "sortBy": "relevance",
                    "sortOrder": "descending",
                }

                logger.info(f"arXiv search: {simple_query}")

                max_retries = 2
                for attempt in range(max_retries):
                    try:
                        response = await client.get(self.BASE_URL, params=params)

                        if response.status_code == 429:
                            wait_time = (2 ** attempt) * 3
                            logger.warning(f"arXiv rate limit. Waiting {wait_time}s...")
                            await asyncio.sleep(wait_time)
                            continue

                        response.raise_for_status()

                        # Parse XML response
                        root = ET.fromstring(response.content)

                        # arXiv uses Atom namespace
                        ns = {"atom": "http://www.w3.org/2005/Atom"}
                        entries = root.findall("atom:entry", ns)

                        if not entries:
                            logger.info("arXiv: No results found")
                            return []

                        logger.info(f"arXiv: Found {len(entries)} results")

                        results = []
                        for entry in entries:
                            try:
                                result = SearchResult(
                                    source="arxiv",
                                    title=self._get_text(entry, "atom:title", ns),
                                    authors=self._extract_authors(entry, ns),
                                    year=self._get_year(entry, ns),
                                    doi=self._get_doi(entry, ns),
                                    pmid=None,  # arXiv doesn't have PMIDs
                                    url=self._get_arxiv_url(entry, ns),
                                    abstract=self._get_text(entry, "atom:summary", ns),
                                    citation_count=0,  # arXiv doesn't provide citation count
                                    relevance_score=0.5,
                                )
                                results.append(result)
                            except Exception as e:
                                logger.warning(f"Error parsing arXiv entry: {str(e)}")
                                continue

                        return results

                    except httpx.HTTPStatusError as e:
                        if e.response.status_code == 429 and attempt < max_retries - 1:
                            continue
                        else:
                            raise

                logger.error("arXiv: All retries exhausted")
                return []

        except asyncio.TimeoutError:
            logger.error("arXiv: Request timeout")
            return []
        except Exception as e:
            logger.error(f"arXiv error: {str(e)}")
            return []

    def _get_text(self, element: Any, tag: str, ns: Dict[str, str]) -> str:
        """Extract text from XML element"""
        elem = element.find(tag, ns)
        if elem is not None and elem.text:
            return elem.text.strip()
        return "Unknown"

    def _extract_authors(self, entry: Any, ns: Dict[str, str]) -> Optional[List[str]]:
        """Extract author names from arXiv entry"""
        authors = []
        for author_elem in entry.findall("atom:author", ns):
            name_elem = author_elem.find("atom:name", ns)
            if name_elem is not None and name_elem.text:
                authors.append(name_elem.text.strip())
        return authors[:10] if authors else None

    def _get_year(self, entry: Any, ns: Dict[str, str]) -> Optional[int]:
        """Extract publication year from arXiv entry"""
        published_elem = entry.find("atom:published", ns)
        if published_elem is not None and published_elem.text:
            # Format: 2024-01-15T12:34:56Z
            try:
                year_str = published_elem.text.split("-")[0]
                return int(year_str)
            except (ValueError, IndexError):
                pass
        return None

    def _get_doi(self, entry: Any, ns: Dict[str, str]) -> Optional[str]:
        """Extract DOI from arXiv entry if available"""
        # arXiv doesn't always have DOI, but some entries link to published versions
        arxiv_id = self._get_arxiv_id(entry, ns)
        # Could try to look up DOI separately, but for now return None
        return None

    def _get_arxiv_id(self, entry: Any, ns: Dict[str, str]) -> str:
        """Extract arXiv ID from entry"""
        id_elem = entry.find("atom:id", ns)
        if id_elem is not None and id_elem.text:
            # Format: http://arxiv.org/abs/2401.12345v1
            arxiv_id = id_elem.text.split("/abs/")[-1]
            return arxiv_id
        return ""

    def _get_arxiv_url(self, entry: Any, ns: Dict[str, str]) -> Optional[str]:
        """Get arXiv URL for the paper"""
        id_elem = entry.find("atom:id", ns)
        if id_elem is not None and id_elem.text:
            return id_elem.text
        return None

    def _simplify_query(self, boolean_query: str) -> str:
        """
        Convert boolean query to arXiv search syntax.
        arXiv supports: AND, OR, NOT, but with slightly different syntax.
        We keep the structure but convert wildcards.
        """
        import re

        query = boolean_query

        # Remove wildcard asterisks (arXiv doesn't support them)
        query = query.replace("*", "")

        # Clean up excess whitespace
        query = " ".join(query.split())

        return query if query.strip() else "research"
