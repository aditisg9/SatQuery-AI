"""
SegmentationService
--------------------
Produces a per-pixel land-cover class map plus class statistics.

The default implementation (`HeuristicSegmentationService`) is a real,
deterministic pixel-classification pipeline based on HSV color thresholds —
not random mock data. It is intentionally simple so the whole app runs
instantly on CPU with no model weights to download, while remaining a
genuine drop-in target for a trained deep-segmentation model later (see
`SegmentationService` ABC below).

To plug in a real model: implement `segment(rgb_array) -> SegmentationOutput`
against the same interface (e.g. wrapping a U-Net / SegFormer checkpoint)
and swap the instance returned by `get_segmentation_service()`.
"""
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Dict, List

import numpy as np
from PIL import Image

# Canonical land-cover classes used across the app.
CLASS_DEFS = [
    {"key": "water", "label": "Water", "color": "#3B82F6"},
    {"key": "vegetation", "label": "Vegetation", "color": "#22C55E"},
    {"key": "urban", "label": "Urban / Built-up", "color": "#F2A65A"},
    {"key": "bare_soil", "label": "Bare Soil / Agriculture", "color": "#C9A66B"},
    {"key": "other", "label": "Unclassified", "color": "#5B6B85"},
]
CLASS_KEYS = [c["key"] for c in CLASS_DEFS]
CLASS_COLOR_ARRAY = np.array(
    [
        [59, 130, 246],   # water
        [34, 197, 94],    # vegetation
        [242, 166, 90],   # urban
        [201, 166, 107],  # bare soil
        [91, 107, 133],   # other
    ],
    dtype=np.uint8,
)


@dataclass
class SegmentationOutput:
    class_mask: np.ndarray  # HxW int array, values index into CLASS_KEYS
    pixel_counts: Dict[str, int] = field(default_factory=dict)
    total_pixels: int = 0

    def overlay_rgb(self, base_rgb: np.ndarray, alpha: float = 0.45) -> np.ndarray:
        color_img = CLASS_COLOR_ARRAY[self.class_mask]
        base = base_rgb.astype(np.float32)
        blended = base * (1 - alpha) + color_img.astype(np.float32) * alpha
        return blended.astype(np.uint8)


class SegmentationService(ABC):
    @abstractmethod
    def segment(self, rgb_array: np.ndarray) -> SegmentationOutput: ...


class HeuristicSegmentationService(SegmentationService):
    def segment(self, rgb_array: np.ndarray) -> SegmentationOutput:
        hsv = np.array(Image.fromarray(rgb_array).convert("HSV"))
        h, s, v = hsv[..., 0].astype(np.int32), hsv[..., 1].astype(np.int32), hsv[..., 2].astype(np.int32)
        # PIL HSV: H in [0,255] maps to hue 0-360 -> divide by 255*360
        hue_deg = h * (360 / 255)

        water = (hue_deg >= 175) & (hue_deg <= 250) & (s > 40)
        vegetation = (hue_deg >= 60) & (hue_deg <= 170) & (s > 35) & (v > 25)
        urban = (s < 45) & (v > 70)
        bare_soil = (hue_deg >= 15) & (hue_deg < 60) & (s >= 25) & (~vegetation)

        mask = np.full(rgb_array.shape[:2], CLASS_KEYS.index("other"), dtype=np.int32)
        # Order matters: later assignments win on overlap, so put the most
        # visually distinctive / confident class last.
        mask[bare_soil] = CLASS_KEYS.index("bare_soil")
        mask[urban] = CLASS_KEYS.index("urban")
        mask[vegetation] = CLASS_KEYS.index("vegetation")
        mask[water] = CLASS_KEYS.index("water")

        total = int(mask.size)
        counts = {k: int(np.sum(mask == i)) for i, k in enumerate(CLASS_KEYS)}
        return SegmentationOutput(class_mask=mask, pixel_counts=counts, total_pixels=total)


_instance: SegmentationService | None = None


def get_segmentation_service() -> SegmentationService:
    global _instance
    if _instance is None:
        _instance = HeuristicSegmentationService()
    return _instance
