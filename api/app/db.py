from motor.motor_asyncio import AsyncIOMotorClient
from api.app.env import get_required_env

MONGO_URL = get_required_env("MONGO_URL")
client = AsyncIOMotorClient(MONGO_URL)

db = client["ai-tutor"]

# Existing collections
users_collection = db["users"]
chats_collection = db["chats"]
progress_collection = db["progress"]

# Knowledge-state collections
knowledge_states_collection = db["knowledge_states"]
knowledge_evidence_collection = db["knowledge_evidence"]
knowledge_history_collection = db["knowledge_history"]