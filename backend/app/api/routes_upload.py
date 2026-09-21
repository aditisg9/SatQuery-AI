from fastapi import APIRouter, Depends, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.image import SatelliteImage
from app.schemas.image import GeoMetadata, ImageOut
from app.services.preprocessing import validate_upload
from app.utils.asset_store import save_asset
from app.utils.image_utils import basic_metadata, make_thumbnail_bytes, read_geotiff_metadata

router = APIRouter(prefix="/api/images", tags=["images"])


@router.post("/upload", response_model=ImageOut)
async def upload_image(file: UploadFile, db: Session = Depends(get_db)):
    content = await file.read()
    filename = file.filename or "upload.png"
    try:
        validate_upload(filename, file.content_type or "", len(content))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    try:
        meta = basic_metadata(content, filename)
    except Exception:
        raise HTTPException(status_code=400, detail="Could not read this file as an image.")

    geo_meta = read_geotiff_metadata(content, filename)

    try:
        thumb_bytes = make_thumbnail_bytes(content, filename)
    except Exception:
        thumb_bytes = None

    asset_id = save_asset(db, content, file.content_type or "application/octet-stream")
    thumb_asset_id = save_asset(db, thumb_bytes, "image/png") if thumb_bytes else None

    record = SatelliteImage(
        filename=filename,
        asset_id=asset_id,
        thumbnail_asset_id=thumb_asset_id,
        content_type=file.content_type,
        width=meta["width"],
        height=meta["height"],
        file_size_bytes=meta["file_size_bytes"],
        has_geo_metadata=1 if geo_meta["has_geo_metadata"] else 0,
        crs=geo_meta["crs"],
        bbox_min_lon=geo_meta["bbox_min_lon"],
        bbox_min_lat=geo_meta["bbox_min_lat"],
        bbox_max_lon=geo_meta["bbox_max_lon"],
        bbox_max_lat=geo_meta["bbox_max_lat"],
        pixel_resolution_m=geo_meta["pixel_resolution_m"],
        acquisition_date=geo_meta["acquisition_date"],
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return _to_out(record)


@router.get("/{image_id}", response_model=ImageOut)
def get_image(image_id: str, db: Session = Depends(get_db)):
    record = db.get(SatelliteImage, image_id)
    if not record:
        raise HTTPException(status_code=404, detail="Image not found")
    return _to_out(record)


def _to_out(record: SatelliteImage) -> ImageOut:
    return ImageOut(
        id=record.id,
        filename=record.filename,
        url=f"/api/assets/{record.asset_id}",
        thumbnail_url=f"/api/assets/{record.thumbnail_asset_id}" if record.thumbnail_asset_id else None,
        width=record.width,
        height=record.height,
        file_size_bytes=record.file_size_bytes,
        source=record.source or "upload",
        place_name=record.place_name,
        marker_x=record.marker_x,
        marker_y=record.marker_y,
        query_lat=record.query_lat,
        query_lon=record.query_lon,
        geo=GeoMetadata(
            has_geo_metadata=bool(record.has_geo_metadata),
            crs=record.crs,
            bbox_min_lon=record.bbox_min_lon,
            bbox_min_lat=record.bbox_min_lat,
            bbox_max_lon=record.bbox_max_lon,
            bbox_max_lat=record.bbox_max_lat,
            pixel_resolution_m=record.pixel_resolution_m,
            acquisition_date=record.acquisition_date,
        ),
    )
