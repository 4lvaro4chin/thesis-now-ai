import os
import json
import logging
from openai import AsyncOpenAI

logger = logging.getLogger(__name__)

LANG_NAMES = {
    "es": "Spanish",
    "en": "English",
    "pt": "Portuguese",
}

ERROR_MESSAGES = {
    "es": "No se pudo generar la query. Verifica que la clave de OpenAI tenga crédito disponible.",
    "en": "Could not generate the query. Please verify that the OpenAI API key has available credits.",
    "pt": "Não foi possível gerar a query. Verifique se a chave da OpenAI tem créditos disponíveis.",
}

PROMPT_TEMPLATE = """You are a senior academic librarian and systematic literature review specialist with expertise in evidence synthesis, research methodology, and academic database search strategies (PubMed, Scopus, Web of Science, Embase, and PsycINFO).

Your task is to analyze a thesis title and generate an optimized academic search strategy for systematic or semi-systematic literature reviews.

INPUT:
THESIS TITLE: "{{THESIS_TITLE}}"

OBJECTIVE:
Based on the thesis title, perform the following tasks.

TASK 1 — BOOLEAN SEARCH QUERY

Generate a precise but comprehensive Boolean search query suitable for academic databases such as PubMed, Scopus, and Web of Science.

Search strategy rules:

Identify the core research concepts from the thesis title.
Expand each concept using relevant synonyms, spelling variations, related academic terminology, and controlled vocabulary where appropriate.
Use:
AND → to connect main concepts
OR → to group synonyms within the same concept
Use parentheses correctly to preserve Boolean logic.
Use truncation (*) when useful to capture term variations.
Avoid unnecessary noise terms.
Do NOT use exclusion filters (NOT) unless absolutely necessary.
Keep the query academically rigorous, balanced between precision and recall.
Prioritize terminology commonly used in peer-reviewed literature.

TASK 2 — NATURAL LANGUAGE EXPLANATION

Provide a brief explanation in plain {{SELECTED_LANGUAGE}} (2–3 sentences) aimed at the student who wrote the thesis.

The explanation must:

Describe what the search is intended to find.
Explain why those keywords and synonyms were selected.
Clarify what kind of academic literature the student should expect to retrieve.

OUTPUT REQUIREMENTS:

Respond ONLY in valid JSON.
Do not include markdown, comments, explanations outside JSON, or additional text.
Ensure the JSON is syntactically valid.

JSON FORMAT:

{
"thesis_title": "{{THESIS_TITLE}}",
"boolean_query": "((term1 OR term2 OR term3*) AND (term4 OR term5) AND (term6 OR term7*))",
"explanation": "Explicación breve en {{SELECTED_LANGUAGE}} para el estudiante."
}

QUALITY CHECK BEFORE RESPONDING:

Verify that all major concepts from the thesis title are represented.
Verify correct Boolean nesting with parentheses.
Verify the query is compatible with PubMed, Scopus, and Web of Science.
Verify the response is valid JSON."""


class NLPService:
    """Generate Boolean search queries using GPT-4o-mini."""

    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            logger.warning("OPENAI_API_KEY not configured")
        self.client = AsyncOpenAI(api_key=api_key)

    async def generate_query_full(self, title: str, lang: str = "es") -> dict:
        """
        Generate boolean query and explanation using GPT-4o-mini.
        Returns: {"boolean_query": str, "explanation": str}
        """
        logger.info(f"Generating query for: {title} (lang={lang})")

        language_name = LANG_NAMES.get(lang, "Spanish")
        prompt = PROMPT_TEMPLATE.replace("{{THESIS_TITLE}}", title).replace(
            "{{SELECTED_LANGUAGE}}", language_name
        )

        try:
            response = await self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2,
                response_format={"type": "json_object"},
            )

            result = json.loads(response.choices[0].message.content)
            logger.info(f"Generated query: {result.get('boolean_query', '')}")
            return result

        except Exception as e:
            logger.error(f"OpenAI error: {e}")
            raise ValueError(
                ERROR_MESSAGES.get(lang, ERROR_MESSAGES["es"])
            )

    async def generate_query(self, title: str, lang: str = "es") -> str:
        """Backward-compatible: returns only the boolean query string."""
        result = await self.generate_query_full(title, lang)
        return result.get("boolean_query", "")

    async def extract_terms(self, title: str) -> dict:
        """Extract terms from title (for manual query builder UI)."""
        return {
            "main_title": title,
            "note": "Use generate_query_full() for GPT-powered query generation",
        }
