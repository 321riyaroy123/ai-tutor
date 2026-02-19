from rag.retriever import retrieve_context
from rag.hybrid_generator import generate_answer

context, pages, sources, scores = retrieve_context(
    "What is a perfect square trinomial?"
)

print("Scores:", scores)
print("Sources:", sources)
print("Pages:", pages)
print(context[:500])


'''
context, pages, sources, scores = retrieve_context(
    "State Newton's Second Law"
)

answer, model_used, confidence = generate_answer(
    context,
    "State Newton's Second Law",
    scores,
    student_level="intermediate"
)

print("Model:", model_used)
print("Confidence:", confidence)
print("Sources:", sources)
print("Pages:", pages)
print(answer[:700])

context, pages, sources, scores = retrieve_context(
    "Can you give a real-world example?"
)

answer, model_used, confidence = generate_answer(
    context,
    "Can you give a real-world example?",
    scores,
    student_level="intermediate"
)

print(answer[:500])

context, pages, sources, scores = retrieve_context(
    "What is a perfect square trinomial?"
)

answer, model_used, confidence = generate_answer(
    context,
    "What is a perfect square trinomial?",
    scores,
    student_level="intermediate"
)

print("Model:", model_used)
print("Confidence:", confidence)
print("Sources:", sources)
print("Pages:", pages)
print(answer[:700])

context, pages, sources, scores = retrieve_context(
    "Explain acceleration."
)

answer, model_used, confidence = generate_answer(
    context,
    "Explain acceleration.",
    scores,
    student_level="intermediate"
)

print("Model:", model_used)
print("Confidence:", confidence)
print("Sources:", sources)
print("Pages:", pages)
print(answer[:700])
'''