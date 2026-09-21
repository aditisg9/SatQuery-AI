"""
Central application configuration.

Everything that toggles between DEMO_MODE (fully mocked, offline, no GPU)
and LIVE mode (Gemini-backed vision-language reasoning) lives here.

Note: there is no filesystem/storage config here on purpose. All binary
data (uploads, thumbnails, generated overlays) lives in the database via
the `assets` table, so the app has zero persistent-disk dependency — this
is what makes it deployable on Render's free web service tier, which does
not support attached disks.
"""
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # App mode
    DEMO_MODE: bool = True

    # Gemini
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.0-flash"

    # Database
    DATABASE_URL: str = "sqlite:///./satquery.db"

    # CORS
    FRONTEND_ORIGIN: str = "http://localhost:3000"

    APP_NAME: str = "SatQuery AI"
    APP_VERSION: str = "1.0.0"

    @property
    def uses_gemini(self) -> bool:
        """Whether the app should actually call the Gemini API."""
        return (not self.DEMO_MODE) and bool(self.GEMINI_API_KEY)


@lru_cache
def get_settings() -> Settings:
    return Settings()
