import io
import logging

import docx
import fitz
from fastapi import HTTPException, UploadFile

logger = logging.getLogger(__name__)


class FileParser:
    """Service class to handle multiple file formats and extract raw text."""

    @staticmethod
    async def process_upload(file: UploadFile) -> str:
        filename = (file.filename or "").lower()
        content = await file.read()

        logger.info("Processing file: %s, Size: %s bytes", filename, len(content))

        try:
            if filename.endswith(".pdf"):
                return FileParser._extract_pdf(content)
            if filename.endswith(".docx"):
                return FileParser._extract_docx(content)
            if filename.endswith((".txt", ".md")):
                return content.decode("utf-8")
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type: {filename.split('.')[-1]}",
            )
        except HTTPException:
            raise
        except Exception as exc:
            logger.error("Error parsing file %s: %s", filename, exc)
            raise HTTPException(status_code=500, detail="Failed to parse file content.")

    @staticmethod
    def _extract_pdf(file_bytes: bytes) -> str:
        text_accum: list[str] = []
        try:
            with fitz.open(stream=file_bytes, filetype="pdf") as doc:
                for page in doc:
                    text_accum.append(page.get_text())
            return "\n".join(text_accum)
        except Exception as exc:
            raise ValueError(f"Corrupt PDF: {exc}")

    @staticmethod
    def _extract_docx(file_bytes: bytes) -> str:
        try:
            doc = docx.Document(io.BytesIO(file_bytes))
            return "\n".join([para.text for para in doc.paragraphs])
        except Exception as exc:
            raise ValueError(f"Corrupt DOCX: {exc}")
