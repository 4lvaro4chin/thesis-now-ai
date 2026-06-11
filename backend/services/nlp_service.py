import logging
import re
from typing import Dict, List, Set

logger = logging.getLogger(__name__)

class NLPService:
    """
    Generador de queries booleanas sin dependencias externas.
    Puede ser reemplazado por GPT-4o-mini en el futuro (Fase 1+).
    """

    # Diccionario de sinonimias comunes en búsqueda académica
    SYNONYMS = {
        "mindfulness": ["meditation", "mindful", "awareness", "present moment"],
        "anxiety": ["anxious", "anxiety disorder", "generalized anxiety"],
        "depression": ["depressive", "depressed", "major depression", "mood"],
        "adolescents": ["adolescent", "teen", "teenagers", "youth", "young"],
        "children": ["child", "pediatric", "childhood"],
        "intervention": ["intervention", "treatment", "therapy", "program"],
        "therapy": ["therapeutic", "treatment", "counseling", "psychotherapy"],
        "stress": ["stressor", "stressful", "psychological stress"],
        "mental health": ["psychological", "psychiatric", "mental disorder"],
        "school": ["educational", "academic", "student"],
        "clinical trial": ["randomized", "RCT", "controlled trial"],
    }

    # Palabras a excluir (generalmente mejoran precisión)
    EXCLUSIONS = {
        "adult": ["adult", "elderly", "aging"],
        "animal": ["animal", "mice", "rat", "laboratory"],
        "review": ["review", "editorial", "opinion"],
    }

    def __init__(self):
        logger.info("NLP Service initialized (non-GPT mode - MVP)")

    async def generate_query(self, title: str) -> str:
        """
        Generar query booleana a partir del título.

        Ejemplo:
            Input: "Mindfulness interventions in adolescents with anxiety"
            Output: "(mindfulness OR meditation OR mindful) AND
                     (adolescent* OR teen* OR youth) AND
                     (anxiety OR anxious) NOT adult"
        """
        logger.info(f"Generating boolean query for: {title}")

        # Step 1: Extraer palabras clave
        keywords = self._extract_keywords(title)
        logger.info(f"Keywords: {keywords}")

        if not keywords:
            # Fallback: usar el título literal entre comillas
            return f'"{title}"'

        # Step 2: Agrupar por concepto
        concepts = self._group_concepts(keywords, title)
        logger.info(f"Concepts: {concepts}")

        # Step 3: Construir query booleana
        query = self._build_boolean_query(concepts)
        logger.info(f"Boolean query: {query}")

        return query

    def _extract_keywords(self, title: str) -> List[str]:
        """
        Extraer palabras significativas del título.
        - Remover stopwords comunes
        - Lemmatizar básicamente (muy simple)
        """
        stopwords = {
            "a", "an", "and", "are", "as", "at", "be", "but", "by",
            "for", "from", "has", "he", "in", "is", "it", "its", "of",
            "on", "or", "that", "the", "to", "was", "will", "with",
            "el", "la", "de", "y", "en", "una", "un",
        }

        # Convertir a lowercase y separar por no-palabras
        words = re.findall(r'\b[a-z]+\b', title.lower())

        # Filtrar stopwords y palabras muy cortas
        keywords = [
            w for w in words
            if w not in stopwords and len(w) > 2
        ]

        return list(dict.fromkeys(keywords))  # Remove duplicates, preserve order

    def _group_concepts(self, keywords: List[str], title: str) -> Dict[str, List[str]]:
        """
        Agrupar palabras en conceptos (ej: mindfulness + meditation = concepto 1).
        Usa el diccionario de sinonimias.
        """
        concepts = {}
        used = set()

        # Buscar matches en el diccionario de sinonimias
        for key, synonyms in self.SYNONYMS.items():
            for keyword in keywords:
                if keyword in used:
                    continue

                # Match directo o palabra clave contiene el sinonimo
                if keyword == key or any(keyword in syn for syn in synonyms):
                    if key not in concepts:
                        concepts[key] = []
                    concepts[key].append(keyword)
                    used.add(keyword)
                    break

        # Palabras no clasificadas forman su propio concepto
        for keyword in keywords:
            if keyword not in used:
                concepts[keyword] = [keyword]

        return concepts

    def _build_boolean_query(self, concepts: Dict[str, List[str]]) -> str:
        """
        Construir la query booleana final.
        Formato: (concepto1 OR sinonimo1 OR sinonimo2*) AND (concepto2 OR...)
        """
        if not concepts:
            return ""

        # Convertir cada concepto en una rama OR
        branches = []

        for concept, variations in concepts.items():
            # Usar wildcards para variaciones
            terms = []
            for var in variations:
                # Si la palabra es un adjetivo/verbo, agregar wildcard
                if var.endswith(("ing", "tion", "ment", "ness", "able")):
                    terms.append(f"{var}*")
                else:
                    terms.append(var)

            # Deduplicate and format
            terms = list(dict.fromkeys(terms))
            branch = " OR ".join(terms)

            if len(terms) > 1:
                branch = f"({branch})"

            branches.append(branch)

        # Combinar con AND
        query = " AND ".join(branches)

        # Agregar exclusiones si es necesario
        # (simplemente como NOT al final)
        query += ' NOT (adult OR elderly OR animal OR review)'

        return query

    async def extract_terms(self, title: str) -> dict:
        """
        Extraer conceptos del título (para UI manual builder).
        """
        keywords = self._extract_keywords(title)
        concepts = self._group_concepts(keywords, title)

        return {
            "main_concepts": list(concepts.keys()),
            "synonyms": concepts,
            "exclusions": ["adult", "elderly", "animal", "review"]
        }
