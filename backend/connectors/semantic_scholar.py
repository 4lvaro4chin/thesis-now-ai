import httpx
import logging
import asyncio
import os
from typing import List
from schemas import SearchResult

logger = logging.getLogger(__name__)

class SemanticScholarConnector:
    """Semantic Scholar API v1 - with rate limit handling"""

    BASE_URL = "https://api.semanticscholar.org/graph/v1"
    TIMEOUT = 30

    async def search(self, query: str, max_results: int = 50) -> List[SearchResult]:
        """
        Search Semantic Scholar using paper search endpoint.
        Includes retry logic for rate limits.
        """
        try:
            async with httpx.AsyncClient(timeout=self.TIMEOUT) as client:
                search_url = f"{self.BASE_URL}/paper/search"

                params = {
                    "query": query,
                    "limit": min(max_results, 50),
                    "fields": "title,authors,year,abstract,url,doi,citationCount",
                }

                # Add API key if available
                api_key = os.getenv("SEMANTIC_SCHOLAR_API_KEY")
                if api_key:
                    params["apiKey"] = api_key

                logger.info(f"Semantic Scholar search: {query}")

                # Retry logic for rate limits
                max_retries = 3
                for attempt in range(max_retries):
                    try:
                        response = await client.get(search_url, params=params)

                        if response.status_code == 429:
                            # Rate limit - wait and retry with increased backoff
                            wait_time = (2 ** attempt) * 3  # Exponential backoff: 3s, 6s, 12s
                            logger.warning(f"Semantic Scholar rate limit. Waiting {wait_time}s...")
                            await asyncio.sleep(wait_time)
                            continue

                        response.raise_for_status()

                        data = response.json()
                        papers = data.get("data", [])

                        if not papers:
                            logger.info("Semantic Scholar: No results found")
                            return []

                        logger.info(f"Semantic Scholar: Found {len(papers)} results")

                        # Convert to SearchResult
                        results = []
                        for paper in papers:
                            try:
                                # Relevance score based on citation count
                                citation_count = paper.get("citationCount", 0) or 0
                                relevance_score = min(1.0, (citation_count + 1) / 100)

                                result = SearchResult(
                                    source="semantic_scholar",
                                    title=paper.get("title", "Unknown"),
                                    authors=[
                                        f"{a['name']}"
                                        for a in paper.get("authors", [])
                                    ][:3] or None,  # Limit to 3 authors
                                    year=paper.get("year"),
                                    doi=paper.get("doi"),
                                    url=paper.get("url"),
                                    abstract=paper.get("abstract"),
                                    relevance_score=relevance_score,
                                )
                                results.append(result)
                            except Exception as e:
                                logger.warning(f"Error parsing Semantic Scholar paper: {str(e)}")
                                continue

                        return results

                    except httpx.HTTPStatusError as e:
                        if e.response.status_code == 429 and attempt < max_retries - 1:
                            continue  # Retry
                        else:
                            raise

                # All retries exhausted
                logger.error("Semantic Scholar: All retries exhausted")
                return []

        except asyncio.TimeoutError:
            logger.error("Semantic Scholar: Request timeout")
            return []
        except Exception as e:
            logger.error(f"Semantic Scholar error: {str(e)}")
            return []
