from fastapi import APIRouter
from src.api.v1.endpoints.generate import router as generate_router
from src.api.v1.endpoints.ingest import router as ingest_router

api_router = APIRouter()
api_router.include_router(generate_router, tags=["generation"])
api_router.include_router(ingest_router, tags=["health"])
