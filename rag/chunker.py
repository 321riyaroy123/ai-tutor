import re
from typing import List, Dict


def clean_math_text(text: str) -> str:
    """
    Cleans math extraction artifacts while keeping formulas intact.
    Safe for both math and physics.
    """

    # Fix broken words: diffe ence -> difference
    text = re.sub(r"([a-zA-Z])\s+([a-zA-Z])", r"\1\2", text)

    # Normalize whitespace
    text = re.sub(r"\s+", " ", text)

    # Fix simple exponent patterns: x 2 → x^2
    text = re.sub(r"([a-zA-Z])\s+(\d+)", r"\1^\2", text)

    # Fix common fraction artifacts
    text = text.replace("___", "/")
    text = text.replace("_ _", "/")

    # Remove weird unicode artifacts
    text = re.sub(r"[]", "", text)

    return text.strip()


def _split_long_paragraph(words, max_words):
    chunks = []
    i = 0
    while i < len(words):
        part = words[i:i + max_words]
        chunks.append(" ".join(part))
        i += max_words
    return chunks


def _chunk_paragraphs(
    text: str,
    page_number: int,
    min_words: int,
    max_words: int
) -> List[Dict]:

    paragraphs = re.split(r'\n\s*\n', text.strip())

    chunks = []
    buffer_words = []

    for para in paragraphs:
        para = para.strip()
        if not para:
            continue

        words = para.split()

        # Split very long paragraph
        if len(words) > max_words:
            if buffer_words:
                chunks.append({
                    "page": page_number,
                    "text": " ".join(buffer_words).strip()
                })
                buffer_words = []

            for sub in _split_long_paragraph(words, max_words):
                chunks.append({
                    "page": page_number,
                    "text": sub.strip()
                })
            continue

        # Merge small paragraphs
        if len(words) < min_words:
            buffer_words.extend(words)

            if len(buffer_words) >= max_words:
                for sub in _split_long_paragraph(buffer_words, max_words):
                    chunks.append({
                        "page": page_number,
                        "text": sub.strip()
                    })
                buffer_words = []

        else:
            if buffer_words:
                combined = buffer_words + words
                if len(combined) <= max_words:
                    chunks.append({
                        "page": page_number,
                        "text": " ".join(combined).strip()
                    })
                else:
                    chunks.append({
                        "page": page_number,
                        "text": " ".join(buffer_words).strip()
                    })
                    chunks.append({
                        "page": page_number,
                        "text": " ".join(words).strip()
                    })
                buffer_words = []
            else:
                chunks.append({
                    "page": page_number,
                    "text": " ".join(words).strip()
                })

    if buffer_words:
        chunks.append({
            "page": page_number,
            "text": " ".join(buffer_words).strip()
        })

    return chunks


def chunk_text(
    text: str,
    min_words: int = 120,
    max_words: int = 500,
    clean_math: bool = False
) -> List[Dict]:
    """
    Universal textbook chunker.

    Works for:
    - Math textbooks
    - Physics textbooks
    - With or without page markers

    Parameters:
    - clean_math: set True for math textbook cleaning
    """

    if not text:
        return []

    if clean_math:
        text = clean_math_text(text)

    # Detect page markers
    pages = re.split(r"\[PAGE\s+(\d+)\]", text)

    chunks = []

    # If page markers exist
    if len(pages) > 2:
        for i in range(1, len(pages), 2):
            page_number = int(pages[i])
            page_text = pages[i + 1]

            page_chunks = _chunk_paragraphs(
                page_text,
                page_number,
                min_words,
                max_words
            )
            chunks.extend(page_chunks)

    else:
        # No page markers → treat entire text as page 0
        chunks = _chunk_paragraphs(
            text,
            0,
            min_words,
            max_words
        )

    # Final fallback (rare case)
    if not chunks:
        words = text.split()
        i = 0
        while i < len(words):
            part = words[i:i + max_words]
            chunks.append({
                "page": 0,
                "text": " ".join(part).strip()
            })
            i += max_words

    return chunks
