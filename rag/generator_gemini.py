import os
from dotenv import load_dotenv
import google.generativeai as genai
from rag.prompt_templates import build_tutor_prompt

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY not set in environment variables.")

genai.configure(api_key=GOOGLE_API_KEY)

model = genai.GenerativeModel("models/gemini-2.5-flash")

def generate_with_gemini(
    context,
    question,
    student_level,
    conversation_context=""
):

    prompt = build_tutor_prompt(
        context,
        question,
        student_level,
        conversation_context
    )

    response = model.generate_content(
        prompt,
        generation_config={
            "temperature": 0.3,
            "max_output_tokens": 2000
        }
    )

    return response.text
