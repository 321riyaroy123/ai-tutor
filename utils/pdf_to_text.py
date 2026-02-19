import pdfplumber
import os
import re

def clean_text(text):
    text = re.sub(r"-\n", "", text)
    text = re.sub(r"\n+", "\n", text)
    return text

def extract_pdf(pdf_path, txt_path):
    with open(txt_path, "w", encoding="utf-8") as out:
        with pdfplumber.open(pdf_path) as pdf:
            for i, page in enumerate(pdf.pages):
                text = page.extract_text(layout=True)
                if text:
                    cleaned = clean_text(text)
                    out.write(f"\n\n[PAGE {i+1}]\n{cleaned}\n")

    print("✅ Extraction complete")

extract_pdf(
    r"data/openstax/University_Physics_Volume_1_-_WEB.pdf",
    r"data/physics.txt"
)

import pytesseract
from pdf2image import convert_from_path
import re

# --- heuristic to detect math-heavy text ---
def is_math_heavy(text):
    if not text:
        return False
    math_symbols = ["∫", "Σ", "√", "≈", "≠", "^", "_", "=", "+", "-", "×", "÷"]
    count = sum(text.count(sym) for sym in math_symbols)
    return count > 10   # threshold (tunable)


import pdfplumber
import re

def clean_text(text):
    # Fix broken hyphenated words
    text = re.sub(r"-\n", "", text)

    # Remove excessive blank lines
    lines = text.split("\n")
    lines = [line.strip() for line in lines if len(line.strip()) > 2]

    return "\n".join(lines)


def extract_math_pdf(pdf_path, txt_path):
    with open(txt_path, "w", encoding="utf-8") as f:
        with pdfplumber.open(pdf_path) as pdf:
            for i, page in enumerate(pdf.pages):
                text = page.extract_text()
                if text:
                    cleaned = clean_text(text)
                    f.write(f"\n\n[PAGE {i+1}]\n{cleaned}\n")

    print(f"✅ Extraction complete → {txt_path}")

'''
extract_math_pdf(
    pdf_path=r"data/openstax/CollegeAlgebra-OP.pdf",
    txt_path=r"data/math_book.txt"
)
'''