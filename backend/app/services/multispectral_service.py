"""
MultispectralService
-----------------------
Computes NDVI (Normalized Difference Vegetation Index) — the standard,
globally-used remote-sensing formula for vegetation presence:

    NDVI = (NIR - Red) / (NIR + Red)

Values range -1 to 1; healthy vegetation typically reads above ~0.2-0.3.
This is real, textbook remote-sensing methodology — not a heuristic — and
is used automatically whenever a 4+ band GeoTIFF (with a usable NIR band)
is available, giving noticeably more scientifically-grounded vegetation
detection than the RGB color-threshold fallback used for plain JPG/PNG or
3-band imagery.
"""
import numpy as np
from PIL import Image

NDVI_VEGETATION_THRESHOLD = 0.2


def compute_ndvi(red: np.ndarray, nir: np.ndarray) -> np.ndarray:
    """Returns a float array of NDVI values, same shape as the input bands."""
    denom = nir + red
    denom = np.where(denom == 0, 1e-6, denom)  # avoid divide-by-zero on nodata pixels
    return (nir - red) / denom


def ndvi_vegetation_mask(
    red: np.ndarray, nir: np.ndarray, target_shape: tuple, threshold: float = NDVI_VEGETATION_THRESHOLD
) -> np.ndarray:
    """
    Boolean vegetation mask from raw Red/NIR bands, resized (nearest-
    neighbor, to preserve hard class boundaries) to match the analysis
    array's shape — raw bands are read at native resolution, which may
    differ from the (possibly downscaled) RGB array used elsewhere.
    """
    ndvi = compute_ndvi(red, nir)
    mask = ndvi > threshold
    if mask.shape != target_shape:
        mask_img = Image.fromarray(mask.astype(np.uint8) * 255)
        mask_img = mask_img.resize((target_shape[1], target_shape[0]), Image.NEAREST)
        mask = np.array(mask_img) > 0
    return mask
