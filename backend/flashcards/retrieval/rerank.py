from typing import List, Dict, Any
from sentence_transformers import CrossEncoder


class CrossEncoderReranker:
    """
    Reranks retrieved chunks using a cross-encoder.
    Cross-encoders score (query, passage) pairs by reading both together.
    """

    def __init__(self, model_name: str = "cross-encoder/ms-marco-MiniLM-L-6-v2"):
        self.model = CrossEncoder(model_name)

    def rerank(
        self,
        query: str,
        candidates: List[Dict[str, Any]],
        text_key: str = "text",
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        candidates: list of dicts that must include:
          - candidates[i][text_key]  (the chunk text)
          - ideally chunk_id, page_start/page_end, etc.

        Returns the same dicts, but with:
          - added 'rerank_score'
          - sorted by rerank_score desc
          - truncated to top_k
        """
        if not candidates:
            return []

        pairs = [(query, c[text_key]) for c in candidates]
        scores = self.model.predict(pairs)  # higher = more relevant

        reranked = []
        for c, s in zip(candidates, scores):
            c2 = dict(c)
            c2["rerank_score"] = float(s)
            reranked.append(c2)

        reranked.sort(key=lambda x: x["rerank_score"], reverse=True)
        return reranked[:top_k]
