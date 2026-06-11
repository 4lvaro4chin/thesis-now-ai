import asyncio
import os
from dotenv import load_dotenv
from services.nlp_service import NLPService

load_dotenv()

async def test_nlp():
    nlp = NLPService()

    title = "Mindfulness interventions in adolescents with anxiety"
    print(f"Titulo: {title}\n")

    try:
        query = await nlp.generate_query(title)
        print(f"Query generada:\n{query}\n")

        # Analyze the query
        if "AND" in query or "OR" in query or "NOT" in query or "*" in query:
            print("[OK] Query parece ser booleana")
        else:
            print("[WARN] Query podria no ser booleana real")

    except Exception as e:
        print(f"Error: {e}")

asyncio.run(test_nlp())
