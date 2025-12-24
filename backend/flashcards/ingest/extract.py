import json
import re
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import List, Dict, Any, Tuple

import fitz  # type: ignore # PyMuPDF
from tqdm import tqdm


# ---------- Data model ----------

@dataclass
class PageData:
    page_number: int          # human-friendly (starts at 1)
    text: str                 # cleaned full-page text
    char_count: int
    blocks: List[Dict[str, Any]]  # optional: block-level structure


# ---------- Cleaning helpers ----------

def normalize_whitespace(text: str) -> str:
    """
    Beginner-friendly cleaning:
    - normalize line endings
    - remove trailing spaces on lines
    - collapse excessive blank lines
    """
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = "\n".join(line.rstrip() for line in text.split("\n"))

    # Collapse 3+ newlines into 2 newlines
    text = re.sub(r"\n{3,}", "\n\n", text)

    return text.strip()


def fix_hyphenation(text: str) -> str:
    """
    Fix a common textbook artifact:
      'inter-\\nnational' -> 'international'

    Rule:
    - if a line ends with '-' and the next line starts with a letter,
      remove the hyphen + newline.
    """
    return re.sub(r"(\w)-\n(\w)", r"\1\2", text)


def basic_clean(text: str) -> str:
    """
    Apply safe, minimal cleaning steps in a sensible order.
    """
    text = normalize_whitespace(text)
    text = fix_hyphenation(text)
    text = normalize_whitespace(text)  # run again after edits
    return text


# ---------- Extraction helpers ----------

def extract_page_text(doc: fitz.Document, page_index: int) -> str:
    """
    Extract full-page text in a simple mode.
    """
    page = doc.load_page(page_index)
    return page.get_text("text")  # simplest readable extraction


def extract_page_blocks(doc: fitz.Document, page_index: int) -> List[Dict[str, Any]]:
    """
    Extract text blocks with bounding boxes.
    This helps later if you want to:
    - detect headers/footers
    - detect multi-column layout
    - preserve reading order more accurately
    """
    page = doc.load_page(page_index)
    raw_blocks = page.get_text("blocks")

    blocks: List[Dict[str, Any]] = []
    for b in raw_blocks:
        # PyMuPDF "blocks" tuple format:
        # (x0, y0, x1, y1, "text", block_no, block_type)
        x0, y0, x1, y1, txt, block_no, block_type = b
        blocks.append({
            "bbox": [x0, y0, x1, y1],
            "text": basic_clean(txt),
            "block_no": int(block_no),
            "block_type": int(block_type),
        })

    # Sort by top-to-bottom then left-to-right to approximate reading order
    blocks.sort(key=lambda blk: (blk["bbox"][1], blk["bbox"][0]))
    return blocks


# ---------- Main pipeline ----------

def ingest_pdf(pdf_path: str, skip_first_pages: int = 0) -> List[PageData]:
    doc = fitz.open(pdf_path)
    pages: List[PageData] = []

    start_index = skip_first_pages  # 0-based
    for page_index in tqdm(range(start_index, doc.page_count), desc="Extracting pages"):
        raw_text = extract_page_text(doc, page_index)
        cleaned_text = basic_clean(raw_text)

        blocks = extract_page_blocks(doc, page_index)

        pages.append(
            PageData(
                page_number=page_index + 1,   # still keeps real page numbers
                text=cleaned_text,
                char_count=len(cleaned_text),
                blocks=blocks,
            )
        )

    doc.close()
    return pages



def save_outputs(pages: List[PageData], out_dir: str) -> None:
    out_path = Path(out_dir)
    out_path.mkdir(parents=True, exist_ok=True)

    # JSON for downstream chunking / embeddings
    json_path = out_path / "pages.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump([asdict(p) for p in pages], f, ensure_ascii=False, indent=2)

    # Human-readable text file for spot-checking
    txt_path = out_path / "pages.txt"
    with open(txt_path, "w", encoding="utf-8") as f:
        for p in pages:
            f.write(f"\n\n===== PAGE {p.page_number} =====\n\n")
            f.write(p.text)
            f.write("\n")

    print("\nSaved:")
    print(f"- {json_path}")
    print(f"- {txt_path}")


if __name__ == "__main__":
    PDF_PATH = "data/fortyHadiths.pdf"  # <-- rename your file to match this
    OUT_DIR = "output"

    if not Path(PDF_PATH).exists():
        raise FileNotFoundError(f"PDF not found at: {PDF_PATH}")

    pages = ingest_pdf(PDF_PATH, skip_first_pages=3)
    save_outputs(pages, OUT_DIR)
