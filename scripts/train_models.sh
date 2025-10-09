#!/usr/bin/env bash
set -euo pipefail

echo "🚀 Starting discourse analysis training pipeline for websim.ai"

python -m src.ingestion.transcript_parser \
  --input data/raw/transcript_full.json \
  --output data/processed/transcript_clean.json

python -m src.ingestion.entity_extractor \
  --input data/processed/transcript_clean.json \
  --output data/processed/entities.json

python -m src.ingestion.fact_checker \
  --input data/processed/transcript_clean.json \
  --output data/annotations/evidence_claims.json

python -m src.models.ideology_mapper \
  --train \
  --data configs/ideology_axes_training.json \
  --output data/processed/embeddings/ideology_axes.json

echo "✅ Pipeline finished"
