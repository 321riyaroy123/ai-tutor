from rag.generator_gemini import generate_with_gemini
from rag.generator_flan import generate_with_flan


def generate_answer(context, question, base_confidence,
                    student_level="intermediate", conversation_context="",
                    confidence_threshold=0.3):

    confidence = base_confidence if base_confidence else 0.0

    if confidence < confidence_threshold:
        return (
            "I don’t have enough information in the provided material.",
            "none",
            confidence
        )

    try:
        answer = generate_with_gemini(
            context,
            question,
            student_level,
            conversation_context
        )

        if not answer:
            raise ValueError("Gemini returned empty")

        return answer, "gemini", confidence

    except Exception as e:
        print("Gemini failed:", e)

        try:
            fallback_answer = generate_with_flan(
                context,
                question,
                student_level,
                conversation_context
            )
            return fallback_answer, "flan-t5", confidence

        except Exception as e2:
            print("FLAN also failed:", e2)
            raise

