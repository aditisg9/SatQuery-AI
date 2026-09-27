import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, Float, Integer, String

from app.database import Base


def gen_id() -> str:
    return uuid.uuid4().hex[:16]


class SatelliteImage(Base):
    __tablename__ = "satellite_images"

    id = Column(String, primary_key=True, default=gen_id)
    user_id = Column(String, nullable=True)
    filename = Column(String, nullable=False)

    # References into the `assets` table (binary data lives there, not on
    # disk) — this is what makes the app deployable on Render's free web
    # service tier, which has no persistent disk.
    asset_id = Column(String, nullable=False)
    thumbnail_asset_id = Column(String, nullable=True)
    content_type = Column(String, nullable=True)

    # "upload" (user picked a file) or "fetched" (auto-fetched by place
    # name / coordinates via ImageryFetchService). Lets the admin view
    # distinguish how each image entered the system.
    source = Column(String, default="upload")
    place_name = Column(String, nullable=True)
    query_lat = Column(Float, nullable=True)
    query_lon = Column(Float, nullable=True)
    marker_x = Column(Float, nullable=True)  # normalized 0-1 position within the image
    marker_y = Column(Float, nullable=True)

    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    file_size_bytes = Column(Integer, nullable=True)

    # Geospatial metadata (populated when available, e.g. GeoTIFF)
    has_geo_metadata = Column(Integer, default=0)  # 0/1 boolean for sqlite compat
    crs = Column(String, nullable=True)
    bbox_min_lon = Column(Float, nullable=True)
    bbox_min_lat = Column(Float, nullable=True)
    bbox_max_lon = Column(Float, nullable=True)
    bbox_max_lat = Column(Float, nullable=True)
    pixel_resolution_m = Column(Float, nullable=True)
    acquisition_date = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
