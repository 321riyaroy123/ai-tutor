from __future__ import annotations

import json
import os
from typing import Any

from google import genai

from rag.prompt_templates import build_evidence_extraction_prompt


class GeminiEvidenceGenerator:
    """
    Generates structured learning evidence using Gemini.

    This class only handles communication with Gemini.
    Validation is handled by the evidence schema.
    """

    def __init__(self, model: str = "gemini-3.6-flash"):
        api_key = os.getenv("GOOGLE_API_KEY")

        if not api_key:
            raise RuntimeError("GOOGLE_API_KEY is not configured.")

        self.client = genai.Client(api_key=api_key)
        self.model = model

    def __call__(
        self,
        student_response: str,
        concept_context: str,
        ontology_context: str = "",
    ) -> dict[str, Any]:

        prompt = build_evidence_extraction_prompt(
            student_response=student_response,
            concept_context=concept_context,
            ontology_context=ontology_context,
        )

        response = self.client.models.generate_content(
            model=self.model,
            contents=prompt,
        )

        raw_text = response.text.strip()

        # Handle occasional markdown fences.
        if raw_text.startswith("```"):
            raw_text = raw_text.strip("`")

            if raw_text.startswith("json"):
                raw_text = raw_text[4:].strip()

        try:
            return json.loads(raw_text)
        except json.JSONDecodeError as exc:
            raise ValueError(
                f"Gemini returned invalid JSON: {raw_text}"
            ) from exc