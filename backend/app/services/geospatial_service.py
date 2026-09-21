"""
GeospatialService
-------------------
Turns pixel counts into hectares when (and only when) the source image
carries real georeferencing (pixel resolution in meters, from a GeoTIFF).
For plain JPG/PNG uploads with no geo metadata, only pixel percentages are
reported — the app never fabricates a geographic area it cannot support.
"""
from dataclasses import dataclass
from typing import Optional


@dataclass
class GeoContext:
    has_geo_metadata: bool = False
    pixel_resolution_m: Optional[float] = None


class GeospatialService:
    def pixel_count_to_hectares(self, pixel_count: int, geo: GeoContext) -> Optional[float]:
        if not geo.has_geo_metadata or not geo.pixel_resolution_m:
            return None
        m2_per_pixel = geo.pixel_resolution_m ** 2
        hectares = (pixel_count * m2_per_pixel) / 10_000
        return round(hectares, 2)

    def pixel_percentage(self, pixel_count: int, total_pixels: int) -> float:
        if total_pixels <= 0:
            return 0.0
        return round(100 * pixel_count / total_pixels, 2)


_instance: Optional[GeospatialService] = None


def get_geospatial_service() -> GeospatialService:
    global _instance
    if _instance is None:
        _instance = GeospatialService()
    return _instance
