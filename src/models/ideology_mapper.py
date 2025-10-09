"""Tools for mapping speakers into an N-dimensional ideological space."""

from __future__ import annotations

import argparse
import importlib
import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, Iterable, List, Mapping, MutableMapping

import numpy as np

if importlib.util.find_spec("sentence_transformers") is None:  # pragma: no cover - informative failure
    raise ImportError(
        "The 'sentence_transformers' package is required for IdeologyMapper."
    )

from sentence_transformers import SentenceTransformer  # noqa: E402  (import after validation)


@dataclass
class IdeologyAxis:
    """Represents a single ideological dimension."""

    name: str
    vector: np.ndarray
    positive_examples: List[str]
    negative_examples: List[str]

    def to_dict(self) -> Dict[str, object]:
        return {
            "name": self.name,
            "vector": self.vector.tolist(),
            "positive_examples": self.positive_examples,
            "negative_examples": self.negative_examples,
        }

    @classmethod
    def from_dict(cls, payload: Mapping[str, object]) -> "IdeologyAxis":
        return cls(
            name=str(payload["name"]),
            vector=np.asarray(payload["vector"], dtype=float),
            positive_examples=list(payload["positive_examples"]),
            negative_examples=list(payload["negative_examples"]),
        )


@dataclass
class IdeologyMapper:
    """Encode text and project it onto pre-defined ideological axes."""

    model_name: str = "all-MiniLM-L6-v2"
    _encoder: SentenceTransformer | None = field(default=None, init=False, repr=False)
    axes: MutableMapping[str, IdeologyAxis] = field(default_factory=dict)

    @property
    def encoder(self) -> SentenceTransformer:
        if self._encoder is None:
            self._encoder = SentenceTransformer(self.model_name)
        return self._encoder

    def add_axis(
        self,
        name: str,
        positive_examples: Iterable[str],
        negative_examples: Iterable[str],
    ) -> None:
        pos_list = list(positive_examples)
        neg_list = list(negative_examples)
        if not pos_list or not neg_list:
            raise ValueError("Positive and negative example collections must not be empty.")

        pos_emb = self.encoder.encode(pos_list).mean(axis=0)
        neg_emb = self.encoder.encode(neg_list).mean(axis=0)
        axis_vector = pos_emb - neg_emb
        norm = np.linalg.norm(axis_vector)
        if np.isclose(norm, 0.0):
            raise ValueError("Axis examples produce a zero vector; provide more distinctive samples.")

        axis = IdeologyAxis(
            name=name,
            vector=axis_vector / norm,
            positive_examples=pos_list,
            negative_examples=neg_list,
        )
        self.axes[name] = axis

    def load_axes(self, path: str | Path) -> None:
        payload = json.loads(Path(path).read_text())
        self.axes = {
            axis_payload["name"]: IdeologyAxis.from_dict(axis_payload)
            for axis_payload in payload
        }

    def save_axes(self, path: str | Path) -> None:
        Path(path).write_text(
            json.dumps([axis.to_dict() for axis in self.axes.values()], indent=2)
        )

    def map_speaker(self, quotes: Iterable[str]) -> Dict[str, float]:
        statements = list(quotes)
        if not statements:
            raise ValueError("At least one quote is required to map a speaker.")

        embedding = self.encoder.encode(statements).mean(axis=0)
        results: Dict[str, float] = {}
        for axis in self.axes.values():
            projection = float(np.dot(embedding, axis.vector))
            results[axis.name] = projection
        return results

    def compare_speakers(
        self, speaker_a_quotes: Iterable[str], speaker_b_quotes: Iterable[str]
    ) -> Dict[str, float]:
        a_map = self.map_speaker(speaker_a_quotes)
        b_map = self.map_speaker(speaker_b_quotes)
        return {
            axis: abs(a_map[axis] - b_map[axis]) for axis in self.axes.keys()
        }


def train_from_spec(data_path: str | Path, output_path: str | Path, model_name: str) -> None:
    spec = json.loads(Path(data_path).read_text())
    axes_spec = spec.get("axes", [])
    if not axes_spec:
        raise ValueError("Training specification must contain at least one axis definition under 'axes'.")

    mapper = IdeologyMapper(model_name=model_name)
    for axis in axes_spec:
        mapper.add_axis(
            axis["name"],
            axis["positive_examples"],
            axis["negative_examples"],
        )
    mapper.save_axes(output_path)


def main() -> None:  # pragma: no cover - CLI glue
    parser = argparse.ArgumentParser(description="Train ideology mapper from JSON spec")
    parser.add_argument("--train", action="store_true")
    parser.add_argument("--data", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--model-name", default="all-MiniLM-L6-v2")
    args = parser.parse_args()

    if not args.train:
        raise SystemExit("Only --train mode is currently supported.")
    train_from_spec(args.data, args.output, args.model_name)


__all__ = ["IdeologyAxis", "IdeologyMapper", "train_from_spec"]


if __name__ == "__main__":
    main()
