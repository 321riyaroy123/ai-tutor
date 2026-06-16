# rag/generator_flan.py - OPTIMIZED FOR RENDER
# Lazy loads model only when needed, uses quantization to save memory

import torch
from transformers import T5Tokenizer, T5ForConditionalGeneration
from rag.prompt_templates import build_tutor_prompt
import logging

logger = logging.getLogger(__name__)

# Don't load at import time - load on first use
_tokenizer = None
_model = None
_device = None

MODEL_NAME = "google/flan-t5-small"  # Smaller model: 250MB vs 1GB for base

def _initialize_model():
    """Initialize model on first use (lazy loading)"""
    global _tokenizer, _model, _device
    
    if _model is not None:
        return  # Already loaded
    
    logger.info(f"Loading {MODEL_NAME} (lazy loading - first request may be slow)...")
    
    _device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    logger.info(f"Using device: {_device}")
    
    # Load tokenizer
    _tokenizer = T5Tokenizer.from_pretrained(MODEL_NAME)
    logger.debug(f"Tokenizer loaded for {MODEL_NAME}")
    
    # Try to load with 8-bit quantization (saves 75% memory)
    try:
        from transformers import AutoModelForSeq2SeqLM
        
        logger.info("Attempting 8-bit quantization (requires bitsandbytes)...")
        _model = AutoModelForSeq2SeqLM.from_pretrained(
            MODEL_NAME,
            load_in_8bit=True,        # Quantize to 8-bit
            device_map="auto",         # Auto-manage GPU/CPU
            torch_dtype=torch.float32  # Explicit dtype
        )
        logger.info(f"✓ {MODEL_NAME} loaded with 8-bit quantization (~150MB)")
        
    except ImportError:
        logger.warning("bitsandbytes not available, loading without quantization...")
        _model = T5ForConditionalGeneration.from_pretrained(MODEL_NAME)
        _model.to(_device)
        logger.info(f"✓ {MODEL_NAME} loaded without quantization (~250MB)")
        
    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        raise


def generate_with_flan(
    context: str,
    question: str,
    student_level: str,
    conversation_context: str = ""
) -> str:
    """
    Generate answer using FLAN-T5 (small, quantized).
    
    Args:
        context: Relevant course material
        question: Student's question
        student_level: "beginner", "intermediate", or "advanced"
        conversation_context: Previous Q/A history
    
    Returns:
        Generated answer text
    """
    # Initialize model if not already done (lazy loading)
    _initialize_model()
    
    # Build prompt
    prompt = build_tutor_prompt(
        context,
        question,
        student_level,
        conversation_context
    )
    
    # Tokenize with truncation to save memory
    inputs = _tokenizer(
        prompt,
        return_tensors="pt",
        truncation=True,
        max_length=512  # Truncate long prompts
    ).to(_device)
    
    logger.debug(f"Input tokens: {inputs['input_ids'].shape}")
    
    # Generate with memory-efficient settings
    with torch.no_grad():  # Disable gradient computation (saves memory)
        outputs = _model.generate(
            **inputs,
            max_length=256,        # Shorter responses (was 512)
            temperature=0.2,       # Low temp = more consistent
            do_sample=False,       # Greedy decoding (faster, less memory)
            num_beams=1,          # Greedy search (no beam search overhead)
            length_penalty=0.0,    # Neutral penalty
            early_stopping=True    # Stop ASAP
        )
    
    # Decode response
    answer = _tokenizer.decode(outputs[0], skip_special_tokens=True)
    
    logger.debug(f"Generated {len(answer.split())} words")
    
    return answer


# Health check function
def is_model_loaded() -> bool:
    """Check if model is already in memory"""
    return _model is not None


def model_memory_info() -> dict:
    """Get memory info about loaded model"""
    if _model is None:
        return {"status": "not_loaded", "memory_mb": 0}
    
    try:
        import psutil
        process = psutil.Process()
        memory_mb = process.memory_info().rss / 1024 / 1024
        
        return {
            "status": "loaded",
            "model": MODEL_NAME,
            "device": str(_device),
            "memory_mb": round(memory_mb, 1),
            "quantized": "8bit" in str(_model.dtype) if _model else False
        }
    except Exception as e:
        logger.warning(f"Could not get memory info: {e}")
        return {"status": "loaded", "memory_mb": "unknown"}
