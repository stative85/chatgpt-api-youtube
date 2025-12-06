"""Expose the FastAPI app used by the Chrysalis Lattice deployment."""

from src.deployment.api_server import app as _app

app = _app

__all__ = ["app"]
