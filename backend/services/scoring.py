import logging
from typing import List
from datetime import datetime
from schemas import SearchResult

logger = logging.getLogger(__name__)

class RelevanceScorer:
    """Hybrid relevance scoring: 30% recency + 70% citation impact."""

    CITATION_NORMALIZER = 100  # Papers with 100+ citations get max score

    @staticmethod
    def score(results: List[SearchResult], query: str = None) -> List[SearchResult]:
        """Apply hybrid scoring formula to results.

        If query provided, enhance with semantic similarity (Opción A).
        Otherwise, fallback to pure hybrid scoring.
        """
        if not results:
            return results

        # Extract years for normalization
        years = [r.year for r in results if r.year]
        if not years:
            logger.warning("No year data available for scoring")
            return results

        min_year = min(years)
        max_year = max(years)
        year_range = max_year - min_year if max_year > min_year else 1

        current_year = datetime.now().year

        for result in results:
            year_score = RelevanceScorer._year_score(
                result.year, min_year, max_year, year_range
            )
            citation_score = RelevanceScorer._citation_score(
                result.citation_count if hasattr(result, 'citation_count') else 0
            )

            # Store intermediate scores for embedding scorer
            result._year_score = year_score
            result._citation_score = citation_score

            # Hybrid formula: 30% recency + 70% citations
            result.relevance_score = 0.3 * year_score + 0.7 * citation_score
            result.relevance_score = max(0.0, min(1.0, result.relevance_score))

        # Sort by relevance descending
        results.sort(key=lambda r: r.relevance_score, reverse=True)

        # Enhance with AI-powered embeddings if query available
        if query:
            from services.embeddings import EmbeddingScorer
            try:
                results = EmbeddingScorer.score_with_similarity(results, query)
                logger.info("✅ Embeddings scoring applied successfully")
            except Exception as e:
                logger.error(f"⚠️ Embeddings scoring failed: {str(e)}. Using hybrid scores.")
                # Fallback: keep results as they are (hybrid scoring)

        return results

    @staticmethod
    def _year_score(year, min_year, max_year, year_range):
        """Normalized year score: older papers score lower."""
        if year is None:
            return 0.5
        if year_range == 0:
            return 1.0
        return (year - min_year) / year_range

    @staticmethod
    def _citation_score(citation_count):
        """Citation score: capped at 100 citations = 100%."""
        if citation_count is None:
            citation_count = 0
        return min(1.0, citation_count / RelevanceScorer.CITATION_NORMALIZER)
