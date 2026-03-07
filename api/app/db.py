import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")

if not MONGO_URL:
    raise ValueError("MONGO_URL not set in environment variables")

client = AsyncIOMotorClient(MONGO_URL)

db = client.get_default_database()

users_collection = db["users"]
chats_collection = db["chats"]
progress_collection = db["progress"] 