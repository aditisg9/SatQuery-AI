from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import desc
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.image import SatelliteImage
from app.models.user import User, RoleEnum
from app.schemas.user import UserOut, AdminUserUpdate
from app.api.deps import require_admin
from app.utils.time_utils import utc_iso

router = APIRouter(prefix="/api/admin", tags=["admin"], dependencies=[Depends(require_admin)])

@router.get("/users", response_model=List[UserOut])
def list_users(db: Session = Depends(get_db)):
    return db.query(User).all()

@router.patch("/users/{user_id}/role", response_model=UserOut)
def update_user_role(user_id: str, data: AdminUserUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if data.role is not None:
        if user.id == current_user.id and data.role != RoleEnum.ADMIN:
            raise HTTPException(status_code=400, detail="Cannot remove your own admin privileges")
        user.role = data.role
    
    if data.is_active is not None:
        if user.id == current_user.id and not data.is_active:
            raise HTTPException(status_code=400, detail="Cannot deactivate yourself")
        user.is_active = data.is_active
        
    db.commit()
    db.refresh(user)
    return user

@router.get("/images")
def list_all_images(db: Session = Depends(get_db)):
    records = db.query(SatelliteImage).order_by(desc(SatelliteImage.created_at)).limit(200).all()
    return [
        {
            "id": r.id,
            "filename": r.filename,
            "thumbnail_url": f"/api/assets/{r.thumbnail_asset_id}" if r.thumbnail_asset_id else None,
            "source": r.source or "upload",
            "place_name": r.place_name,
            "query_lat": r.query_lat,
            "query_lon": r.query_lon,
            "has_geo_metadata": bool(r.has_geo_metadata),
            "width": r.width,
            "height": r.height,
            "file_size_bytes": r.file_size_bytes,
            "created_at": utc_iso(r.created_at),
        }
        for r in records
    ]


@router.get("/stats")
def admin_stats(db: Session = Depends(get_db)):
    total = db.query(SatelliteImage).count()
    fetched = db.query(SatelliteImage).filter(SatelliteImage.source == "fetched").count()
    uploaded = total - fetched
    georeferenced = db.query(SatelliteImage).filter(SatelliteImage.has_geo_metadata == 1).count()
    return {
        "total_images": total,
        "uploaded_count": uploaded,
        "fetched_count": fetched,
        "georeferenced_count": georeferenced,
    }
