import asyncio
import logging
from typing import List
from schemas import SearchResult

logger = logging.getLogger(__name__)

class SearchService:
    def __init__(self):
        from connectors.pubmed import PubMedConnector
        from connectors.semantic_scholar import SemanticScholarConnector

        self.connectors = {
            "pubmed": PubMedConnector(),
            "semantic_scholar": SemanticScholarConnector(),
        }

    async def search_all_databases(self, query: str, databases: List[str]) -> List[SearchResult]:
        """
        Execute searches in multiple databases in parallel.
        Deduplicate results by DOI/title.
        Score results by relevance.
        """
        tasks = []
        for db in databases:
            if db in self.connectors:
                task = self.connectors[db].search(query)
                tasks.append((db, task))

        # Run all searches in parallel
        all_results = []
        for db, task in tasks:
            try:
                results = await task
                all_results.extend([(db, r) for r in results])
                logger.info(f"Found {len(results)} results in {db}")
            except Exception as e:
                logger.error(f"Error searching {db}: {str(e)}")

        # Deduplicate by DOI or normalized title
        deduplicated = self._deduplicate(all_results)
        logger.info(f"After deduplication: {len(deduplicated)} unique results")

        return deduplicated

    def _deduplicate(self, results: List[tuple]) -> List[SearchResult]:
        """
        Remove duplicates across databases.
        Priority: DOI > normalized title > URL
        """
        seen = {}
        unique = []

        for source, result in results:
            # Create a key for deduplication
            key = None
            if result.doi:
                key = ("doi", result.doi.lower())
            elif result.pmid:
                key = ("pmid", result.pmid)
            elif result.title:
                normalized_title = result.title.lower().strip()
                key = ("title", normalized_title)

            if key and key in seen:
                # Merge results from different sources
                existing = seen[key]
                if result.relevance_score > existing.relevance_score:
                    existing.relevance_score = result.relevance_score
            else:
                if key:
                    seen[key] = result
                unique.append(result)

        return unique
