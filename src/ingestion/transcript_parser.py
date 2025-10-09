"""Parse raw transcripts into a normalized JSON structure."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any, Dict, List


def parse_transcript(raw_data: Dict[str, Any]) -> Dict[str, Any]:
    segments = []
    for entry in raw_data.get("segments", []):
        segments.append(
            {
                "speaker": entry.get("speaker", "unknown"),
                "timestamp": entry.get("timestamp", 0.0),
                "text": entry.get("text", ""),
            }
        )
    return {"segments": segments}


def main() -> None:
    parser = argparse.ArgumentParser(description="Normalize transcript JSON for websim.ai")
    parser.add_argument("--input", required=True)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()

    raw = json.loads(Path(args.input).read_text())
    normalized = parse_transcript(raw)
    Path(args.output).write_text(json.dumps(normalized, indent=2))


if __name__ == "__main__":  # pragma: no cover
    main()
