import httpx
import asyncio
import json
import time

async def test_search():
    async with httpx.AsyncClient(timeout=120) as client:
        # Step 1: Start search
        print("Step 1: Iniciando busqueda...")
        search_request = {
            "title": "Mindfulness interventions in adolescents with anxiety",
            "databases": ["pubmed", "semantic_scholar"]
        }

        response = await client.post(
            "http://localhost:8000/search",
            json=search_request
        )

        data = response.json()
        job_id = data["job_id"]
        print(f"  Job ID: {job_id}")
        print(f"  Status: {data['status']}\n")

        # Step 2: Poll for results
        print("Step 2: Esperando resultados (timeout 3 min)...")
        max_wait = 180
        start_time = time.time()

        while True:
            elapsed = time.time() - start_time
            if elapsed > max_wait:
                print(f"  Timeout despues de {max_wait} segundos")
                break

            response = await client.get(f"http://localhost:8000/search/{job_id}")
            result = response.json()
            status = result["status"]

            print(f"  [{elapsed:.1f}s] Status: {status}         ", end="\r")

            if status == "completed":
                print(f"  [{elapsed:.1f}s] Status: COMPLETADO                ")

                # Show results
                boolean_query = result.get("boolean_query")
                results = result.get("results", [])

                print(f"\nStep 3: Resultados")
                print(f"  Boolean Query: {boolean_query}")
                print(f"  Total resultados: {len(results)}")

                if results:
                    print(f"\n  Primeros 3 resultados:")
                    for i, r in enumerate(results[:3], 1):
                        print(f"\n    {i}. {r['title'][:80]}...")
                        print(f"       Fuente: {r['source']}")
                        print(f"       Relevancia: {r['relevance_score']:.2%}")
                        if r.get('authors'):
                            print(f"       Autores: {', '.join(r['authors'][:2])}")

                break

            elif status == "error":
                print(f"\n  Error: {result.get('error')}")
                break

            await asyncio.sleep(2)

asyncio.run(test_search())
