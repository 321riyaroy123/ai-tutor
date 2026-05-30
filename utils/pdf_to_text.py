import re

import pdfplumber


def clean_text(text: str) -> str:
    text = re.sub(r"-\n", "", text)
    lines = text.split("\n")
    lines = [line.strip() for line in lines if len(line.strip()) > 2]
    return "\n".join(lines)


def extract_pdf(pdf_path: str, txt_path: str, *, layout: bool = True) -> None:
    with open(txt_path, "w", encoding="utf-8") as out:
        with pdfplumber.open(pdf_path) as pdf:
            for page_number, page in enumerate(pdf.pages, start=1):
                text = page.extract_text(layout=layout) if layout else page.extract_text()
                if text:
                    cleaned = clean_text(text)
                    out.write(f"\n\n[PAGE {page_number}]\n{cleaned}\n")

    print(f"Extraction complete -> {txt_path}")


def extract_physics_pdf(pdf_path: str, txt_path: str) -> None:
    extract_pdf(pdf_path, txt_path, layout=True)


def extract_math_pdf(pdf_path: str, txt_path: str) -> None:
    extract_pdf(pdf_path, txt_path, layout=False)


if __name__ == "__main__":
    extract_physics_pdf(
        r"data/openstax/University_Physics_Volume_1_-_WEB.pdf",
        r"data/physics.txt",
    )
