from src.schemas.suno import SongPackage


def validate_package(package: SongPackage) -> None:
    if not package.formatted_lyrics.strip():
        raise ValueError("Formatted lyrics cannot be empty.")
