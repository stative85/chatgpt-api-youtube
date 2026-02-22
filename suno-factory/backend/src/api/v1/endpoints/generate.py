from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from src.services.parser import FileParser
from src.services.composer import ComposerService
from src.schemas.suno import SongPackage

router = APIRouter()


@router.post("/process", response_model=SongPackage)
async def generate_song_package(
    file: UploadFile = File(...),
    instructions: str | None = Form(None),
) -> SongPackage:
    """
    Upload -> Parse -> Compose -> Return JSON package.
    """
    try:
        raw_text = await FileParser.process_upload(file)
    except HTTPException as exc:
        raise exc
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    if not raw_text.strip():
        raise HTTPException(status_code=400, detail="Extracted text is empty.")

    service = ComposerService()
    try:
        return await service.transform_text_to_song(raw_text, instructions)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"AI Processing Error: {exc}")
