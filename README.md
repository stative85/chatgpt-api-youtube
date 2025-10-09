# websim.ai Discourse Analysis Prototype

This repository contains a **websim.ai-ready** implementation of the
"Codex Wet Dream" discourse analysis pipeline described in the project
blueprint.  The codebase organises ingestion utilities, modelling
components, analytical tooling, and a FastAPI deployment surface that can be
embedded in simulated environments.

## Features

- Transcript ingestion helpers for normalising raw conversation data.
- Naïve entity extraction and fact-checking triggers to build structured
  annotations.
- Ideology mapping utilities that learn custom axes from curated statements
  and project new speakers into the resulting space.
- Tension and audience-pressure detectors that surface moments of conflict and
  audience-host divergence.
- Overton window tracker for visualising how statements shift in public
  acceptability.
- FastAPI server exposing all primitives so `websim.ai` scenarios can call the
  models programmatically.

## Getting Started

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Normalise transcript data
python -m src.ingestion.transcript_parser \
  --input data/raw/transcript_full.json \
  --output data/processed/transcript_clean.json

# Extract entities and claims
python -m src.ingestion.entity_extractor \
  --input data/processed/transcript_clean.json \
  --output data/processed/entities.json
python -m src.ingestion.fact_checker \
  --input data/processed/transcript_clean.json \
  --output data/annotations/evidence_claims.json
```

With processed data in place you can launch the API:

```bash
export IDEOLOGY_AXES_PATH=data/processed/embeddings/ideology_axes.json
export ANTHROPIC_API_KEY=your_key
uvicorn src.deployment.api_server:app --reload
```

## Tests

```bash
pytest
```

The current test-suite focuses on ingestion helpers so they remain deterministic
inside the `websim.ai` environment.
