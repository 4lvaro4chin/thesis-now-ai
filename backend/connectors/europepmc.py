import httpx
import logging
import asyncio
from typing import List, Optional
from schemas import SearchResult

logger = logging.getLogger(__name__)

class EuropePMCConnector:
    """Europe PMC API connector (REST API with JSON responses)"""

    BASE_URL = "https://www.ebi.ac.uk/europepmc/webservices/rest/search"
    TIMEOUT = 30

    async def search(self, query: str, filters: dict = None, max_results: int = 50) -> List[SearchResult]:
        """
        Search Europe PMC and return results.
        Europe PMC API accepts boolean queries and returns JSON responses.
        """
        try:
            async with httpx.AsyncClient(timeout=self.TIMEOUT) as client:
                # Apply EuropePMC filters by appending to query
                filtered_query = self._apply_filters(query, filters)

                search_params = {
                    "query": filtered_query,
                    "format": "json",
                    "pageSize": min(max_results, 100),
                    "pageNumber": 1,
                }

                logger.info(f"Europe PMC search: {query}")
                response = await client.get(self.BASE_URL, params=search_params)
                response.raise_for_status()

                data = response.json()
                results = self._parse_europepmc_json(data)
                logger.info(f"Europe PMC: Extracted {len(results)} articles")
                return results

        except asyncio.TimeoutError:
            logger.error("Europe PMC: Request timeout")
            return []
        except Exception as e:
            logger.error(f"Europe PMC error: {str(e)}")
            return []

    def _parse_europepmc_json(self, data: dict) -> List[SearchResult]:
        """Parse Europe PMC JSON response"""
        results = []

        try:
            result_list = data.get("resultList", {}).get("result", [])

            if not result_list:
                logger.info("Europe PMC: No results found")
                return []

            for article in result_list:
                try:
                    # Title
                    title = article.get("title", "Unknown")

                    # Authors (parse from authorString)
                    authors = []
                    author_string = article.get("authorString", "")
                    if author_string:
                        # Format: "Smith J, Johnson M, Williams A"
                        author_list = [a.strip() for a in author_string.split(",")]
                        authors = author_list[:3]  # Limit to 3

                    # Year
                    year = None
                    pub_year = article.get("pubYear")
                    if pub_year:
                        try:
                            year = int(pub_year)
                        except (ValueError, TypeError):
                            year = None

                    # Abstract
                    abstract = article.get("abstractText")

                    # DOI
                    doi = article.get("doi")

                    # PMID and PMCID
                    pmid = article.get("pmid")
                    pmcid = article.get("pmcid")

                    # Source (journal title)
                    journal = article.get("journalTitle", "")

                    # URL construction
                    url = None
                    if pmcid:
                        url = f"https://www.europepmc.org/articles/PMC{pmcid}"
                    elif pmid:
                        url = f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/"
                    elif doi:
                        url = f"https://doi.org/{doi}"

                    # Open Access status
                    is_open_access = article.get("isOpenAccess", False)

                    result = SearchResult(
                        source="europepmc",
                        title=title,
                        authors=authors if authors else None,
                        year=year,
                        doi=doi,
                        pmid=pmid,
                        url=url,
                        abstract=abstract,
                        citation_count=0,  # Europe PMC doesn't provide citation count directly
                        relevance_score=0.5,  # Will be recalculated by scoring service
                        metadata={
                            "pmcid": pmcid,
                            "journal": journal,
                            "isOpenAccess": is_open_access,
                        }
                    )
                    results.append(result)

                except Exception as e:
                    logger.warning(f"Error parsing Europe PMC article: {str(e)}")
                    continue

        except Exception as e:
            logger.error(f"Europe PMC JSON parse error: {str(e)}")

        return results

    def _apply_filters(self, query: str, filters: dict = None) -> str:
        """Apply filters by appending EuropePMC field tags to the query."""
        if not filters:
            return query
        filtered = query
        if filters.get("year_from") or filters.get("year_to"):
            year_from = filters.get("year_from", 1900)
            year_to = filters.get("year_to", 9999)
            filtered += f" AND PUB_YEAR:[{year_from} TO {year_to}]"
        if filters.get("doc_types"):
            types = filters["doc_types"]
            type_filter = " OR ".join([f"PUB_TYPE:{t}" for t in types])
            filtered += f" AND ({type_filter})"
        if filters.get("lang_filter"):
            langs = filters["lang_filter"]
            lang_filter = " OR ".join([f"LANG:{l.upper()}" for l in langs])
            filtered += f" AND ({lang_filter})"
        if filters.get("open_access_only"):
            filtered += " AND OPEN_ACCESS:Y"
        return filtered
