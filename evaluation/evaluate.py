import json
import numpy as np
from rag.retriever import retrieve_context
from rag.hybrid_generator import generate_answer


def keyword_score(answer, expected_keywords):
    answer_lower = answer.lower()
    matches = sum(1 for k in expected_keywords if k.lower() in answer_lower)
    return matches / len(expected_keywords)


def run_evaluation():
    with open("evaluation/test_questions.json", "r") as f:
        test_data = json.load(f)

    results = []

    for item in test_data:
        question = item["question"]
        expected_keywords = item["expected_keywords"]

        context, scores = retrieve_context(question)
        answer, model_used = generate_answer(context, question)

        retrieval_score = float(np.max(scores))
        answer_score = keyword_score(answer, expected_keywords)

        grounded = all(
            keyword.lower() in context.lower()
            for keyword in expected_keywords
        )

        results.append({
            "question": question,
            "model": model_used,
            "retrieval_score": retrieval_score,
            "answer_keyword_score": answer_score,
            "grounded": grounded
        })

    return results


if __name__ == "__main__":
    results = run_evaluation()

    for r in results:
        print("\n------------------------")
        for k, v in r.items():
            print(f"{k}: {v}")
