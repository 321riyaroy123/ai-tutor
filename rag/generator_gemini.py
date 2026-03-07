import os
from dotenv import load_dotenv
import google.generativeai as genai
from rag.prompt_templates import build_tutor_prompt

load_dotenv(override=True)

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY not set in environment variables.")

genai.configure(api_key=GOOGLE_API_KEY)

model = genai.GenerativeModel("models/gemini-2.5-flash")

# Token budgets per mode — generous enough to never cut off, tight enough to be efficient
TOKEN_BUDGET = {
    "followup_answers": 1200,   # Final answers only — compact
    "detailed_solver":  8192,   # Full step-by-step — needs room
    "solver":           4096,   # Single problem solve
    "concept":          3000,   # Explanation + examples
}

def generate_with_gemini(context, question, student_level,
                         conversation_context="", mode="concept"):

    prompt = build_tutor_prompt(
        context,
        question,
        student_level,
        conversation_context,
        mode=mode
    )

    max_tokens = TOKEN_BUDGET.get(mode, 3000)

    response = model.generate_content(
        prompt,
        generation_config={
            "temperature": 0.3,
            "max_output_tokens": max_tokens,
        }
    )

    return response.text