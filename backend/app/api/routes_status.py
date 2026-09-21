from fastapi import APIRouter

from app.config import get_settings

router = APIRouter(prefix="/api", tags=["system"])

settings = get_settings()


@router.get("/status")
def status():
    return {
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "demo_mode": settings.DEMO_MODE,
        "gemini_configured": bool(settings.GEMINI_API_KEY),
        "vlm_backend": "gemini" if settings.uses_gemini else "mock",
    }
