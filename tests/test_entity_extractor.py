from src.ingestion.entity_extractor import extract_entities


def test_extract_entities_identifies_proper_nouns():
    transcript = {
        "segments": [
            {"text": "Dave debated Nick Fuentes."},
            {"text": "Nick joined Dave on stage in Austin."},
        ]
    }
    entities = extract_entities(transcript)
    assert entities["Dave"] == 2
    assert "Austin" in entities
