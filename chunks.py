from rag.chunker import chunk_text

with open("data/physics.txt", "r", encoding="utf-8") as f:
    text = f.read()

chunks = chunk_text(text)

print("Total chunks:", len(chunks))
print("\nSample chunk:\n")
print(chunks[0])
