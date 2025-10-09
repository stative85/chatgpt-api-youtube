from src.ingestion.transcript_parser import parse_transcript


def test_parse_transcript_normalizes_segments():
    raw = {
        "segments": [
            {"speaker": "A", "timestamp": 1.2, "text": "Hello"},
            {"speaker": "B", "timestamp": 2.5, "text": "Hi there"},
        ]
    }
    normalized = parse_transcript(raw)
    assert normalized["segments"][0]["speaker"] == "A"
    assert normalized["segments"][1]["text"] == "Hi there"
