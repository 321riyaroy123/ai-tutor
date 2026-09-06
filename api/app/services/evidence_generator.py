from typing import Any

from rag.generator_gemini import model


def generate_evidence_with_gemini(
    student_response: str,
    concept_context: str,
    ontology_context: str = "",
) -> dict[str, Any]:
    """
    Extract structured knowledge evidence from a student's response.

    The returned value must match EvidenceExtractionResult.
    """

    prompt = f"""
You are an educational evidence extraction system.

Your job is to analyze a student's response and extract evidence
about their understanding of a concept.

CONCEPT CONTEXT:
{concept_context}

ONTOLOGY CONTEXT:
{ontology_context}

STUDENT RESPONSE:
{student_response}

Return ONLY valid JSON.

The JSON must follow this structure:

{{
  "evidence": [
    {{
      "concept_id": "string",
      "evidence_type": "correct | incorrect | misconception | uncertainty",
      "evidence_strength": 0.0,
      "reasoning": "short explanation"
    }}
  ]
}}

Rules:

- Only produce evidence supported by the student's response.
- Use concept IDs provided in the ontology or concept context.
- Evidence strength must be between 0.0 and 1.0.
- Use "correct" when the student demonstrates correct understanding.
- Use "incorrect" when the student gives a clearly incorrect statement.
- Use "misconception" when the response matches a known misconception.
- Use "uncertainty" when the student expresses uncertainty or incomplete understanding.
- Do not invent concepts.
- Return an empty evidence list if no reliable evidence can be extracted.
"""

    response = model.generate_content(
        prompt,
        generation_config={
            "temperature": 0.0,
            "max_output_tokens": 2048,
            "response_mime_type": "application/json",
        },
    )

    import json

    return json.loads(response.text)