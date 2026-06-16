# rag/hybrid_generator.py - RENDER OPTIMIZED
# Prioritizes Gemini (API-based, no local models), minimal FLAN fallback

import logging
from typing import Tuple

logger = logging.getLogger(__name__)


def is_computational_math(question: str) -> bool:
    """Check if question requires computation"""
    keywords = ["solve", "evaluate", "factor", "simplify", "find", "="]
    return any(keyword in question.lower() for keyword in keywords)


def generate_answer(
    context: str,
    question: str,
    base_confidence: float,
    student_level: str = "intermediate",
    conversation_context: str = "",
    confidence_threshold: float = 0.3,
    followup_mode=None,
    use_flan_fallback: bool = False  # NEW: Control fallback
) -> Tuple[str, str, float]:
    """
    Generate answer using Gemini (primary) with optional FLAN fallback.
    
    Args:
        context: Retrieved course material
        question: Student's question
        base_confidence: Confidence score from retrieval (0-1)
        student_level: "beginner", "intermediate", "advanced"
        conversation_context: Previous conversation history
        confidence_threshold: Min confidence to attempt answer
        followup_mode: None | "answers" | "detailed"
        use_flan_fallback: Use FLAN-T5 fallback (saves memory if False)
    
    Returns:
        (answer, model_used, confidence): Tuple of response, model name, confidence
    """
    
    confidence = base_confidence if base_confidence else 0.0

    # Check if we have enough information
    if confidence < confidence_threshold:
        logger.warning(f"Low confidence ({confidence:.2f}), returning generic response")
        return (
            "I don't have enough information in the provided material. "
            "Please ask a more specific question or check the course materials.",
            "none",
            confidence,
        )

    # Determine generation mode
    if followup_mode == "answers":
        mode = "followup_answers"
        context_to_use = context
    elif followup_mode == "detailed":
        mode = "detailed_solver"
        context_to_use = context
    elif is_computational_math(question):
        mode = "solver"
        context_to_use = ""  # Self-contained problem
    else:
        mode = "concept"
        context_to_use = context

    # ====================================================================
    # PRIMARY: Gemini API (always try this first)
    # ====================================================================
    try:
        from rag.generator_gemini import generate_with_gemini
        
        logger.info(f"Generating with Gemini ({mode})...")
        answer = generate_with_gemini(
            context_to_use,
            question,
            student_level,
            conversation_context,
            mode=mode,
        )

        if answer and answer.strip():
            logger.info(f"✓ Gemini generated {len(answer.split())} words")
            return answer, "gemini", confidence
        else:
            logger.warning("Gemini returned empty response")
            raise ValueError("Empty response")

    except Exception as error:
        logger.error(f"Gemini generation failed ({mode}): {error}")

        # ====================================================================
        # FALLBACK: FLAN-T5 (only if enabled and Gemini failed)
        # ====================================================================
        if use_flan_fallback:
            logger.info("Falling back to FLAN-T5...")
            try:
                from rag.generator_flan import generate_with_flan
                
                fallback_answer = generate_with_flan(
                    context,
                    question,
                    student_level,
                    conversation_context,
                )
                
                if fallback_answer and fallback_answer.strip():
                    logger.info(f"✓ FLAN-T5 generated {len(fallback_answer.split())} words")
                    return fallback_answer, "flan-t5", confidence
                else:
                    raise ValueError("Empty response from FLAN")

            except Exception as fallback_error:
                logger.error(f"FLAN-T5 also failed: {fallback_error}")
                # Both failed - return error message
                return (
                    "I encountered an error generating a response. "
                    f"Error: {str(error)[:100]}. Please try again later.",
                    "none",
                    confidence
                )
        else:
            # No fallback enabled - return error
            logger.warning("FLAN-T5 fallback disabled, returning error")
            return (
                f"Unable to generate response using available models. "
                f"The LLM service may be temporarily unavailable. "
                f"Please try again in a moment.",
                "none",
                confidence
            )


# ============================================================================
# CONFIGURATION & HELPERS
# ============================================================================

def get_generator_config() -> dict:
    """Get current generator configuration"""
    return {
        "primary_model": "gemini-2.5-flash",
        "fallback_model": "flan-t5-small",
        "fallback_enabled": False,  # Disabled by default for memory
        "priority": "Gemini API > Error (fallback disabled)",
    }


def set_flan_fallback(enabled: bool) -> None:
    """
    Enable/disable FLAN-T5 fallback.
    
    Args:
        enabled: True to enable fallback, False to disable
    
    Usage:
        # Disable fallback on Render (memory-constrained)
        set_flan_fallback(False)
        
        # Enable fallback on beefier servers
        set_flan_fallback(True)
    """
    global USE_FLAN_FALLBACK
    USE_FLAN_FALLBACK = enabled
    log_level = "ENABLED" if enabled else "DISABLED"
    logger.info(f"FLAN-T5 fallback: {log_level}")


# Global config
USE_FLAN_FALLBACK = False  # Disabled by default for Render

# Override in generate_answer
def generate_answer_v2(
    context: str,
    question: str,
    base_confidence: float,
    student_level: str = "intermediate",
    conversation_context: str = "",
    confidence_threshold: float = 0.3,
    followup_mode=None,
) -> Tuple[str, str, float]:
    """
    Wrapper that uses global fallback setting.
    """
    return generate_answer(
        context=context,
        question=question,
        base_confidence=base_confidence,
        student_level=student_level,
        conversation_context=conversation_context,
        confidence_threshold=confidence_threshold,
        followup_mode=followup_mode,
        use_flan_fallback=USE_FLAN_FALLBACK  # Use global setting
    )
