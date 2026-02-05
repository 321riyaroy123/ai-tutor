from ai.retriever import retrieve

results = retrieve("Explain Newton's Second Law", top_k=3)

print(len(results))
for r in results:
    print(r["source"])
    print(r["score"])
    print(r["text"][:200])
    print("-" * 40)