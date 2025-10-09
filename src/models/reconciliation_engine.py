"""Interface to Anthropics' API for generating reconciliation frameworks."""

from __future__ import annotations

import importlib
import json
from dataclasses import dataclass
from typing import Dict, Iterable, List, Mapping


if importlib.util.find_spec("anthropic") is None:  # pragma: no cover - explicit error
    raise ImportError("The 'anthropic' package is required for ReconciliationEngine.")

from anthropic import Anthropic


@dataclass
class SpeakerProfile:
    name: str
    positions: List[str]
    grievances_with_other: List[str]
    red_lines: List[str]

    @classmethod
    def from_mapping(cls, payload: Mapping[str, Iterable[str]]) -> "SpeakerProfile":
        return cls(
            name=str(payload.get("name", "")),
            positions=list(payload.get("positions", [])),
            grievances_with_other=list(payload.get("grievances_with_other", [])),
            red_lines=list(payload.get("red_lines", [])),
        )


class ReconciliationEngine:
    def __init__(self, api_key: str, model: str = "claude-3-sonnet-20240229") -> None:
        self.client = Anthropic(api_key=api_key)
        self.model = model

    def generate_framework(
        self,
        speaker_a: Mapping[str, Iterable[str]] | SpeakerProfile,
        speaker_b: Mapping[str, Iterable[str]] | SpeakerProfile,
        shared_goals: Iterable[str],
        key_tensions: Iterable[str],
        max_tokens: int = 2000,
    ) -> Dict[str, object]:
        profile_a = (
            speaker_a
            if isinstance(speaker_a, SpeakerProfile)
            else SpeakerProfile.from_mapping(speaker_a)
        )
        profile_b = (
            speaker_b
            if isinstance(speaker_b, SpeakerProfile)
            else SpeakerProfile.from_mapping(speaker_b)
        )

        prompt = self._build_prompt(profile_a, profile_b, shared_goals, key_tensions)
        message = self.client.messages.create(
            model=self.model,
            max_tokens=max_tokens,
            messages=[{"role": "user", "content": prompt}],
        )
        content = message.content[0].text
        return json.loads(content)

    def _build_prompt(
        self,
        speaker_a: SpeakerProfile,
        speaker_b: SpeakerProfile,
        shared_goals: Iterable[str],
        key_tensions: Iterable[str],
    ) -> str:
        goals_block = "\n- ".join([""] + list(shared_goals)) if shared_goals else "\n- (none)"
        tension_block = "\n- ".join([""] + list(key_tensions)) if key_tensions else "\n- (none)"
        return f"""You are a reconciliation architect for hostile political factions.

Speaker A ({speaker_a.name}):
  Positions: {speaker_a.positions}
  Grievances: {speaker_a.grievances_with_other}
  Red lines: {speaker_a.red_lines}

Speaker B ({speaker_b.name}):
  Positions: {speaker_b.positions}
  Grievances: {speaker_b.grievances_with_other}
  Red lines: {speaker_b.red_lines}

Shared goals:{goals_block}
Key tensions:{tension_block}

Return strictly valid JSON with keys:
  phase_1_acknowledgment,
  phase_2_boundaries,
  phase_3_trades,
  phase_4_coalition.
"""


__all__ = ["ReconciliationEngine", "SpeakerProfile"]
