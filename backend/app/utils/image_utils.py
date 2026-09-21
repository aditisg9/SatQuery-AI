"""
Image I/O helpers shared by every CV/geospatial service — all operating
on in-memory bytes, never touching disk. This is deliberate: it means the
whole app has zero filesystem/persistent-disk dependency, which is what
lets it run on Render's free web service tier (no disk support there).

GeoTIFF support is optional: if `rasterio` is not installed the app keeps
working perfectly for JPG/PNG, it simply reports `has_geo_metadata=False`.
"""
import io
from pathlib import PurePosixPath
from typing import Optional

import numpy as np
from PIL import Image

THUMBNAIL_SIZE = (480, 480)
MAX_ANALYSIS_DIM = 1024  # downscale huge images before CV/mock analysis


def _is_geotiff_name(filename: str) -> bool:
    return PurePosixPath(filename.lower()).suffix in (".tif", ".tiff")


def load_as_rgb_array(data: bytes, filename: str) -> np.ndarray:
    """Load any supported raster (given its raw bytes) as an HxWx3 uint8 array.

    Three-tier fallback for GeoTIFF, most-capable first:
      1. rasterio (via MemoryFile) — reads pixels AND georeferencing
      2. tifffile — reads pixels only, no CRS, but robust against GDAL-style
         multi-band/16-bit TIFFs that PIL's basic TIFF plugin can't decode
      3. PIL — final catch-all, and the only path for JPG/PNG
    Any failure at one tier (missing package, runtime error, unsupported
    tag structure) falls through to the next rather than crashing the
    upload — a working image beats a hard 400 error.
    """
    if _is_geotiff_name(filename):
        geo = _try_read_geotiff_pixels(data)
        if geo is not None:
            return geo
        tiff_fallback = _try_read_tifffile_pixels(data)
        if tiff_fallback is not None:
            return tiff_fallback
    with Image.open(io.BytesIO(data)) as im:
        im = im.convert("RGB")
        return np.array(im)


def make_thumbnail_bytes(data: bytes, filename: str) -> bytes:
    arr = load_as_rgb_array(data, filename)
    im = Image.fromarray(arr)
    im.thumbnail(THUMBNAIL_SIZE)
    buf = io.BytesIO()
    im.save(buf, format="PNG")
    return buf.getvalue()


def basic_metadata(data: bytes, filename: str) -> dict:
    arr = load_as_rgb_array(data, filename)
    h, w = arr.shape[:2]
    return {
        "width": int(w),
        "height": int(h),
        "file_size_bytes": len(data),
    }


def downscaled_for_analysis(arr: np.ndarray) -> np.ndarray:
    h, w = arr.shape[:2]
    scale = min(1.0, MAX_ANALYSIS_DIM / max(h, w))
    if scale >= 1.0:
        return arr
    im = Image.fromarray(arr).resize((int(w * scale), int(h * scale)), Image.BILINEAR)
    return np.array(im)


def try_read_red_nir_bands(data: bytes, filename: str) -> Optional[tuple]:
    """
    If this GeoTIFF has 4+ bands, return the RAW (not contrast-stretched)
    Red and NIR bands as float arrays, for real NDVI computation.

    NDVI needs the actual reflectance ratio between bands — the display
    RGB used elsewhere in this app is deliberately contrast-stretched for
    visibility, which destroys that ratio, so it cannot be reused here.

    Band convention: assumes a common 4-band stack ordering where band 4
    is near-infrared (true for many standard multispectral exports, e.g.
    QGIS/GDAL RGB+NIR composites). This is a documented assumption, not a
    guarantee — non-standard band orderings would need remapping. Returns
    None for anything that isn't a readable 4+-band GeoTIFF.
    """
    if not _is_geotiff_name(filename):
        return None
    try:
        import rasterio  # type: ignore
        from rasterio.io import MemoryFile  # type: ignore
    except Exception:
        return None
    try:
        with MemoryFile(data) as memfile:
            with memfile.open() as src:
                if src.count < 4:
                    return None
                red = src.read(1).astype(np.float32)  # band 1 = Red, matching this app's RGB-reader convention
                nir = src.read(4).astype(np.float32)  # band 4 = NIR, the common 4th band in RGB+NIR stacks
                return red, nir
    except Exception:
        return None


