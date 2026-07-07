import logging
import os
from typing import List, Optional
from openai import OpenAI, RateLimitError, APIError
from schemas import SearchResult
import asyncio

logger = logging.getLogger(__name__)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class EmbeddingScorer:
    """Score paper relevance using OpenAI text embeddings.

    Compares semantic similarity between query and paper abstract/title.
    Fallback to hybrid scoring if embeddings unavailable.
    """

    MODEL = "text-embedding-3-small"  # Fast, cheap, good quality

    @staticmethod
    def get_embedding(text: str, max_retries: int = 3) -> Optional[List[float]]:
        """Get embedding from OpenAI with exponential backoff.

        Returns None if fails (fallback to hybrid scoring).
        """
        if not text or not isinstance(text, str):
            return None

        # Truncate to 8000 tokens (~32k chars) for safety
        text = text[:32000]

        for attempt in range(max_retries):
            try:
                response = client.embeddings.create(
                    model=EmbeddingScorer.MODEL,
                    input=text,
                    dimensions=512  # Smaller = faster + cheaper
                )
                return response.data[0].embedding
            except RateLimitError:
                wait_time = 2 ** attempt  # 1s, 2s, 4s
                logger.warning(f"Rate limited. Waiting {wait_time}s before retry {attempt + 1}/{max_retries}")
                import time
                time.sleep(wait_time)
            except APIError as e:
                logger.error(f"OpenAI API error on attempt {attempt + 1}: {str(e)}")
                if attempt == max_retries - 1:
                    logger.error(f"Embeddings failed after {max_retries} retries. Using hybrid scoring.")
                    return None

        return None

    @staticmethod
    def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
        """Compute cosine similarity between two vectors."""
        if not vec1 or not vec2:
            return 0.0

        dot_product = sum(a * b for a, b in zip(vec1, vec2))
        norm1 = sum(a ** 2 for a in vec1) ** 0.5
        norm2 = sum(b ** 2 for b in vec2) ** 0.5

        if norm1 == 0 or norm2 == 0:
            return 0.0

        return dot_product / (norm1 * norm2)

    @staticmethod
    def score_with_similarity(
        results: List[SearchResult],
        query: str,
        weight_similarity: float = 0.3
    ) -> List[SearchResult]:
        """Enhance relevance scores with semantic similarity.

        New formula: 0.2×year + 0.5×citations + 0.3×similarity

        If embeddings fail, fallback to hybrid (0.3×year + 0.7×citations).
        """
        if not query or not results:
            return results

        logger.info(f"🤖 Computing embeddings for query + {len(results)} papers")

        # Get query embedding
        query_embedding = EmbeddingScorer.get_embedding(query)
        if query_embedding is None:
            logger.warning("Failed to get query embedding. Using hybrid scoring.")
            return results

        logger.info(f"✅ Query embedding computed")

        # Compute paper embeddings and similarities
        similarity_scores = {}
        failed_count = 0

        for i, result in enumerate(results):
            # Prepare paper text: title + abstract
            paper_text = f"{result.title or ''} {result.abstract or ''}".strip()

            if not paper_text:
                similarity_scores[i] = 0.0
                continue

            paper_embedding = EmbeddingScorer.get_embedding(paper_text)

            if paper_embedding is None:
                failed_count += 1
                similarity_scores[i] = 0.5  # Neutral score if embedding fails
                continue

            similarity = EmbeddingScorer.cosine_similarity(query_embedding, paper_embedding)
            similarity_scores[i] = max(0.0, min(1.0, similarity))  # Clamp to [0,1]

        logger.info(f"✅ {len(results) - failed_count}/{len(results)} papers embedded. "
                   f"({failed_count} failed, fallback to 0.5)")

        # Update relevance scores with new formula
        for i, result in enumerate(results):
            # Get existing hybrid score (0.3×year + 0.7×citations)
            year_score = getattr(result, '_year_score', 0.5)
            citation_score = getattr(result, '_citation_score', 0.5)
            hybrid_score = 0.3 * year_score + 0.7 * citation_score

            # New formula: weighted combination
            similarity = similarity_scores[i]
            result.relevance_score = (
                0.2 * year_score +
                0.5 * citation_score +
                0.3 * similarity
            )

            # Store breakdown for logging/debugging
            result.similarity_score = similarity

            logger.debug(f"📄 {result.title[:50]}... → "
                        f"year={year_score:.2f} cit={citation_score:.2f} sim={similarity:.2f} "
                        f"final={result.relevance_score:.2f}")

        # Re-sort by new relevance scores
        results.sort(key=lambda r: r.relevance_score, reverse=True)

        return results
