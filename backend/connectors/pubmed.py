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

    async def search(self, query: str, max_results: int = 50) -> List[SearchResult]:
        """
        Search PubMed and return results.
        1. esearch: Get UIDs for the query
        2. efetch: Get full article metadata
        """
        try:
            async with httpx.AsyncClient(timeout=self.TIMEOUT) as client:
                # Step 1: Search for UIDs (use XML to be safe)
                search_url = f"{self.BASE_URL}/esearch.fcgi"
                search_params = {
                    "db": "pubmed",
                    "term": query,
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

                    result = SearchResult(
                        source="pubmed",
                        title=title,
                        authors=authors if authors else None,
                        year=year,
                        doi=doi,
                        pmid=pmid,
                        url=f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/" if pmid else None,
                        abstract=abstract,
                        relevance_score=0.8,
                    )
                    results.append(result)

                except Exception as e:
                    logger.warning(f"Error parsing PubMed article: {str(e)}")
                    continue

        except ET.ParseError as e:
            logger.error(f"PubMed XML parse error: {str(e)}")

        return results
