def answer_quality(answer: str) -> dict:
    return {
        "length": len(answer.split()),
        "has_steps": "step" in answer.lower()
    }
