from typing import Optional

from pydantic import BaseModel


class GeoMetadata(BaseModel):
    has_geo_metadata: bool = False
    crs: Optional[str] = None
    bbox_min_lon: Optional[float] = None
    bbox_min_lat: Optional[float] = None
    bbox_max_lon: Optional[float] = None
    bbox_max_lat: Optional[float] = None
    pixel_resolution_m: Optional[float] = None
    acquisition_date: Optional[str] = None


class ImageOut(BaseModel):
    id: str
    filename: str
    url: str
    thumbnail_url: Optional[str] = None
    width: Optional[int] = None
    height: Optional[int] = None
    file_size_bytes: Optional[int] = None
    geo: GeoMetadata
    source: str = "upload"
    place_name: Optional[str] = None
    marker_x: Optional[float] = None
    marker_y: Optional[float] = None
    query_lat: Optional[float] = None
    query_lon: Optional[float] = None

    class Config:
        from_attributes = True


class GeocodeMatch(BaseModel):
    display_name: str
    lat: float
    lon: float


class FetchImageryRequest(BaseModel):
    lat: float
    lon: float
    place_name: Optional[str] = None
    zoom: Optional[int] = None
