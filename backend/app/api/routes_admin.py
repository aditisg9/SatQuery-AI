from fastapi import APIRouter, Depends
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.image import SatelliteImage
from app.utils.time_utils import utc_iso

router = APIRouter(prefix="/api/admin", tags=["admin"])


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
