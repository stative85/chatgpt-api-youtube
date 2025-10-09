"""Heuristic tension detection between two chunks of dialogue."""

from __future__ import annotations

import importlib
from dataclasses import dataclass
from typing import Dict, Iterable, List


@dataclass
class TensionAnalysis:
    tension_score: float
    reconcilable: bool
    attack_score: float
    concession_score: float
    triggers: List[str]
    de_escalations: List[str]


class TensionDetector:
    """Flag tense conversational exchanges using lightweight heuristics."""

    def __init__(self) -> None:
        self._sentiment_pipeline = None
        self._sentiment_available = importlib.util.find_spec("transformers") is not None
        self.tension_keywords: Dict[str, List[str]] = {
            "high": ["disgusting", "traitor", "fed", "rat", "snake", "liar"],
            "medium": ["unfair", "disappointed", "skeptical", "dishonest"],
            "low": ["disagree", "different view", "push back"],
        }
        self.concession_phrases = [
            "you're right",
            "fair point",
            "i grant",
            "i concede",
            "good point",
            "thanks for acknowledging",
        ]

    @property
    def sentiment_pipeline(self):
        if not self._sentiment_available:
            return None
        if self._sentiment_pipeline is None:
            transformers = importlib.import_module("transformers")
            self._sentiment_pipeline = transformers.pipeline("sentiment-analysis")
        return self._sentiment_pipeline

    def _score_attacks(self, *segments: str) -> tuple[float, List[str]]:
        score = 0.0
        triggers: List[str] = []
        for level, keywords in self.tension_keywords.items():
            weight = {"high": 1.0, "medium": 0.5, "low": 0.2}[level]
            for segment in segments:
                lower_segment = segment.lower()
                for keyword in keywords:
                    if keyword in lower_segment:
                        score += weight
                        triggers.append(keyword)
        return score, triggers

    def _score_concessions(self, *segments: str) -> tuple[float, List[str]]:
        score = 0.0
        phrases: List[str] = []
        for segment in segments:
            lower_segment = segment.lower()
            for phrase in self.concession_phrases:
                if phrase in lower_segment:
                    score += 0.3
                    phrases.append(phrase)
        return score, phrases

    def analyze_exchange(self, speaker_a_text: str, speaker_b_text: str) -> TensionAnalysis:
        attack_score, triggers = self._score_attacks(speaker_a_text, speaker_b_text)
        concession_score, concessions = self._score_concessions(
            speaker_a_text, speaker_b_text
        )

        tension = max(0.0, min(1.0, attack_score - concession_score))
        reconcilable = tension < 0.6 and concession_score > 0

        return TensionAnalysis(
            tension_score=tension,
            reconcilable=reconcilable,
            attack_score=attack_score,
            concession_score=concession_score,
            triggers=triggers,
            de_escalations=concessions,
        )


__all__ = ["TensionDetector", "TensionAnalysis"]
