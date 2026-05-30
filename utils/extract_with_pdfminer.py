import re

import fitz


def clean_text(text: str) -> str:
    text = re.sub(r"-\n", "", text)
    text = re.sub(r"\n+", "\n", text)
    return text.strip()


def extract_pdf(pdf_path: str, txt_path: str) -> None:
    doc = fitz.open(pdf_path)

    with open(txt_path, "w", encoding="utf-8") as out:
        for page_num, page in enumerate(doc):
            text = page.get_text("text")
            if text:
                cleaned = clean_text(text)
                out.write(f"\n\n[PAGE {page_num + 1}]\n{cleaned}\n")

    print("Extraction complete using PyMuPDF")


if __name__ == "__main__":
    extract_pdf(
        r"data/openstax/University_Physics_Volume_1_-_WEB.pdf",
        r"data/physics.txt",
    )
