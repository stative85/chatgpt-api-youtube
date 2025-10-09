"""Overton window tracking utilities."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Iterable, List, Sequence

import pandas as pd
import plotly.graph_objects as go


@dataclass
class OvertonEvent:
    date: datetime
    statement: str
    platform: str
    reaction: str
    consequence: str
    score: float


@dataclass
class OvertonTracker:
    timeline: List[OvertonEvent] = field(default_factory=list)

    CONSEQUENCE_SCORES = {
        "deplatformed": -1.0,
        "coordinated_attack": -0.7,
        "controversy": -0.3,
        "debate": 0.0,
        "tepid_agreement": 0.3,
        "mainstream_adoption": 0.7,
        "consensus": 1.0,
    }

    def add_event(
        self,
        date: str | datetime,
        statement: str,
        platform: str,
        reaction: str,
        consequence: str,
    ) -> None:
        parsed_date = pd.to_datetime(date)
        score = self.CONSEQUENCE_SCORES.get(consequence, 0.0)
        self.timeline.append(
            OvertonEvent(
                date=parsed_date,
                statement=statement,
                platform=platform,
                reaction=reaction,
                consequence=consequence,
                score=score,
            )
        )

    def to_frame(self) -> pd.DataFrame:
        return pd.DataFrame([
            {
                "date": event.date,
                "statement": event.statement,
                "platform": event.platform,
                "reaction": event.reaction,
                "consequence": event.consequence,
                "overton_score": event.score,
            }
            for event in self.timeline
        ])

    def plot_shift(self, topic: str) -> go.Figure:
        frame = self.to_frame()
        mask = frame["statement"].str.contains(topic, case=False, na=False)
        topic_frame = frame.loc[mask].sort_values("date")
        fig = go.Figure()
        fig.add_trace(
            go.Scatter(
                x=topic_frame["date"],
                y=topic_frame["overton_score"],
                mode="lines+markers",
                text=topic_frame["statement"],
                hovertemplate="%{text}<br>%{x|%Y-%m-%d}: %{y}",
                name=topic,
            )
        )
        fig.update_layout(
            title=f"Overton Window Shift: {topic}",
            xaxis_title="Date",
            yaxis_title="Acceptability (-1 = taboo, 1 = consensus)",
            hovermode="closest",
        )
        return fig

    def save(self, path: str | Path) -> None:
        frame = self.to_frame()
        frame.to_json(path, orient="records", date_format="iso")

    def load(self, path: str | Path) -> None:
        frame = pd.read_json(path)
        self.timeline = [
            OvertonEvent(
                date=pd.to_datetime(row["date"]),
                statement=row["statement"],
                platform=row["platform"],
                reaction=row["reaction"],
                consequence=row["consequence"],
                score=float(row["overton_score"]),
            )
            for row in frame.to_dict(orient="records")
        ]


__all__ = ["OvertonTracker", "OvertonEvent"]
