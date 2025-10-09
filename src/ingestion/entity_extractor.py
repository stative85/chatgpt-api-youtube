"""Extract naive entities from normalized transcripts."""

from __future__ import annotations

import argparse
import json
import re
from collections import Counter
from pathlib import Path
from typing import Dict


ENTITY_PATTERN = re.compile(r"\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b")


def extract_entities(transcript: Dict[str, object]) -> Dict[str, int]:
    counter: Counter[str] = Counter()
    for segment in transcript.get("segments", []):
        text = segment.get("text", "")
        for match in ENTITY_PATTERN.findall(text):
            counter[match] += 1
    return dict(counter)


def main() -> None:
    parser = argparse.ArgumentParser(description="Extract entities for websim.ai experiments")
    parser.add_argument("--input", required=True)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()

    transcript = json.loads(Path(args.input).read_text())
    entities = extract_entities(transcript)
    Path(args.output).write_text(json.dumps(entities, indent=2))


if __name__ == "__main__":  # pragma: no cover
    main()
