import json
from pathlib import Path
from typing import List, Dict, Any, Tuple

import numpy as np
from dotenv import load_dotenv
from openai import OpenAI

import faiss
from rank_bm25 import BM25Okapi

# -----------------------------
# Utilities
# -----------------------------

def l2_normalize(vectors: np.ndarray) -> np.ndarray:
    norms = np.linalg.norm(vectors, axis=1, keepdims=True)
    norms = np.maximum(norms, 1e-12)
    return vectors / norms


def simple_tokenize(text: str) -> List[str]:
    import re
    return [t for t in re.split(r"[^a-zA-Z0-9']+", text.lower()) if t]


def load_metadata(meta_path: str) -> List[Dict[str, Any]]:
    with open(meta_path, "r", encoding="utf-8") as f:
        return json.load(f)


def load_bm25_tokens(tokens_path: str) -> List[List[str]]:
    with open(tokens_path, "r", encoding="utf-8") as f:
        return json.load(f)


def embed_query_openai(query: str, model: str = "text-embedding-3-small") -> np.ndarray:
    client = OpenAI()
    resp = client.embeddings.create(model=model, input=[query])
    vec = np.array([resp.data[0].embedding], dtype=np.float32)
    return vec


# -----------------------------
# Search functions
# -----------------------------

def vector_search(
    index: faiss.Index,
    meta: List[Dict[str, Any]],
    query: str,
    top_k: int = 5,
    embedding_model: str = "text-embedding-3-small"
) -> List[Dict[str, Any]]:
    q = embed_query_openai(query, model=embedding_model)
    q = l2_normalize(q)

    scores, ids = index.search(q, top_k)  # ids are row numbers into metadata

    results = []
    for score, idx in zip(scores[0], ids[0]):
        if idx == -1:
            continue
        item = meta[idx]
        results.append({
            "score": float(score),
            "chunk_id": item["chunk_id"],
            "page_start": item["page_start"],
            "page_end": item["page_end"],
            "text": item["text"],
        })
    return results


def bm25_search(
    bm25: BM25Okapi,
    meta: List[Dict[str, Any]],
    query: str,
    top_k: int = 5
) -> List[Dict[str, Any]]:
    q_tokens = simple_tokenize(query)
    scores = bm25.get_scores(q_tokens)

    # get top_k indices by score
    top_idx = np.argsort(scores)[::-1][:top_k]

    results = []
    for idx in top_idx:
        results.append({
            "score": float(scores[idx]),
            "chunk_id": meta[idx]["chunk_id"],
            "page_start": meta[idx]["page_start"],
            "page_end": meta[idx]["page_end"],
            "text": meta[idx]["text"],
        })
    return results


def hybrid_search(
    index: faiss.Index,
    bm25: BM25Okapi,
    meta: List[Dict[str, Any]],
    query: str,
    top_k: int = 5,
    embedding_model: str = "text-embedding-3-small",
    alpha: float = 0.6
) -> List[Dict[str, Any]]:
    """
    Combine vector + BM25 scores.

    alpha controls weighting:
      alpha=0.6 means 60% vector, 40% BM25.

    We:
    - get vector top N
    - get BM25 top N
    - merge candidates
    - normalize scores
    - compute combined score
    """
    N = max(25, top_k * 5)

    v = vector_search(index, meta, query, top_k=N, embedding_model=embedding_model)
    b = bm25_search(bm25, meta, query, top_k=N)

    # build maps from chunk_id -> score
    v_map = {r["chunk_id"]: r["score"] for r in v}
    b_map = {r["chunk_id"]: r["score"] for r in b}

    # candidate set
    candidates = set(v_map.keys()) | set(b_map.keys())

    # normalize to 0..1 for fair combination
    v_scores = np.array(list(v_map.values()), dtype=np.float32)
    b_scores = np.array(list(b_map.values()), dtype=np.float32)

    v_min, v_max = float(v_scores.min()) if len(v_scores) else 0.0, float(v_scores.max()) if len(v_scores) else 1.0
    b_min, b_max = float(b_scores.min()) if len(b_scores) else 0.0, float(b_scores.max()) if len(b_scores) else 1.0

    def norm(s: float, mn: float, mx: float) -> float:
        if mx - mn < 1e-9:
            return 0.0
        return (s - mn) / (mx - mn)

    # quick lookup for meta by chunk_id
    meta_by_id = {m["chunk_id"]: m for m in meta}

    merged = []
    for cid in candidates:
        vs = norm(v_map.get(cid, v_min), v_min, v_max)
        bs = norm(b_map.get(cid, b_min), b_min, b_max)
        combined = alpha * vs + (1 - alpha) * bs

        m = meta_by_id[cid]
        merged.append({
            "score": float(combined),
            "chunk_id": cid,
            "page_start": m["page_start"],
            "page_end": m["page_end"],
            "text": m["text"],
        })

    merged.sort(key=lambda x: x["score"], reverse=True)
    return merged[:top_k]


# -----------------------------
# Run interactive test
# -----------------------------

if __name__ == "__main__":
    load_dotenv()

    INDEX_DIR = Path("index")
    FAISS_PATH = str(INDEX_DIR / "chunks.faiss")
    META_PATH = str(INDEX_DIR / "chunks_meta.json")
    BM25_TOKENS_PATH = str(INDEX_DIR / "bm25_tokens.json")

    EMBEDDING_MODEL = "text-embedding-3-small"

    # Load index + metadata
    index = faiss.read_index(FAISS_PATH)
    meta = load_metadata(META_PATH)

    # Build BM25 from saved tokens
    tokenized = load_bm25_tokens(BM25_TOKENS_PATH)
    bm25 = BM25Okapi(tokenized)

    print("Ready. Type a query (or 'quit').\n")

    while True:
        q = input("Query> ").strip()
        if q.lower() in {"quit", "exit"}:
            break

        print("\n--- Vector results ---")
        for r in vector_search(index, meta, q, top_k=3, embedding_model=EMBEDDING_MODEL):
            print(f"[{r['score']:.3f}] {r['chunk_id']} p.{r['page_start']}-{r['page_end']}")
            print(r["text"][:250] + "...\n")

        print("--- BM25 results ---")
        for r in bm25_search(bm25, meta, q, top_k=3):
            print(f"[{r['score']:.3f}] {r['chunk_id']} p.{r['page_start']}-{r['page_end']}")
            print(r["text"][:250] + "...\n")

        print("--- Hybrid results ---")
        for r in hybrid_search(index, bm25, meta, q, top_k=3, embedding_model=EMBEDDING_MODEL, alpha=0.6):
            print(f"[{r['score']:.3f}] {r['chunk_id']} p.{r['page_start']}-{r['page_end']}")
            print(r["text"][:250] + "...\n")
