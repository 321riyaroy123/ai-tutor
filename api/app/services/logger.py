import json
import os

os.makedirs("logs", exist_ok=True)

def log_request(data: dict):
    try:
        with open("logs/requests.jsonl", "a", encoding="utf-8") as f:
            f.write(json.dumps(data) + "\n")
    except Exception as e:
        print("Logging failed:", e)