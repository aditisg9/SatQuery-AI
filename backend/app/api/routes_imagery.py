import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.image import SatelliteImage
from app.schemas.image import FetchImageryRequest, GeocodeMatch, GeoMetadata, ImageOut
from app.services import imagery_fetch_service as svc
from app.services import weather_service
from app.utils.asset_store import save_asset
from app.utils.image_utils import make_thumbnail_bytes
from app.api.deps import get_current_active_user
from app.models.user import User

router = APIRouter(prefix="/api/imagery", tags=["imagery"])
logger = logging.getLogger("satquery.imagery")


@router.get("/geocode", response_model=list[GeocodeMatch])
def geocode_place(q: str):
    if not q or len(q.strip()) < 2:
        raise HTTPException(400, "Enter at least 2 characters to search.")
    try:
        results = svc.geocode(q.strip())
    except Exception as e:
        # Log the REAL exception server-side (visible in the uvicorn
        # terminal) — the HTTP response stays friendly/generic on purpose,
        # but this is what actually tells us what broke.
        logger.exception("Geocoding failed for query=%r: %s", q, e)
        raise HTTPException(
            502, f"Could not reach the geocoding service right now: {type(e).__name__}: {e}"
        )
    if not results:
        raise HTTPException(404, f"No location found matching '{q}'. Try a more specific name.")
    return [GeocodeMatch(display_name=r.display_name, lat=r.lat, lon=r.lon) for r in results]


@router.get("/weather")
def get_weather(lat: float, lon: float):
    """
    Live current weather for a location — a real API call, deliberately
    kept separate from image analysis. A satellite image's pixels cannot
    tell you today's temperature; this is atmospheric data, not something
    derived from the fetched imagery.
    """
    weather = weather_service.get_current_weather(lat, lon)
    if weather is None:
        raise HTTPException(502, "Weather service is temporarily unavailable.")
    return {
        "temperature_c": weather.temperature_c,
        "humidity_percent": weather.humidity_percent,
        "wind_speed_kmh": weather.wind_speed_kmh,
        "precipitation_mm": weather.precipitation_mm,
        "condition": weather.condition,
        "is_day": weather.is_day,
    }


@router.post("/fetch", response_model=ImageOut)
def fetch_imagery(
    payload: FetchImageryRequest, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    zoom = payload.zoom if payload.zoom else svc.DEFAULT_ZOOM
    zoom = max(11, min(18, zoom))  # keep within a sane, always-fetchable range
    result = svc.fetch_satellite_image(payload.lat, payload.lon, zoom=zoom)
    if result is None:
        raise HTTPException(
            502,
            "Could not fetch satellite imagery for this location right now — the imagery "
            "service may be temporarily unavailable. Please try again.",
        )

    filename = f"{(payload.place_name or 'location').strip()[:60]}.png"
    thumb_bytes = make_thumbnail_bytes(result.png_bytes, filename)

    asset_id = save_asset(db, result.png_bytes, "image/png")
    thumb_asset_id = save_asset(db, thumb_bytes, "image/png")

    record = SatelliteImage(
        filename=filename,
        user_id=current_user.id,
        asset_id=asset_id,
        thumbnail_asset_id=thumb_asset_id,
        content_type="image/png",
        source="fetched",
        place_name=payload.place_name,
        query_lat=payload.lat,
        query_lon=payload.lon,
        marker_x=result.marker_x,
        marker_y=result.marker_y,
        width=result.width,
        height=result.height,
        file_size_bytes=len(result.png_bytes),
        has_geo_metadata=1,
        crs="EPSG:4326",
        bbox_min_lon=result.bbox_min_lon,
        bbox_min_lat=result.bbox_min_lat,
        bbox_max_lon=result.bbox_max_lon,
        bbox_max_lat=result.bbox_max_lat,
        pixel_resolution_m=result.pixel_resolution_m,
        acquisition_date=None,
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return ImageOut(
        id=record.id,
        filename=record.filename,
        url=f"/api/assets/{record.asset_id}",
        thumbnail_url=f"/api/assets/{record.thumbnail_asset_id}",
        width=record.width,
        height=record.height,
        file_size_bytes=record.file_size_bytes,
        source=record.source,
        place_name=record.place_name,
        marker_x=record.marker_x,
        marker_y=record.marker_y,
        query_lat=record.query_lat,
        query_lon=record.query_lon,
        geo=GeoMetadata(
            has_geo_metadata=True,
            crs=record.crs,
            bbox_min_lon=record.bbox_min_lon,
            bbox_min_lat=record.bbox_min_lat,
            bbox_max_lon=record.bbox_max_lon,
            bbox_max_lat=record.bbox_max_lat,
            pixel_resolution_m=record.pixel_resolution_m,
            acquisition_date=None,
        ),
    )