def _try_read_geotiff_pixels(data: bytes) -> Optional[np.ndarray]:
    """Return an RGB array if this is a GeoTIFF rasterio can open, else None."""
    try:
        import rasterio  # type: ignore
        from rasterio.io import MemoryFile  # type: ignore
    except Exception:
        # Broad on purpose: catches ModuleNotFoundError, but also any
        # runtime import failure (e.g. a broken GDAL shared-library load
        # on a specific host) that isn't a plain ImportError.
        return None
    try:
        with MemoryFile(data) as memfile:
            with memfile.open() as src:
                count = min(src.count, 3)
                bands = src.read(list(range(1, count + 1)))
                if count == 1:
                    bands = np.repeat(bands, 3, axis=0)
                arr = np.transpose(bands, (1, 2, 0))
                return _normalize_to_uint8(arr)
    except Exception:
        return None


def _try_read_tifffile_pixels(data: bytes) -> Optional[np.ndarray]:
    """
    Pixel-only fallback for GeoTIFF using `tifffile` (no georeferencing,
    but far more robust than PIL against GDAL-style 16-bit/multi-band
    TIFFs). Used when rasterio is unavailable or fails to open the file —
    the upload still succeeds, just without CRS/area stats.
    """
    try:
        import tifffile  # type: ignore
    except Exception:
        return None
    try:
        arr = tifffile.imread(io.BytesIO(data))
        if arr.ndim == 2:
            arr = np.stack([arr] * 3, axis=-1)
        elif arr.shape[-1] > 3:
            arr = arr[..., :3]
        elif arr.shape[-1] == 1:
            arr = np.repeat(arr, 3, axis=-1)
        return _normalize_to_uint8(arr)
    except Exception:
        return None


def read_geotiff_metadata(data: bytes, filename: str) -> dict:
    """Best-effort CRS / bounding-box / resolution extraction. Never raises."""
    result = {
        "has_geo_metadata": False,
        "crs": None,
        "bbox_min_lon": None,
        "bbox_min_lat": None,
        "bbox_max_lon": None,
        "bbox_max_lat": None,
        "pixel_resolution_m": None,
        "acquisition_date": None,
    }
    if not _is_geotiff_name(filename):
        return result
    try:
        import rasterio  # type: ignore
        from rasterio.io import MemoryFile  # type: ignore
        from rasterio.warp import transform_bounds  # type: ignore
    except Exception:
        return result
    try:
        with MemoryFile(data) as memfile:
            with memfile.open() as src:
                if src.crs is None:
                    return result
                bounds = src.bounds
                try:
                    left, bottom, right, top = transform_bounds(src.crs, "EPSG:4326", *bounds)
                except Exception:
                    left, bottom, right, top = bounds
                result.update(
                    has_geo_metadata=True,
                    crs=str(src.crs),
                    bbox_min_lon=float(left),
                    bbox_min_lat=float(bottom),
                    bbox_max_lon=float(right),
                    bbox_max_lat=float(top),
                    pixel_resolution_m=float(abs(src.res[0])) if src.res else None,
                )
    except Exception:
        return result
    return result


def _normalize_to_uint8(arr: np.ndarray) -> np.ndarray:
    arr = arr.astype(np.float32)
    lo, hi = np.percentile(arr, 2), np.percentile(arr, 98)
    if hi <= lo:
        hi = lo + 1
    arr = np.clip((arr - lo) / (hi - lo), 0, 1) * 255
    return arr.astype(np.uint8)


def array_to_png_bytes(arr: np.ndarray) -> bytes:
    buf = io.BytesIO()
    Image.fromarray(arr.astype(np.uint8)).save(buf, format="PNG")
    return buf.getvalue()
