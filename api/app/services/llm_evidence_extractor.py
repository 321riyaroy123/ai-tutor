from api.app.services.evidence_extractor import EvidenceExtractionResult


class LLMEvidenceExtractor:
    """
    Model-independent evidence extraction service.
    """

    def __init__(self, generator):
        self.generator = generator

    def extract(
        self,
        student_response: str,
        concept_context: str,
        ontology_context: str = "",
    ) -> EvidenceExtractionResult:

        raw_output = self.generator(
            student_response=student_response,
            concept_context=concept_context,
            ontology_context=ontology_context,
        )

        return EvidenceExtractionResult.model_validate(
            raw_output
        )