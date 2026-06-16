#!/usr/bin/env python3
"""Test scoring module"""
import sys
from schemas import SearchResult
from services.scoring import RelevanceScorer

def test_scoring():
    """Test hybrid scoring formula"""
    # Mock results: mix of old (2020, high citations) and new (2024, low citations)
    results = [
        SearchResult(
            source="pubmed",
            title="Classic paper with many citations",
            authors=["Smith, J."],
            year=2018,
            doi="10.1234/classic",
            pmid="12345",
            url="http://pubmed.example.com",
            abstract="Test abstract",
            citation_count=150,  # High citations, old
            relevance_score=0.5
        ),
        SearchResult(
            source="semantic_scholar",
            title="New paper with few citations",
            authors=["Jones, A."],
            year=2024,
            doi="10.1234/new",
            pmid=None,
            url="http://scholar.example.com",
            abstract="Test abstract",
            citation_count=5,  # Low citations, new
            relevance_score=0.5
        ),
        SearchResult(
            source="pubmed",
            title="Recent highly cited paper",
            authors=["Brown, B."],
            year=2023,
            doi="10.1234/recent",
            pmid="67890",
            url="http://pubmed.example.com",
            abstract="Test abstract",
            citation_count=85,  # Medium citations, recent
            relevance_score=0.5
        ),
    ]

    # Apply scoring
    scored = RelevanceScorer.score(results)

    # Display results
    print("\n[SCORING TEST RESULTS]")
    print("=" * 70)
    for i, r in enumerate(scored, 1):
        print(f"\n{i}. {r.title}")
        print(f"   Year: {r.year} | Citations: {r.citation_count}")
        print(f"   Score: {r.relevance_score:.2%}")

    # Verify order: citations (70%) dominate over recency (30%)
    # Expected: 2023/85 (0.845) > 2018/150 (0.70) > 2024/5 (0.335)
    assert scored[0].year == 2023, "High-citation recent paper ranks first"
    assert scored[1].year == 2018, "Very high-citation old paper ranks second (citations matter more)"
    assert scored[2].year == 2024, "New low-citation paper ranks last (too few citations)"
    print("\n[OK] Scoring order correct: cites(70%) > recency(30%)")


if __name__ == "__main__":
    try:
        test_scoring()
    except AssertionError as e:
        print(f"\n[FAILED] Test failed: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n[ERROR] {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
