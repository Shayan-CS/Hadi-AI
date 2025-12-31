import json
import re
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import List, Dict, Any, Callable, Optional
from tqdm import tqdm

try:
    import tiktoken
except ImportError:
    tiktoken = None


# -----------------------------
# Data structures
# -----------------------------

@dataclass
class Page:
    page_number: int
    text: str


@dataclass
class Chunk:
    chunk_id: str
    page_start: int
    page_end: int
    text: str
    token_count: int


# -----------------------------
# Load pages.json
# -----------------------------

def load_pages(pages_json_path: str) -> List[Page]:
    with open(pages_json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    pages = [Page(int(obj["page_number"]), str(obj["text"])) for obj in data]
    pages.sort(key=lambda p: p.page_number)
    return pages


# -----------------------------
# Token counting
# -----------------------------

def get_token_counter(model_name: str = "gpt-4o-mini") -> Callable[[str], int]:
    if tiktoken is None:
        # fallback approximation
        return lambda s: max(1, len(s) // 4)

    enc = tiktoken.encoding_for_model(model_name)
    return lambda s: len(enc.encode(s))


# -----------------------------
# Cleaning helpers
# -----------------------------

def replace_ligatures(text: str) -> str:
    ligatures = {"ﬁ": "fi", "ﬂ": "fl", "ﬀ": "ff", "ﬃ": "ffi", "ﬄ": "ffl"}
    for bad, good in ligatures.items():
        text = text.replace(bad, good)
    return text

def fix_false_paragraph_breaks(text: str) -> str:
    """
    Fix cases where a paragraph break appears mid-sentence.
    Example:
      "sallallahu\n\n'alayhi"  -> "sallallahu 'alayhi"
    Heuristic:
      If \n\n is between two word-like characters and the left side
      doesn't end with sentence punctuation, replace with space.
    """
    return re.sub(r"(?<![.!?:])\n\n(?=\S)", " ", text)


def normalize_line_endings(text: str) -> str:
    return text.replace("\r\n", "\n").replace("\r", "\n")


def fix_hyphenated_linebreaks(text: str) -> str:
    # inter-\nnational -> international
    return re.sub(r"(\w)-\n(\w)", r"\1\2", text)


def remove_page_markers(text: str) -> str:
    """
    Removes common printed-page markers like:
      "- 4 -" or "— 4 —" or "-4-"
    This is common in books.
    """
    lines = [ln.strip() for ln in text.split("\n")]
    cleaned = []
    for ln in lines:
        # match lines that are basically just "- 4 -" style markers
        if re.fullmatch(r"[-–—]?\s*\d+\s*[-–—]?", ln):
            continue
        cleaned.append(ln)
    return "\n".join(cleaned)


def collapse_blank_lines(text: str) -> str:
    return re.sub(r"\n{3,}", "\n\n", text).strip()


def join_wrapped_lines_keep_paragraphs(text: str) -> str:
    """
    Many PDFs wrap lines mid-sentence. We want to remove *single* newlines but keep paragraphs.

    Strategy:
    - convert paragraph breaks (double newline) to a placeholder
    - replace remaining single newlines with spaces
    - restore paragraph breaks
    """
    text = text.replace("\n\n", "<PARA>")
    text = text.replace("\n", " ")
    text = text.replace("<PARA>", "\n\n")
    return text


def normalize_spaces(text: str) -> str:
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r" *\n\n *", "\n\n", text)
    return text.strip()


def clean_page_text(text: str) -> str:
    """
    Safe cleaning pipeline for a real-text single-column book.
    """
    text = normalize_line_endings(text)
    text = replace_ligatures(text)
    text = fix_hyphenated_linebreaks(text)
    text = remove_page_markers(text)
    text = collapse_blank_lines(text)
    text = join_wrapped_lines_keep_paragraphs(text)
    text = fix_false_paragraph_breaks(text)  # <-- add this
    text = normalize_spaces(text)
    return text



# -----------------------------
# Header/Footer removal (simple + safe)
# -----------------------------

def detect_repeating_first_line(pages: List[Page], sample_n: int = 30, min_repeats: int = 8) -> Optional[str]:
    """
    Beginner-safe heuristic:
    - look at the first non-empty line of the first sample_n pages
    - if one line repeats often, treat it as a running header
    Returns the repeated header line, or None.
    """
    counts: Dict[str, int] = {}
    sample = pages[:min(sample_n, len(pages))]

    for p in sample:
        lines = [ln.strip() for ln in normalize_line_endings(p.text).split("\n") if ln.strip()]
        if not lines:
            continue
        first = lines[0]
        counts[first] = counts.get(first, 0) + 1

    # pick the most common line if it repeats enough
    best_line, best_count = None, 0
    for ln, c in counts.items():
        if c > best_count:
            best_line, best_count = ln, c

    if best_line and best_count >= min_repeats:
        return best_line
    return None


def remove_exact_header(text: str, header_line: Optional[str]) -> str:
    if not header_line:
        return text

    lines = normalize_line_endings(text).split("\n")
    cleaned_lines = []
    for ln in lines:
        if ln.strip() == header_line:
            continue
        cleaned_lines.append(ln)
    return "\n".join(cleaned_lines)


# -----------------------------
# Paragraph splitting
# -----------------------------

def split_into_paragraphs(text: str) -> List[str]:
    # after cleaning, paragraphs are separated by \n\n
    return [p.strip() for p in text.split("\n\n") if p.strip()]


# -----------------------------
# Chunking across pages (better than per-page)
# -----------------------------

def make_chunks_across_pages(
    pages: List[Page],
    count_tokens: Callable[[str], int],
    target_tokens: int = 450,
    max_tokens: int = 650,
    overlap_tokens: int = 80,
    skip_first_pages: int = 0
) -> List[Chunk]:
    """
    This is the key improvement:
    - we accumulate paragraphs across pages until we reach ~target_tokens
    - we never exceed max_tokens
    - we add optional overlap between chunks for continuity

    We track page_start and page_end properly.
    """
    usable_pages = [p for p in pages if p.page_number > skip_first_pages]

    # detect a running header (optional)
    header_line = detect_repeating_first_line(usable_pages)

    chunks: List[Chunk] = []
    buffer_parts: List[str] = []
    buffer_pages: List[int] = []

    chunk_index = 0

    def flush_buffer():
        nonlocal chunk_index, buffer_parts, buffer_pages

        if not buffer_parts:
            return

        text = "\n\n".join(buffer_parts).strip()
        if not text:
            buffer_parts, buffer_pages = [], []
            return

        chunk_index += 1
        chunk_id = f"textbook_c{chunk_index:05d}"
        token_count = count_tokens(text)

        chunks.append(
            Chunk(
                chunk_id=chunk_id,
                page_start=min(buffer_pages),
                page_end=max(buffer_pages),
                text=text,
                token_count=token_count,
            )
        )

        # Create overlap for next chunk
        if overlap_tokens > 0:
            # Take last ~overlap_tokens tokens worth of text (approx by trimming words)
            # Simple beginner approach: keep last N words
            words = text.split()
            # Rough guess: ~1.3 tokens per word (varies, but ok for overlap)
            keep_words = int(overlap_tokens / 1.3)
            overlap_text = " ".join(words[-keep_words:]) if keep_words > 0 else ""

            buffer_parts = [overlap_text] if overlap_text else []
            buffer_pages = [max(buffer_pages)] if overlap_text else []
        else:
            buffer_parts, buffer_pages = [], []

    for p in tqdm(usable_pages, desc="Cleaning + chunking"):
        raw = p.text

        # Remove exact running header if found
        raw = remove_exact_header(raw, header_line)

        cleaned = clean_page_text(raw)
        if len(cleaned) < 100:
            continue

        paragraphs = split_into_paragraphs(cleaned)

        for para in paragraphs:
            if not para:
                continue

            # If a single paragraph is huge, split it into sentences
            if count_tokens(para) > max_tokens:
                sentences = re.split(r"(?<=[.!?])\s+", para)
                for s in sentences:
                    s = s.strip()
                    if not s:
                        continue
                    # Treat each sentence like a mini paragraph
                    para_to_add = s
                    new_text = ("\n\n".join(buffer_parts + [para_to_add])).strip()

                    if count_tokens(new_text) > max_tokens:
                        flush_buffer()
                        buffer_parts.append(para_to_add)
                        buffer_pages.append(p.page_number)
                    else:
                        buffer_parts.append(para_to_add)
                        buffer_pages.append(p.page_number)

                    if count_tokens("\n\n".join(buffer_parts)) >= target_tokens:
                        flush_buffer()
                continue

            # Normal paragraph
            candidate_text = ("\n\n".join(buffer_parts + [para])).strip()

            if count_tokens(candidate_text) > max_tokens:
                flush_buffer()
                buffer_parts.append(para)
                buffer_pages.append(p.page_number)
            else:
                buffer_parts.append(para)
                buffer_pages.append(p.page_number)

            if count_tokens("\n\n".join(buffer_parts)) >= target_tokens:
                flush_buffer()

    flush_buffer()
    return chunks


def save_chunks_jsonl(chunks: List[Chunk], out_path: str) -> None:
    out_file = Path(out_path)
    out_file.parent.mkdir(parents=True, exist_ok=True)

    with open(out_file, "w", encoding="utf-8") as f:
        for ch in chunks:
            f.write(json.dumps(asdict(ch), ensure_ascii=False) + "\n")


# -----------------------------
# Run
# -----------------------------

if __name__ == "__main__":
    PAGES_JSON = "output/pages.json"
    OUT_CHUNKS = "output/chunks.jsonl"

    SKIP_FIRST_PAGES = 2  # you said first two pages are author/book info

    TARGET_TOKENS = 450
    MAX_TOKENS = 650
    OVERLAP_TOKENS = 40

    pages = load_pages(PAGES_JSON)
    count_tokens = get_token_counter("gpt-4o-mini")

    chunks = make_chunks_across_pages(
        pages=pages,
        count_tokens=count_tokens,
        target_tokens=TARGET_TOKENS,
        max_tokens=MAX_TOKENS,
        overlap_tokens=OVERLAP_TOKENS,
        skip_first_pages=SKIP_FIRST_PAGES
    )

    save_chunks_jsonl(chunks, OUT_CHUNKS)

    print("\nDone!")
    print(f"Pages loaded: {len(pages)}")
    print(f"Chunks saved: {len(chunks)}")
    print(f"Output: {OUT_CHUNKS}")
