"""Audience pressure analysis utilities tailored for websim.ai dashboards."""

from __future__ import annotations

import importlib
from dataclasses import dataclass
from typing import Iterable, List, Sequence

import numpy as np


if importlib.util.find_spec("sentence_transformers") is None:  # pragma: no cover
    raise ImportError("The 'sentence_transformers' package is required for AudiencePressureAnalyzer.")

from sentence_transformers import SentenceTransformer


@dataclass
class PressureReport:
    divergence_score: float
    audience_pull_direction: str
    audience_extreme_score: float
    host_extreme_score: float


class AudiencePressureAnalyzer:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2") -> None:
        self.encoder = SentenceTransformer(model_name)
        self.extreme_keywords = [
            "nazi",
            "kill",
            "war now",
            "all of them",
            "traitor",
        ]

    def _encode(self, sentences: Sequence[str]) -> np.ndarray:
        if not sentences:
            raise ValueError("At least one sentence is required for encoding.")
        return self.encoder.encode(list(sentences))

    def _extreme_score(self, sentences: Iterable[str]) -> float:
        sentences = list(sentences)
        if not sentences:
            return 0.0
        hits = 0
        for sentence in sentences:
            lower = sentence.lower()
            if any(keyword in lower for keyword in self.extreme_keywords):
                hits += 1
        return hits / len(sentences)

    def measure_divergence(
        self, host_statements: Sequence[str], audience_comments: Sequence[str]
    ) -> PressureReport:
        host_embeddings = self._encode(host_statements)
        audience_embeddings = self._encode(audience_comments)

        host_centroid = host_embeddings.mean(axis=0)
        audience_centroid = audience_embeddings.mean(axis=0)
        distance = np.linalg.norm(host_centroid - audience_centroid)

        host_extreme = self._extreme_score(host_statements)
        audience_extreme = self._extreme_score(audience_comments)
        direction = "more extreme" if audience_extreme > host_extreme else "more moderate"

        return PressureReport(
            divergence_score=min(distance / 10.0, 1.0),
            audience_pull_direction=direction,
            audience_extreme_score=audience_extreme,
            host_extreme_score=host_extreme,
        )


__all__ = ["AudiencePressureAnalyzer", "PressureReport"]
