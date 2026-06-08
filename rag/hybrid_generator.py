# rag/hybrid_generator.py

from rag.generator_gemini import generate_with_gemini


def is_computational_math(question: str) -> bool:
    keywords = ["solve", "evaluate", "factor", "simplify", "find", "="]
    return any(keyword in question.lower() for keyword in keywords)


def generate_answer(context, question, base_confidence,
                    student_level="intermediate", conversation_context="",
                    confidence_threshold=0.3,
                    followup_mode=None):

    confidence = base_confidence if base_confidence else 0.0

    if confidence < confidence_threshold:
        return (
            "I don't have enough information in the provided material.",
            "none",
            confidence,
        )

    if followup_mode == "answers":
        mode = "followup_answers"
        context_to_use = context
    elif followup_mode == "detailed":
        mode = "detailed_solver"
        context_to_use = context
    elif is_computational_math(question):
        mode = "solver"
        context_to_use = ""
    else:
        mode = "concept"
        context_to_use = context

    try:
        answer = generate_with_gemini(
            context_to_use,
            question,
            student_level,
            conversation_context,
            mode=mode,
        )

        if not answer or not answer.strip():
            raise ValueError("Gemini returned empty response")

        return answer, "gemini", confidence

    except Exception as error:
        print(f"Gemini failed ({mode}):", error)

        # Lazy import — only loads FLAN-T5 into RAM if Gemini actually fails
        try:
            from rag.generator_flan import generate_with_flan  # noqa: PLC0415
            fallback_answer = generate_with_flan(
                context, question, student_level, conversation_context
            )
            return fallback_answer, "flan-t5", confidence
        except Exception as fallback_error:
            print("FLAN also failed:", fallback_error)
            raise