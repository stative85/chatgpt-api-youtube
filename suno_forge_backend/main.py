from datetime import datetime
from typing import List, Optional
import uuid

from fastapi import APIRouter, FastAPI
from pydantic import BaseModel

app = FastAPI(title="SunoForge Backend")
api = APIRouter(prefix="/api")


class ProcessRequest(BaseModel):
    title: str
    lyrics: str
    artist: Optional[str] = "CleverSiteMusic"
    mood: Optional[str] = None
    style: Optional[str] = None
    tags: Optional[List[str]] = None


class PackagingResponse(BaseModel):
    job_id: str
    created_at: datetime
    title: str
    artist: str
    lyrics: str
    suno_prompt: str
    seo_keywords: List[str]
    youtube_title: str
    youtube_description: str


def build_suno_prompt(data: ProcessRequest) -> str:
    """Build a Suno prompt with no commas."""
    parts = [
        data.title,
        "full song",
        "studio quality",
        "strong vocals",
        "epic energy",
    ]
    if data.mood:
        parts.append(data.mood)
    if data.style:
        parts.append(data.style)
    if data.tags:
        parts.extend(data.tags)

    cleaned_words: List[str] = []
    for word in parts:
        if not word:
            continue
        cleaned_words.append(word.replace(",", " "))

    return " ".join(cleaned_words)


def build_seo_keywords(data: ProcessRequest) -> List[str]:
    keywords: List[str] = [
        data.title.lower(),
        "suno ai song",
        "cleversitemusic",
        "ai generated music",
        "original music",
    ]

    if data.mood:
        keywords.append(f"{data.mood.lower()} track")
    if data.style:
        keywords.append(f"{data.style.lower()} style")
    if data.tags:
        keywords.extend([tag.lower() for tag in data.tags])

    seen = set()
    deduped: List[str] = []
    for keyword in keywords:
        if keyword not in seen:
            seen.add(keyword)
            deduped.append(keyword)

    return deduped


def build_youtube_title(data: ProcessRequest) -> str:
    return f"{data.title} | {data.artist} | Suno AI Original"


def build_youtube_description(data: ProcessRequest, suno_prompt: str) -> str:
    lines = [
        f"Title: {data.title}",
        f"Artist: {data.artist}",
        "",
        "Lyrics:",
        data.lyrics,
        "",
        "Suno prompt used:",
        suno_prompt,
        "",
        "Generated with Suno AI and packaged by SunoForge backend.",
    ]
    return "\n".join(lines)


@api.get("/health")
def health() -> dict:
    return {"status": "ok"}


@api.post("/process", response_model=PackagingResponse)
def process_song(payload: ProcessRequest) -> PackagingResponse:
    suno_prompt = build_suno_prompt(payload)
    seo_keywords = build_seo_keywords(payload)

    return PackagingResponse(
        job_id=str(uuid.uuid4()),
        created_at=datetime.utcnow(),
        title=payload.title,
        artist=payload.artist or "CleverSiteMusic",
        lyrics=payload.lyrics,
        suno_prompt=suno_prompt,
        seo_keywords=seo_keywords,
        youtube_title=build_youtube_title(payload),
        youtube_description=build_youtube_description(payload, suno_prompt),
    )


app.include_router(api)
