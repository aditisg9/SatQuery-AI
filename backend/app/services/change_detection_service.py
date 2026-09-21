"""
ChangeDetectionService
------------------------
Compares two SegmentationOutput class maps (same shape) and produces:
  - per-class before/after/delta percentages
  - a change-map image highlighting pixels whose class changed
  - a coarse category of what happened (e.g. "vegetation -> urban" growth)

Swap for a real siamese / temporal transformer change model later; the
contract (`ChangeOutput`) stays the same.
"""
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Dict, List

import numpy as np

from app.services.segmentation_service import CLASS_DEFS, CLASS_KEYS

CHANGE_COLOR = np.array([242, 70, 70], dtype=np.uint8)  # highlight color


@dataclass
class ChangeOutput:
    changed_mask: np.ndarray  # boolean HxW
    before_counts: Dict[str, int]
    after_counts: Dict[str, int]
    total_pixels: int
    changed_pixel_pct: float
    transitions: List[dict] = field(default_factory=list)  # top from->to transitions

    def change_map_rgb(self, base_rgb: np.ndarray, alpha: float = 0.6) -> np.ndarray:
        out = base_rgb.astype(np.float32).copy()
        m = self.changed_mask
        out[m] = out[m] * (1 - alpha) + CHANGE_COLOR.astype(np.float32) * alpha
        return out.astype(np.uint8)


class ChangeDetectionService(ABC):
    @abstractmethod
    def compare(self, mask_before: np.ndarray, mask_after: np.ndarray) -> ChangeOutput: ...


class MaskDiffChangeDetectionService(ChangeDetectionService):
    def compare(self, mask_before: np.ndarray, mask_after: np.ndarray) -> ChangeOutput:
        assert mask_before.shape == mask_after.shape, "before/after masks must be co-registered to the same shape"
        changed = mask_before != mask_after
        total = int(mask_before.size)

        before_counts = {k: int(np.sum(mask_before == i)) for i, k in enumerate(CLASS_KEYS)}
        after_counts = {k: int(np.sum(mask_after == i)) for i, k in enumerate(CLASS_KEYS)}

        # Top transitions (e.g. vegetation -> urban), ignoring "other"->"other" noise
        trans_counts: Dict[tuple, int] = {}
        flat_before = mask_before[changed]
        flat_after = mask_after[changed]
        for bi, ai in zip(flat_before.tolist(), flat_after.tolist()):
            key = (bi, ai)
            trans_counts[key] = trans_counts.get(key, 0) + 1

        top = sorted(trans_counts.items(), key=lambda kv: kv[1], reverse=True)[:5]
        transitions = [
            {
                "from": CLASS_KEYS[bi],
                "to": CLASS_KEYS[ai],
                "pixel_count": cnt,
                "pixel_percentage": round(100 * cnt / total, 2),
            }
            for (bi, ai), cnt in top
            if cnt > 0
        ]

        return ChangeOutput(
            changed_mask=changed,
            before_counts=before_counts,
            after_counts=after_counts,
            total_pixels=total,
            changed_pixel_pct=round(100 * float(np.sum(changed)) / total, 2),
            transitions=transitions,
        )


_instance: ChangeDetectionService | None = None


def get_change_detection_service() -> ChangeDetectionService:
    global _instance
    if _instance is None:
        _instance = MaskDiffChangeDetectionService()
    return _instance
