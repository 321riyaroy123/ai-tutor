from motor.motor_asyncio import AsyncIOMotorClient
from api.app.env import get_required_env

MONGO_URL = get_required_env("MONGO_URL")

client = AsyncIOMotorClient(MONGO_URL)

db = client["ai-tutor"]

users_collection = db["users"]
chats_collection = db["chats"]
progress_collection = db["progress"]
