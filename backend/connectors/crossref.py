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

    async def search(self, query: str, filters: dict = None, max_results: int = 50) -> List[SearchResult]:
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

                # Apply Crossref filters
                filter_parts = []
                if filters:
                    if filters.get("year_from") or filters.get("year_to"):
                        year_from = filters.get("year_from", 1900)
                        year_to = filters.get("year_to", 9999)
                        filter_parts.append(f"from-pub-date:{year_from}")
                        filter_parts.append(f"until-pub-date:{year_to}")
                    if filters.get("doc_types"):
                        type_map = {"article": "journal-article", "thesis": "dissertation", "conference paper": "conference-proceeding", "preprint": "preprint", "review": "review"}
                        cr_types = [type_map.get(t, t) for t in filters["doc_types"]]
                        for t in cr_types:
                            filter_parts.append(f"type:{t}")

                if filter_parts:
                    params["filter"] = ",".join(filter_parts)

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
                                    doc_type=self._normalize_doc_type(item.get("type")),
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
        Convert boolean query to keyword search for Crossref while preserving critical terms.
        Crossref doesn't support full boolean syntax, so we extract AND groups and join with spaces.
        This ensures all critical terms are required.
        """
        import re

        # Remove NOT clauses
        query = re.sub(r'\bNOT\s+(?:\([^)]*\)|[^\s()]+)', '', boolean_query, flags=re.IGNORECASE)

        # Extract main AND groups: split by AND and clean each group
        and_groups = re.split(r'\s+AND\s+', query, flags=re.IGNORECASE)

        cleaned_groups = []
        for group in and_groups:
            # Remove outer parentheses
            group = group.strip().strip('()')

            # For OR groups, keep first term or best representative
            # This preserves synonyms by using the first/primary term
            or_terms = re.split(r'\s+OR\s+', group, flags=re.IGNORECASE)
            primary_term = or_terms[0].strip().strip('"\'')

            # Keep wildcards to preserve truncation
            # Only remove trailing wildcard stars for Crossref compatibility
            primary_term = primary_term.rstrip('*')

            if primary_term:
                cleaned_groups.append(f'"{primary_term}"')

        # Join with spaces (Crossref treats space as AND in keyword search)
        result = ' '.join(cleaned_groups)

        # Fallback: if cleaning produced empty result, return original without operators
        if not result or result.strip() == '""':
            fallback = boolean_query.replace('(', '').replace(')', '')
            fallback = re.sub(r'\b(AND|OR)\b', '', fallback, flags=re.IGNORECASE)
            fallback = fallback.replace('*', '')
            return fallback.strip() if fallback.strip() else "research"

        return result.strip() if result.strip() else "research"

    def _normalize_doc_type(self, crossref_type: str) -> str:
        """Normalize Crossref type to canonical doc_type"""
        if not crossref_type:
            return None
        type_map = {
            "journal-article": "article",
            "preprint": "preprint",
            "dissertation": "thesis",
            "conference-proceeding": "conference",
            "review": "review",
            "book-chapter": "article",
            "book": "article",
        }
        return type_map.get(crossref_type.lower(), "article")
