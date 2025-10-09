"""Placeholder fact-checking module that flags statements with citations."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Dict, List


def collect_claims(transcript: Dict[str, object]) -> List[Dict[str, str]]:
    claims: List[Dict[str, str]] = []
    for segment in transcript.get("segments", []):
        text = segment.get("text", "")
        if any(trigger in text.lower() for trigger in ("according to", "reports", "study")):
            claims.append(
                {
                    "speaker": segment.get("speaker", "unknown"),
                    "timestamp": segment.get("timestamp", 0.0),
                    "claim": text,
                }
            )
    return claims


def main() -> None:
    parser = argparse.ArgumentParser(description="Extract fact-checkable claims")
    parser.add_argument("--input", required=True)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()

    transcript = json.loads(Path(args.input).read_text())
    claims = collect_claims(transcript)
    Path(args.output).write_text(json.dumps(claims, indent=2))


if __name__ == "__main__":  # pragma: no cover
    main()
