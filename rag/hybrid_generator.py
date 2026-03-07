from rag.generator_gemini import generate_with_gemini
from rag.generator_flan import generate_with_flan

def is_computational_math(question: str) -> bool:
    keywords = ["solve", "evaluate", "factor", "simplify", "find", "="]
    return any(k in question.lower() for k in keywords)

def generate_answer(context, question, base_confidence,
                    student_level="intermediate", conversation_context="",
                    confidence_threshold=0.3,
                    followup_mode=None):
    """
    followup_mode: None | "answers" | "detailed"
      - "answers"  → give final answers only for a previously generated problem set
      - "detailed" → give full step-by-step solutions for a previously generated set
      - None       → normal question routing
    """

    confidence = base_confidence if base_confidence else 0.0

    if confidence < confidence_threshold:
        return (
            "I don't have enough information in the provided material.",
            "none",
            confidence
        )

    # ── Follow-up: solutions to a previously generated problem set ──────────
    if followup_mode == "answers":
        mode = "followup_answers"
        context_to_use = context   # context holds the injected problem set

    elif followup_mode == "detailed":
        mode = "detailed_solver"
        context_to_use = context

    # ── New direct question ──────────────────────────────────────────────────
    elif is_computational_math(question):
        mode = "solver"
        context_to_use = ""        # no RAG needed for self-contained problems

    else:
        mode = "concept"
        context_to_use = context

    try:
        answer = generate_with_gemini(
            context_to_use,
            question,
            student_level,
            conversation_context,
            mode=mode
        )

        if not answer or not answer.strip():
            raise ValueError("Gemini returned empty response")

        return answer, "gemini", confidence

    except Exception as e:
        print(f"Gemini failed ({mode}):", e)

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