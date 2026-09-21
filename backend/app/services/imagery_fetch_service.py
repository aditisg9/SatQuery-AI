"""
ImageryFetchService
----------------------
Lets a user type a place name (or provide coordinates) and get back a real
satellite image for that location — no manual download from Bhuvan/
Copernicus/USGS required. This directly answers "what image do I show a
judge who names a random place" — you fetch it live, on the spot.

Two public, free, no-API-key services:
  - Nominatim (OpenStreetMap) — place name -> latitude/longitude
  - ESRI World Imagery tile service — the actual satellite/aerial tiles

Tiles are fetched in a small grid and stitched into one image. Because
tile coordinates map to an exact geographic bounding box (standard
Web Mercator slippy-map math), every fetched image gets REAL
georeferencing — the same downstream code path used for GeoTIFF uploads
(pixel_resolution_m, bounding box) works here too, with no GeoTIFF file
or GDAL involved at all.
"""
import io
import math
from dataclasses import dataclass
from typing import List, Optional

import numpy as np
import requests
from PIL import Image

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
PHOTON_URL = "https://photon.komoot.io/api/"
ESRI_TILE_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
TILE_SIZE = 256
DEFAULT_ZOOM = 15  # ~3km across — recognizable as a neighborhood/district, not just a few streets
GRID = 3  # 3x3 tiles stitched together
REQUEST_TIMEOUT = 8

# Nominatim's usage policy requires a descriptive User-Agent identifying the app.
HEADERS = {"User-Agent": "SatQueryAI/1.0 (SIH project; contact: satquery-ai@example.com)"}


@dataclass
class GeocodeResult:
    display_name: str
    lat: float
    lon: float


@dataclass
class FetchedImagery:
    png_bytes: bytes
    width: int
    height: int
    bbox_min_lon: float
    bbox_min_lat: float
    bbox_max_lon: float
    bbox_max_lat: float
    pixel_resolution_m: float
    zoom: int
    marker_x: float  # normalized 0-1 — exact horizontal position of the query point
    marker_y: float  # normalized 0-1 — exact vertical position of the query point


def geocode(query: str, limit: int = 5) -> List[GeocodeResult]:
    """
    Turn a place name into one or more candidate lat/lon matches, trying
    three layers in order of reliability:

      1. Bundled gazetteer (app/data/india_places.py) — zero network
         dependency, cannot fail or be blocked, but only covers ~60 major
         Indian places at city-level precision.
      2. Photon (komoot) — a public geocoder explicitly built and run for
         production traffic ("thousands of requests per minute"), worldwide
         coverage, no API key.
      3. Nominatim — kept as a last-resort attempt only. Its public demo
         server is documented to throttle/block programmatic access
         without warning, so it must never be the ONLY path.

    If all three fail, returns an empty list — the caller (and the UI)
    treats that as "not found," and the "Enter Coordinates" mode in the
    frontend remains a 100%-guaranteed, zero-dependency way to fetch any
    exact spot on Earth regardless of geocoding service availability.
    """
    from app.data.india_places import search_places

    bundled = search_places(query, limit=limit)
    if bundled:
        return [GeocodeResult(display_name=p["name"], lat=p["lat"], lon=p["lon"]) for p in bundled]

    photon_results = _try_photon(query, limit)
    if photon_results:
        return photon_results

    return _try_nominatim(query, limit)


def _try_photon(query: str, limit: int) -> List[GeocodeResult]:
    try:
        resp = requests.get(
            PHOTON_URL, params={"q": query, "limit": limit}, timeout=REQUEST_TIMEOUT
        )
        resp.raise_for_status()
        data = resp.json()
        results = []
        for feat in data.get("features", []):
            props = feat.get("properties", {})
            coords = feat.get("geometry", {}).get("coordinates")  # [lon, lat]
            if not coords or len(coords) != 2:
                continue
            name_parts = [
                props.get(k)
                for k in ("name", "city", "state", "country")
                if props.get(k)
            ]
            display_name = ", ".join(dict.fromkeys(name_parts)) or query
            results.append(GeocodeResult(display_name=display_name, lat=coords[1], lon=coords[0]))
        return results
    except Exception:
        return []


