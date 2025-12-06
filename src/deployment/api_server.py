"""FastAPI server exposing the discourse analysis primitives."""

from __future__ import annotations

import os
from typing import Dict, List

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from src.analysis.overton_shift import OvertonTracker
from src.analysis.audience_pressure import AudiencePressureAnalyzer
from src.models.ideology_mapper import IdeologyMapper
from src.models.tension_detector import TensionDetector
from src.models.reconciliation_engine import ReconciliationEngine


class SpeakerProfile(BaseModel):
    name: str
    quotes: List[str]


class IdeologyResponse(BaseModel):
    speaker: str
    positions: Dict[str, float]


class ReconciliationRequest(BaseModel):
    speaker_a: Dict[str, List[str] | str]
    speaker_b: Dict[str, List[str] | str]
    shared_goals: List[str]
    tensions: List[str]


app = FastAPI(title="websim.ai Discourse Analysis API")


@app.get("/health")
async def health() -> Dict[str, str]:
    """Simple health check endpoint for orchestration probes."""
    return {"status": "ok"}


@app.post("/analyze/ideology", response_model=IdeologyResponse)
async def map_ideology(profile: SpeakerProfile) -> IdeologyResponse:
    mapper = IdeologyMapper()
    axes_path = os.getenv("IDEOLOGY_AXES_PATH")
    if axes_path and os.path.exists(axes_path):
        mapper.load_axes(axes_path)
    if not mapper.axes:
        raise HTTPException(status_code=500, detail="No ideology axes configured.")
    positions = mapper.map_speaker(profile.quotes)
    return IdeologyResponse(speaker=profile.name, positions=positions)


@app.post("/tension/detect")
async def detect_tension(payload: Dict[str, str]) -> Dict[str, object]:
    speaker_a = payload.get("speaker_a", "")
    speaker_b = payload.get("speaker_b", "")
    if not speaker_a or not speaker_b:
        raise HTTPException(status_code=400, detail="Both speaker_a and speaker_b text required.")
    detector = TensionDetector()
    result = detector.analyze_exchange(speaker_a, speaker_b)
    return result.__dict__


@app.post("/audience/pressure")
async def audience_pressure(payload: Dict[str, List[str]]) -> Dict[str, object]:
    host_statements = payload.get("host_statements", [])
    audience_comments = payload.get("audience_comments", [])
    if not host_statements or not audience_comments:
        raise HTTPException(status_code=400, detail="host_statements and audience_comments required.")
    analyzer = AudiencePressureAnalyzer()
    report = analyzer.measure_divergence(host_statements, audience_comments)
    return report.__dict__


@app.post("/reconciliation/generate")
async def generate_reconciliation(request: ReconciliationRequest) -> Dict[str, object]:
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="ANTHROPIC_API_KEY environment variable is required.")
    engine = ReconciliationEngine(api_key=api_key)
    framework = engine.generate_framework(
        speaker_a=request.speaker_a,
        speaker_b=request.speaker_b,
        shared_goals=request.shared_goals,
        key_tensions=request.tensions,
    )
    return framework


@app.get("/overton/track/{topic}")
async def track_overton(topic: str) -> Dict[str, object]:
    tracker = OvertonTracker()
    storage_path = os.getenv("OVERTON_DATA_PATH")
    if storage_path and os.path.exists(storage_path):
        tracker.load(storage_path)
    if not tracker.timeline:
        raise HTTPException(status_code=404, detail="No Overton timeline data available.")
    figure = tracker.plot_shift(topic)
    return {"topic": topic, "figure": figure.to_json()}


__all__ = ["app"]
