from fastapi import FastAPI
from src.api.v1.router import api_router
from src.core.logging import configure_logging


def create_app() -> FastAPI:
    configure_logging()
    app = FastAPI(title="SunoForge API", version="0.1.0")
    app.include_router(api_router, prefix="/api/v1")
    return app


app = create_app()