def _try_nominatim(query: str, limit: int) -> List[GeocodeResult]:
    try:
        resp = requests.get(
            NOMINATIM_URL,
            params={"q": query, "format": "json", "limit": limit},
            headers=HEADERS,
            timeout=REQUEST_TIMEOUT,
        )
        resp.raise_for_status()
        return [
            GeocodeResult(
                display_name=item.get("display_name", query),
                lat=float(item["lat"]),
                lon=float(item["lon"]),
            )
            for item in resp.json()
        ]
    except Exception:
        return []


def _lonlat_to_tile(lon: float, lat: float, zoom: int) -> tuple[int, int]:
    lat_rad = math.radians(lat)
    n = 2.0**zoom
    xtile = int((lon + 180.0) / 360.0 * n)
    ytile = int((1.0 - math.asinh(math.tan(lat_rad)) / math.pi) / 2.0 * n)
    return xtile, ytile


def _lonlat_to_tile_fractional(lon: float, lat: float, zoom: int) -> tuple[float, float]:
    """Same projection as _lonlat_to_tile but WITHOUT truncating to an
    integer tile index — this gives the exact sub-tile position needed to
    place a precise marker, rather than just which tile contains the point."""
    lat_rad = math.radians(lat)
    n = 2.0**zoom
    fx = (lon + 180.0) / 360.0 * n
    fy = (1.0 - math.asinh(math.tan(lat_rad)) / math.pi) / 2.0 * n
    return fx, fy


def _tile_to_lonlat(xtile: int, ytile: int, zoom: int) -> tuple[float, float]:
    n = 2.0**zoom
    lon = xtile / n * 360.0 - 180.0
    lat_rad = math.atan(math.sinh(math.pi * (1 - 2 * ytile / n)))
    lat = math.degrees(lat_rad)
    return lon, lat


def _resolution_m_per_pixel(lat: float, zoom: int) -> float:
    return 156543.03392 * math.cos(math.radians(lat)) / (2**zoom)


def fetch_satellite_image(
    lat: float, lon: float, zoom: int = DEFAULT_ZOOM, grid: int = GRID
) -> Optional[FetchedImagery]:
    """
    Fetch a grid of satellite tiles centered on (lat, lon) and stitch them
    into one image, with exact geographic bounds computed from tile math.
    Returns None if any tile fails to fetch (network issue, rate limit,
    etc.) — callers should treat that as "try again" rather than a bug.
    """
    center_x, center_y = _lonlat_to_tile(lon, lat, zoom)
    half = grid // 2
    x0, y0 = center_x - half, center_y - half

    canvas = Image.new("RGB", (TILE_SIZE * grid, TILE_SIZE * grid))
    try:
        for row in range(grid):
            for col in range(grid):
                tx, ty = x0 + col, y0 + row
                url = ESRI_TILE_URL.format(z=zoom, x=tx, y=ty)
                resp = requests.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT)
                resp.raise_for_status()
                tile_img = Image.open(io.BytesIO(resp.content)).convert("RGB")
                canvas.paste(tile_img, (col * TILE_SIZE, row * TILE_SIZE))
    except Exception:
        return None

    nw_lon, nw_lat = _tile_to_lonlat(x0, y0, zoom)
    se_lon, se_lat = _tile_to_lonlat(x0 + grid, y0 + grid, zoom)

    # Exact sub-pixel position of the query point within the stitched
    # canvas, normalized 0-1 — this is what lets the frontend draw a
    # precise Google-Maps-style pin instead of just "somewhere in this
    # general area."
    fx, fy = _lonlat_to_tile_fractional(lon, lat, zoom)
    marker_x = (fx - x0) / grid
    marker_y = (fy - y0) / grid

    buf = io.BytesIO()
    canvas.save(buf, format="PNG")

    return FetchedImagery(
        png_bytes=buf.getvalue(),
        width=canvas.width,
        height=canvas.height,
        bbox_min_lon=nw_lon,
        bbox_min_lat=se_lat,
        bbox_max_lon=se_lon,
        bbox_max_lat=nw_lat,
        pixel_resolution_m=_resolution_m_per_pixel(lat, zoom),
        zoom=zoom,
        marker_x=marker_x,
        marker_y=marker_y,
    )
