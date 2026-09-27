from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.api.deps import get_current_active_user

from app.api import (
    routes_admin,
    routes_analyze,
    routes_assets,
    routes_imagery,
    routes_projects,
    routes_status,
    routes_upload,
    routes_auth,
)
from app.config import get_settings
from app.database import init_db

settings = get_settings()

app = FastAPI(title=settings.APP_NAME, version=settings.APP_VERSION)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN, "http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()


app.include_router(routes_upload.router, dependencies=[Depends(get_current_active_user)])
app.include_router(routes_analyze.router, dependencies=[Depends(get_current_active_user)])
app.include_router(routes_status.router)
app.include_router(routes_projects.router, dependencies=[Depends(get_current_active_user)])
app.include_router(routes_assets.router)
app.include_router(routes_imagery.router, dependencies=[Depends(get_current_active_user)])
app.include_router(routes_admin.router)
app.include_router(routes_auth.router)


@app.get("/")
def root():
    return {
        "app": settings.APP_NAME,
        "status": "running",
        "demo_mode": settings.DEMO_MODE,
        "docs": "/docs",
    }
