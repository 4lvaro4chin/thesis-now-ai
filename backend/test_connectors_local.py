#!/usr/bin/env python3
"""
Test script para PubMed y Semantic Scholar connectors en local.
Ejecutar: poetry run python test_connectors_local.py
O: python test_connectors_local.py
"""

import asyncio
import logging
import json
from connectors.pubmed import PubMedConnector
from connectors.semantic_scholar import SemanticScholarConnector

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

async def test_connectors():
    """Test both connectors with sample queries"""

    # Test queries (boolean for PubMed, keywords for Semantic Scholar)
    test_cases = [
        {
            "name": "Mindfulness + Adolescents",
            "pubmed_query": "(mindfulness OR meditation) AND (adolescent* OR teen*) AND (anxiety OR anxious)",
            "semantic_scholar_query": "mindfulness adolescents anxiety",
        },
        {
            "name": "Depression + Mental Health",
            "pubmed_query": "depression AND (mental health OR psychiatric) NOT (animal OR review)",
            "semantic_scholar_query": "depression mental health treatment",
        },
    ]

    pubmed = PubMedConnector()
    semantic_scholar = SemanticScholarConnector()

    for test_case in test_cases:
        print("\n" + "="*70)
        print(f"Test Case: {test_case['name']}")
        print("="*70)

        # Test PubMed
        print(f"\n[PubMed] Query: {test_case['pubmed_query'][:60]}...")
        try:
            pubmed_results = await pubmed.search(test_case['pubmed_query'], max_results=10)
            print(f"[OK] PubMed: Found {len(pubmed_results)} results")

            if pubmed_results:
                for i, result in enumerate(pubmed_results[:3], 1):
                    print(f"\n  [{i}] {result.title[:70]}...")
                    print(f"      Authors: {', '.join(result.authors[:2]) if result.authors else 'N/A'}")
                    print(f"      Year: {result.year}")
                    print(f"      PMID: {result.pmid}")
                    print(f"      DOI: {result.doi}")
                    print(f"      Relevance: {result.relevance_score:.2f}")
            else:
                print("  [!] No results found")

        except Exception as e:
            print(f"[ERROR] PubMed error: {str(e)}")

        # Test Semantic Scholar
        print(f"\n[Semantic Scholar] Query: {test_case['semantic_scholar_query']}")
        try:
            ss_results = await semantic_scholar.search(test_case['semantic_scholar_query'], max_results=10)
            print(f"[OK] Semantic Scholar: Found {len(ss_results)} results")

            if ss_results:
                for i, result in enumerate(ss_results[:3], 1):
                    print(f"\n  [{i}] {result.title[:70]}...")
                    print(f"      Authors: {', '.join(result.authors) if result.authors else 'N/A'}")
                    print(f"      Year: {result.year}")
                    print(f"      DOI: {result.doi}")
                    print(f"      URL: {result.url}")
                    print(f"      Relevance: {result.relevance_score:.2f}")
            else:
                print("  [!] No results found")

        except Exception as e:
            print(f"[ERROR] Semantic Scholar error: {str(e)}")

        # Summary
        print(f"\n[SUMMARY]")
        print(f"   PubMed results: {len(pubmed_results) if pubmed_results else 0}")
        print(f"   Semantic Scholar results: {len(ss_results) if ss_results else 0}")

async def test_combined_search():
    """Test the combined search (like the SearchService does)"""
    from services.search_service import SearchService

    print("\n" + "="*70)
    print("Combined Search Test (SearchService)")
    print("="*70)

    search_service = SearchService()

    # Query booleana simple
    query = "(mindfulness OR meditation) AND (stress OR anxiety)"
    databases = ["pubmed", "semantic_scholar"]

    print(f"\nQuery: {query}")
    print(f"Databases: {databases}")
    print("Searching...")

    try:
        results = await search_service.search_all_databases(query, databases)
        print(f"\n[OK] Combined results: {len(results)} total unique articles")

        # Group by source
        by_source = {}
        for result in results:
            if result.source not in by_source:
                by_source[result.source] = []
            by_source[result.source].append(result)

        for source, items in by_source.items():
            print(f"   {source}: {len(items)} articles")

        # Show top 5
        if results:
            print(f"\n[TOP 5] By relevance:")
            for i, result in enumerate(sorted(results, key=lambda r: r.relevance_score, reverse=True)[:5], 1):
                print(f"  [{i}] {result.title[:70]}... ({result.source})")

    except Exception as e:
        print(f"[ERROR] Combined search error: {str(e)}")

async def main():
    """Run all tests"""
    print("\n" + "[*] ThesisNow Backend - Connector Testing [*]".center(70))
    print("="*70)
    print(f"Testing PubMed and Semantic Scholar connectors")
    print(f"All queries tested without OpenAI (NLP not needed)")
    print("="*70)

    # Test individual connectors
    await test_connectors()

    # Test combined search
    await test_combined_search()

    print("\n" + "="*70)
    print("[OK] Testing Complete!")
    print("="*70)
    print("\n[NOTES]")
    print("  - If queries return 0 results, try simpler queries (single keywords)")
    print("  - PubMed uses boolean operators (AND, OR, NOT)")
    print("  - Semantic Scholar prefers keyword searches")
    print("  - Relevance scores vary by connector implementation")
    print("\n[NEXT STEPS]")
    print("  1. Review results quality and structure")
    print("  2. Adjust query generation if needed")
    print("  3. Test with more complex queries once OpenAI is available")

if __name__ == "__main__":
    asyncio.run(main())
