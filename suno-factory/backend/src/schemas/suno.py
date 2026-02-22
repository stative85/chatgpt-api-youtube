from typing import List
from pydantic import BaseModel, Field, constr, field_validator
from src.schemas.common import SongSection


class LyricSegment(BaseModel):
    """A single structural unit of a song."""

    section_type: SongSection = Field(
        ..., description="The structural role of this segment (e.g., Verse, Chorus)."
    )
    tags: List[str] = Field(
        default_factory=list,
        description="Performance metatags like [Female Vocals], [Choir], [Spoken Word].",
    )
    lyrics: str = Field(
        ..., description="The lyrical content. Must be empty for Instrumental sections."
    )

    @field_validator("lyrics")
    @classmethod
    def validate_lyrics_content(cls, value: str) -> str:
        if "[" in value and "]" in value:
            return value
        return value


class VisualPrompt(BaseModel):
    """Prompts for external image generation tools."""

    midjourney: str = Field(
        ..., description="Midjourney prompt following Subject + Style + Context."
    )
    stable_diffusion: str = Field(
        ..., description="Comma-separated keyword list for Stable Diffusion."
    )
    negative_prompt: str = Field(
        default="text, watermark, blurry, distorted, low quality",
        description="Negative embeddings to ensure quality.",
    )


class SongMetadata(BaseModel):
    """Technical metadata for the Suno API."""

    title: constr(max_length=100) = Field(
        ..., description="Song title. Max 100 chars."
    )
    style_tags: constr(max_length=1000) = Field(
        ..., description="Comma-separated list of genres and instruments."
    )
    instrumental: bool = Field(
        default=False, description="If true, lyrics are ignored."
    )


class SongPackage(BaseModel):
    """The master payload object."""

    id: str = Field(..., description="Unique Task ID")
    metadata: SongMetadata
    structure: List[LyricSegment]
    visuals: VisualPrompt
    formatted_lyrics: str = Field(
        ..., description="Concatenated lyrics with correctly placed tags."
    )

    @field_validator("formatted_lyrics")
    @classmethod
    def check_length(cls, value: str) -> str:
        if len(value) > 3000:
            raise ValueError(
                "Total lyric length exceeds safe limit of 3000 characters."
            )
        return value
