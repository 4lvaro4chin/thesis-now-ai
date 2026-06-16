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

def _load_prompt_template() -> str:
    """Load prompt template from file."""
    prompts_dir = os.getenv("PROMPTS_DIR", "./prompts")
    prompt_path = os.path.join(prompts_dir, "academic_query.txt")

    try:
        with open(prompt_path, "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        logger.error(f"Prompt file not found: {prompt_path}")
        raise ValueError(f"Prompt template not found at {prompt_path}")

PROMPT_TEMPLATE = _load_prompt_template()


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
