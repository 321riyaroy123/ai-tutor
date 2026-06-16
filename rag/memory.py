# rag/memory.py - FIXED VERSION
# Adds MongoDB persistence while keeping in-memory cache for performance

from collections import deque
from datetime import datetime
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

# In-memory cache for quick access
MAX_HISTORY = 6  # 3 turns (Q/A pairs)
_memory_cache: Dict[str, deque] = {}

# MongoDB collections will be injected at startup
_db = None
_conversation_collection = None


def initialize_db(db):
    """
    Initialize MongoDB connection.
    Call this during app startup.
    
    Args:
        db: Motor AsyncIOMotorDatabase instance from MongoDB
    """
    global _db, _conversation_collection
    _db = db
    _conversation_collection = db["conversations"]
    logger.info("Conversation memory initialized with MongoDB backing")


def get_history_sync(user_id: str) -> List[Dict[str, Any]]:
    """
    Get conversation history from in-memory cache (synchronous).
    Use this only if async is not available.
    
    Returns:
        List of conversation entries
    """
    if user_id not in _memory_cache:
        _memory_cache[user_id] = deque(maxlen=MAX_HISTORY)
    
    return list(_memory_cache[user_id])


async def get_history(user_id: str) -> List[Dict[str, Any]]:
    """
    Get conversation history, fetching from MongoDB if not cached.
    Caches result in memory for performance.
    
    Args:
        user_id: User identifier (email or user ID)
    
    Returns:
        List of dicts with "question", "answer", "created_at" keys
    """
    # Return from memory cache if available
    if user_id in _memory_cache and len(_memory_cache[user_id]) > 0:
        return list(_memory_cache[user_id])
    
    # Fetch from MongoDB if no memory cache
    if _conversation_collection is None:
        logger.warning("MongoDB not initialized, returning empty history")
        return []
    
    try:
        docs = await _conversation_collection.find(
            {"user_id": user_id}
        ).sort("created_at", -1).limit(MAX_HISTORY).to_list(MAX_HISTORY)
        
        # Store in memory cache
        _memory_cache[user_id] = deque(docs, maxlen=MAX_HISTORY)
        
        # Reverse to get chronological order (oldest first)
        return list(reversed(docs))
        
    except Exception as e:
        logger.error(f"Failed to fetch history from MongoDB for {user_id}: {e}")
        return []


async def add_to_history(
    user_id: str,
    question: str,
    answer: str
) -> bool:
    """
    Add conversation entry to both MongoDB and memory cache.
    
    Args:
        user_id: User identifier
        question: The student's question
        answer: The tutor's answer
    
    Returns:
        True if successful, False otherwise
    """
    entry = {
        "user_id": user_id,
        "question": question.strip(),
        "answer": answer.strip(),
        "created_at": datetime.utcnow()
    }
    
    # Add to MongoDB for persistence
    if _conversation_collection is not None:
        try:
            result = await _conversation_collection.insert_one(entry)
            logger.debug(f"Saved conversation for {user_id}: {result.inserted_id}")
        except Exception as e:
            logger.error(f"Failed to save conversation to MongoDB: {e}")
            return False
    
    # Update memory cache
    if user_id not in _memory_cache:
        _memory_cache[user_id] = deque(maxlen=MAX_HISTORY)
    
    _memory_cache[user_id].append(entry)
    
    return True


async def clear_history(user_id: str) -> bool:
    """
    Clear all conversation history for a user.
    
    Args:
        user_id: User identifier
    
    Returns:
        True if successful
    """
    # Clear memory
    if user_id in _memory_cache:
        _memory_cache[user_id].clear()
    
    # Clear MongoDB
    if _conversation_collection is not None:
        try:
            result = await _conversation_collection.delete_many({"user_id": user_id})
            logger.info(f"Cleared {result.deleted_count} conversation entries for {user_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to clear history from MongoDB: {e}")
            return False
    
    return True


async def get_conversation_context(user_id: str, max_turns: int = 3) -> str:
    """
    Get formatted conversation context for the LLM.
    
    Args:
        user_id: User identifier
        max_turns: Maximum Q/A pairs to include
    
    Returns:
        Formatted string like:
        "Student: What is force?
         Tutor: Force is...
         Student: How does it relate to mass?
         Tutor: Through Newton's second law..."
    """
    history = await get_history(user_id)
    
    if not history:
        return ""
    
    # Take most recent N turns
    recent = history[-max_turns:] if len(history) > max_turns else history
    
    lines = []
    for entry in recent:
        question = entry.get("question", "").strip()
        answer = entry.get("answer", "").strip()
        
        if question:
            lines.append(f"Student: {question}")
        if answer:
            lines.append(f"Tutor: {answer}")
    
    return "\n".join(lines)


# ============================================================================
# MIGRATION HELPER (for existing codebases using the old sync API)
# ============================================================================

def get_history_legacy(user_id: str) -> List[Dict]:
    """
    Legacy synchronous version for backward compatibility.
    DO NOT USE in new code - use async get_history instead.
    
    Deprecated: Use async get_history() instead
    """
    logger.warning("get_history_legacy() is deprecated, use async get_history()")
    return get_history_sync(user_id)


def add_to_history_legacy(user_id: str, question: str, answer: str):
    """
    Legacy synchronous version for backward compatibility.
    DO NOT USE in new code.
    
    Deprecated: Use async add_to_history() instead
    """
    logger.warning("add_to_history_legacy() is deprecated, use async add_to_history()")
    
    if user_id not in _memory_cache:
        _memory_cache[user_id] = deque(maxlen=MAX_HISTORY)
    
    _memory_cache[user_id].append({
        "question": question,
        "answer": answer,
        "created_at": datetime.utcnow()
    })
