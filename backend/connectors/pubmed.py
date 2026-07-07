import httpx
import logging
import asyncio
from typing import List
from xml.etree import ElementTree as ET
from schemas import SearchResult

logger = logging.getLogger(__name__)

class PubMedConnector:
    """NCBI PubMed via E-utilities API"""

    BASE_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"
    TIMEOUT = 30

    async def search(self, query: str, filters: dict = None, max_results: int = 50) -> List[SearchResult]:
        """
        Search PubMed and return results.
        1. esearch: Get UIDs for the query
        2. efetch: Get full article metadata
        """
        try:
            async with httpx.AsyncClient(timeout=self.TIMEOUT) as client:
                # Apply filters by appending to query string
                filtered_query = self._apply_filters(query, filters)

                # Step 1: Search for UIDs (use XML to be safe)
                search_url = f"{self.BASE_URL}/esearch.fcgi"
                search_params = {
                    "db": "pubmed",
                    "term": filtered_query,
                    "retmax": min(max_results, 50),
                    "rettype": "xml",
                }

                logger.info(f"PubMed search: {query}")
                search_response = await client.get(search_url, params=search_params)
                search_response.raise_for_status()

                # Parse XML response
                try:
                    search_root = ET.fromstring(search_response.text)
                    uids = []
                    for uid_elem in search_root.findall(".//Id"):
                        uid = uid_elem.text
                        if uid:
                            uids.append(uid)
                except ET.ParseError as e:
                    logger.error(f"PubMed XML parse error in search: {e}")
                    logger.error(f"Response: {search_response.text[:500]}")
                    return []

                if not uids:
                    logger.info("PubMed: No results found")
                    return []

                logger.info(f"PubMed: Found {len(uids)} UIDs, fetching details...")

                # Step 2: Fetch full article data
                fetch_url = f"{self.BASE_URL}/efetch.fcgi"
                fetch_params = {
                    "db": "pubmed",
                    "id": ",".join(uids[:20]),  # Limit to 20 to avoid huge responses
                    "rettype": "xml",
                }

                fetch_response = await client.get(fetch_url, params=fetch_params)
                fetch_response.raise_for_status()

                # Parse XML response
                results = self._parse_pubmed_xml(fetch_response.text)
                logger.info(f"PubMed: Extracted {len(results)} articles")
                return results

        except asyncio.TimeoutError:
            logger.error("PubMed: Request timeout")
            return []
        except Exception as e:
            logger.error(f"PubMed error: {str(e)}")
            return []

    async def _fetch_crossref_citations(self, doi: str) -> int:
        """Fetch citation count from Crossref API (free, no auth required)."""
        if not doi:
            return 0
        try:
            async with httpx.AsyncClient(timeout=5) as client:
                url = f"https://api.crossref.org/works/{doi}"
                response = await client.get(url)
                response.raise_for_status()
                data = response.json()
                return data.get("message", {}).get("is-referenced-by-count", 0) or 0
        except Exception as e:
            logger.warning(f"Crossref lookup failed for {doi}: {str(e)}")
            return 0

    def _parse_pubmed_xml(self, xml_str: str) -> List[SearchResult]:
        """Parse PubMed XML response"""
        results = []

        try:
            root = ET.fromstring(xml_str)

            for article in root.findall(".//PubmedArticle"):
                try:
                    # Extract metadata
                    medline_citation = article.find("MedlineCitation")
                    if medline_citation is None:
                        continue

                    pmid_elem = medline_citation.find("PMID")
                    pmid = pmid_elem.text if pmid_elem is not None else None

                    article_elem = medline_citation.find("Article")
                    if article_elem is None:
                        continue

                    # Title
                    title_elem = article_elem.find("ArticleTitle")
                    title = title_elem.text if title_elem is not None else "Unknown"

                    # Authors
                    authors = []
                    author_list = article_elem.find("AuthorList")
                    if author_list is not None:
                        for author in author_list.findall("Author")[:3]:  # Limit to 3
                            last_name = author.find("LastName")
                            first_name = author.find("ForeName")
                            if last_name is not None:
                                full_name = f"{last_name.text}"
                                if first_name is not None:
                                    full_name = f"{full_name}, {first_name.text[:1]}."
                                authors.append(full_name)

                    # Year
                    pub_date = article_elem.find(".//PubDate")
                    year = None
                    if pub_date is not None:
                        year_elem = pub_date.find("Year")
                        year = int(year_elem.text) if year_elem is not None else None

                    # Abstract
                    abstract_elem = article_elem.find("Abstract/AbstractText")
                    abstract = abstract_elem.text if abstract_elem is not None else None

                    # DOI
                    article_id_list = article_elem.find("ArticleIdList")
                    doi = None
                    if article_id_list is not None:
                        for article_id in article_id_list.findall("ArticleId"):
                            if article_id.get("IdType") == "doi":
                                doi = article_id.text
                                break

                    # Publication type
                    pub_types = []
                    pub_type_list = article_elem.find("PublicationTypeList")
                    if pub_type_list is not None:
                        for pub_type in pub_type_list.findall("PublicationType"):
                            if pub_type.text:
                                pub_types.append(pub_type.text)

                    result = SearchResult(
                        source="pubmed",
                        title=title,
                        authors=authors if authors else None,
                        year=year,
                        doi=doi,
                        pmid=pmid,
                        url=f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/" if pmid else None,
                        abstract=abstract,
                        citation_count=0,
                        relevance_score=0.5,
                        doc_type=self._normalize_doc_type(pub_types),
                    )
                    results.append(result)

                except Exception as e:
                    logger.warning(f"Error parsing PubMed article: {str(e)}")
                    continue

        except ET.ParseError as e:
            logger.error(f"PubMed XML parse error: {str(e)}")

        return results

    def _apply_filters(self, query: str, filters: dict = None) -> str:
        """Apply filters by appending PubMed field tags to the query."""
        if not filters:
            return query
        filtered = query
        if filters.get("year_from") or filters.get("year_to"):
            year_from = filters.get("year_from", 1900)
            year_to = filters.get("year_to", 9999)
            filtered += f" AND {year_from}:{year_to}[dp]"
        if filters.get("doc_types"):
            types = filters["doc_types"]
            type_filter = " OR ".join([f'"{t}"[pt]' for t in types])
            filtered += f" AND ({type_filter})"
        if filters.get("lang_filter"):
            langs = filters["lang_filter"]
            lang_map = {"en": "eng", "es": "spa", "pt": "por", "fr": "fre", "de": "ger"}
            lang_tags = [lang_map.get(l, l) for l in langs]
            lang_filter = " OR ".join([f'"{t}"[la]' for t in lang_tags])
            filtered += f" AND ({lang_filter})"
        if filters.get("open_access_only"):
            filtered += ' AND "open access"[pt]'
        if filters.get("peer_reviewed_only"):
            filtered += ' AND "journal article"[pt]'
        return filtered

    def _normalize_doc_type(self, pub_types: List[str]) -> str:
        """Normalize PubMed PublicationTypes to canonical doc_type"""
        if not pub_types:
            return None
        primary_type = pub_types[0] if pub_types else None
        if not primary_type:
            return None
        type_map = {
            "Journal Article": "article",
            "Review": "review",
            "Research Support": "article",
            "Clinical Trial": "article",
            "Conference Paper": "conference",
            "Case Reports": "article",
            "Preprint": "preprint",
            "Dissertation": "thesis",
            "Thesis": "thesis",
        }
        return type_map.get(primary_type, "article")
