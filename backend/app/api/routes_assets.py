from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.database import get_db
from app.utils.asset_store import get_asset

router = APIRouter(prefix="/api/assets", tags=["assets"])


@router.get("/{asset_id}")
def get_asset_file(asset_id: str, db: Session = Depends(get_db)):
    asset = get_asset(db, asset_id)
    if not asset:
        raise HTTPException(404, "Asset not found")
    return Response(
        content=asset.data,
        media_type=asset.content_type or "application/octet-stream",
        headers={"Cache-Control": "public, max-age=31536000, immutable"},
    )
