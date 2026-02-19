import torch
from transformers import T5Tokenizer, T5ForConditionalGeneration
from rag.prompt_templates import build_tutor_prompt

# ---- Load once at import ----

tokenizer = T5Tokenizer.from_pretrained("google/flan-t5-base")
model = T5ForConditionalGeneration.from_pretrained("google/flan-t5-base")

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)


def generate_with_flan(
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

    inputs = tokenizer(
        prompt,
        return_tensors="pt",
        truncation=True,
        max_length=512
    ).to(device)

    outputs = model.generate(
        **inputs,
        max_length=512,
        temperature=0.2
    )

    return tokenizer.decode(outputs[0], skip_special_tokens=True)
