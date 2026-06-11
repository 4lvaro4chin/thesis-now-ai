import asyncio
from connectors.pubmed import PubMedConnector
from connectors.semantic_scholar import SemanticScholarConnector

async def test_connectors():
    query = "mindfulness AND anxiety AND adolescents"

    print(f"Testing connectors with query: {query}\n")

    # Test PubMed
    print("1. Testing PubMed...")
    try:
        pubmed = PubMedConnector()
        results = await pubmed.search(query)
        print(f"   PubMed results: {len(results)}")
        if results:
            print(f"   First result: {results[0].title[:80]}")
        else:
            print("   No results from PubMed")
    except Exception as e:
        print(f"   Error: {e}")

    # Test Semantic Scholar
    print("\n2. Testing Semantic Scholar...")
    try:
        ss = SemanticScholarConnector()
        results = await ss.search(query)
        print(f"   Semantic Scholar results: {len(results)}")
        if results:
            print(f"   First result: {results[0].title[:80]}")
        else:
            print("   No results from Semantic Scholar")
    except Exception as e:
        print(f"   Error: {e}")

asyncio.run(test_connectors())
