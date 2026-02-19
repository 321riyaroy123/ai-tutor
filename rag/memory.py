from collections import defaultdict, deque

# Stores last N exchanges per user
MAX_HISTORY = 6  # 3 turns (Q/A pairs)

conversation_store = defaultdict(lambda: deque(maxlen=MAX_HISTORY))


def get_history(user_id):
    return list(conversation_store[user_id])


def add_to_history(user_id, question, answer):
    conversation_store[user_id].append({
        "question": question,
        "answer": answer
    })
