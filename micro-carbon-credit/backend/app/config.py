"""
Application configuration using pydantic-settings.
All settings are loaded from environment variables or .env file.
"""

from functools import lru_cache
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Central configuration for the Micro Carbon Credit API."""

    # ── Database ──────────────────────────────────────────────
    DATABASE_URL: str 

    # ── JWT / Auth ────────────────────────────────────────────
    SECRET_KEY: str = "change-me-in-production-to-a-random-256-bit-hex"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ── DISCOM Integration ────────────────────────────────────
    DISCOM_API_KEY: Optional[str] = None
    DISCOM_BASE_URL: Optional[str] = None

    # ── Application ───────────────────────────────────────────
    APP_ENV: str = "development"

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }


@lru_cache()
def get_settings() -> Settings:
    """Return a cached Settings instance so .env is read only once."""
    return Settings()
