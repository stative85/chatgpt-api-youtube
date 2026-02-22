# SunoForge Autonomous Song Production System

SunoForge is a production-ready pipeline that transforms raw creative text into **Suno-ready**
JSON song packages. It combines a FastAPI backend, a React + Shadcn UI frontend, and a CLI for
batch processing so teams can operate locally or deploy via Docker.

## Features

- **Strict schema contract** (Pydantic v2) to enforce Suno format/length limits.
- **Pluggable composer** service built on LangChain for structured output.
- **Multi-format ingestion**: PDF, DOCX, TXT, and Markdown.
- **Front-end dashboard** for review, copy, and export.
- **CLI batch processing** for power users.

## Quickstart (Local)

```bash
# Backend
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export OPENAI_API_KEY=your_key
uvicorn src.main:app --reload
```

```bash
# Frontend
cd frontend
npm install
npm run dev
```

## Docker

```bash
cp .env.example .env
docker compose up --build
```

## CLI

```bash
cd cli
python suno_cli.py ./samples -o ./output -i "Make it cinematic and melancholic"
```

## API

- `POST /api/v1/process` – Upload a file and receive a validated `SongPackage`.

## Repository Layout

```
backend/  # FastAPI, Pydantic schemas, LangChain composer
frontend/ # React + Shadcn UI
cli/      # Batch processing script
```
