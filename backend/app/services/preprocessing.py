"""
Preprocessing pipeline shared by both workflows.

Keeps the CV/geospatial services simple by guaranteeing they always receive
clean, same-shape, analysis-sized RGB arrays.
"""
from typing import Tuple

import numpy as np
from PIL import Image

from app.utils.image_utils import downscaled_for_analysis

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/tiff"}
MAX_UPLOAD_BYTES = 40 * 1024 * 1024  # 40 MB


def validate_upload(filename: str, content_type: str, size_bytes: int) -> None:
    ext = filename.lower().rsplit(".", 1)[-1] if "." in filename else ""
    if ext not in {"jpg", "jpeg", "png", "tif", "tiff"}:
        raise ValueError(f"Unsupported file type '.{ext}'. Use JPG, PNG, or GeoTIFF.")
    if size_bytes > MAX_UPLOAD_BYTES:
        raise ValueError("File too large (max 40 MB in this demo build).")


def prepare_for_analysis(arr: np.ndarray) -> np.ndarray:
    """Tile-safe downscale + contiguity, ready for CV/geo services."""
    arr = downscaled_for_analysis(arr)
    return np.ascontiguousarray(arr)


def coregister_pair(before: np.ndarray, after: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
    """
    Simple co-registration: resize both images to the smaller common shape.
    A production build would use feature-based (ORB/SIFT) or phase-correlation
    alignment; this keeps Workflow B fast and dependency-light for the demo.
    """
    h = min(before.shape[0], after.shape[0])
    w = min(before.shape[1], after.shape[1])
    b = np.array(Image.fromarray(before).resize((w, h), Image.BILINEAR))
    a = np.array(Image.fromarray(after).resize((w, h), Image.BILINEAR))
    return b, a
