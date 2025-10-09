from src.ingestion.fact_checker import collect_claims


def test_collect_claims_flags_text_with_triggers():
    transcript = {
        "segments": [
            {"speaker": "Dave", "timestamp": 5, "text": "According to reports, aid increased."},
            {"speaker": "Nick", "timestamp": 7, "text": "Opinionated statement."},
        ]
    }
    claims = collect_claims(transcript)
    assert len(claims) == 1
    assert claims[0]["speaker"] == "Dave"
