import json
import os
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import List, Dict, Any, Tuple

import numpy as np
from tqdm import tqdm
from dotenv import load_dotenv

import faiss
from rank_bm25 import BM25Okapi

from openai import OpenAI


# -----------------------------
# Data structures
# -----------------------------

@dataclass
class ChunkRecord:
    chunk_id: str
    page_start: int
    page_end: int
    text: str
    token_count: int


# -----------------------------
# Load chunks.jsonl
# -----------------------------

def load_chunks_jsonl(path: str) -> List[ChunkRecord]:
    chunks: List[ChunkRecord] = []
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            obj = json.loads(line)
            chunks.append(
                ChunkRecord(
                    chunk_id=obj["chunk_id"],
                    page_start=int(obj["page_start"]),
                    page_end=int(obj["page_end"]),
                    text=str(obj["text"]),
                    token_count=int(obj.get("token_count", 0)),
                )
            )
    return chunks


# -----------------------------
# Embeddings (OpenAI)
# -----------------------------

def embed_texts_openai(texts: List[str], model: str = "text-embedding-3-small") -> np.ndarray:
    """
    Turns a list of strings into a 2D numpy array of embeddings:
      shape = (num_texts, embedding_dim)
    """
    client = OpenAI()

    embeddings: List[List[float]] = []

    # Batch embeddings for speed (OpenAI supports batching)
    # We'll do a safe batch size for beginners.
    BATCH_SIZE = 64

    for i in tqdm(range(0, len(texts), BATCH_SIZE), desc="Embedding chunks"):
        batch = texts[i:i + BATCH_SIZE]
        resp = client.embeddings.create(model=model, input=batch)
        batch_vectors = [item.embedding for item in resp.data]
        embeddings.extend(batch_vectors)

    arr = np.array(embeddings, dtype=np.float32)
    return arr


def l2_normalize(vectors: np.ndarray) -> np.ndarray:
    """
    Normalization makes cosine similarity work properly.
    After normalization:
      cosine_similarity(a, b) == dot(a, b)
    """
    norms = np.linalg.norm(vectors, axis=1, keepdims=True)
    norms = np.maximum(norms, 1e-12)
    return vectors / norms


# -----------------------------
# Vector index (FAISS)
# -----------------------------

def build_faiss_index(embeddings: np.ndarray) -> faiss.Index:
    """
    Builds a FAISS index for fast nearest-neighbor search.
    We'll use IndexFlatIP (inner product) + normalized vectors => cosine similarity.
    """
    dim = embeddings.shape[1]
    index = faiss.IndexFlatIP(dim)  # IP = inner product
    index.add(embeddings)          # add vectors to the index
    return index


# -----------------------------
# Keyword index (BM25)
# -----------------------------

def simple_tokenize(text: str) -> List[str]:
    """
    Beginner tokenizer:
    - lowercase
    - split on non-letters/numbers
    This is good enough for BM25.
    """
    import re
    return [t for t in re.split(r"[^a-zA-Z0-9']+", text.lower()) if t]


def build_bm25_index(chunks: List[ChunkRecord]) -> Tuple[BM25Okapi, List[List[str]]]:
    tokenized_corpus = [simple_tokenize(ch.text) for ch in tqdm(chunks, desc="Tokenizing for BM25")]
    bm25 = BM25Okapi(tokenized_corpus)
    return bm25, tokenized_corpus


# -----------------------------
# Save/load artifacts
# -----------------------------

def save_metadata(chunks: List[ChunkRecord], out_path: str) -> None:
    data = [asdict(ch) for ch in chunks]
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def save_bm25_tokens(tokenized_corpus: List[List[str]], out_path: str) -> None:
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(tokenized_corpus, f, ensure_ascii=False)


# -----------------------------
# Main build
# -----------------------------

if __name__ == "__main__":
    load_dotenv()  # loads OPENAI_API_KEY from .env

    CHUNKS_PATH = "../ingest/output/chunks.jsonl"
    INDEX_DIR = Path("index")

    INDEX_DIR.mkdir(parents=True, exist_ok=True)

    # Output files
    FAISS_PATH = str(INDEX_DIR / "chunks.faiss")
    META_PATH = str(INDEX_DIR / "chunks_meta.json")
    BM25_TOKENS_PATH = str(INDEX_DIR / "bm25_tokens.json")

    EMBEDDING_MODEL = "text-embedding-3-small"

    # 1) Load chunks
    chunks = load_chunks_jsonl(CHUNKS_PATH)
    print(f"Loaded {len(chunks)} chunks.")

    # 2) Build embeddings
    texts = [c.text for c in chunks]
    emb = embed_texts_openai(texts, model=EMBEDDING_MODEL)

    # 3) Normalize + build FAISS
    emb = l2_normalize(emb)
    index = build_faiss_index(emb)

    # 4) Build BM25 (optional, but we’ll build it)
    bm25, tokenized = build_bm25_index(chunks)

    # 5) Save artifacts
    faiss.write_index(index, FAISS_PATH)
    save_metadata(chunks, META_PATH)
    save_bm25_tokens(tokenized, BM25_TOKENS_PATH)

    print("\nDone! Saved:")
    print(f"- FAISS index:   {FAISS_PATH}")
    print(f"- Metadata:      {META_PATH}")
    print(f"- BM25 tokens:   {BM25_TOKENS_PATH}")
