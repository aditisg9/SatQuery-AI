"""
ObjectDetectionService
-----------------------
Derives bounding boxes for discrete objects (buildings, road segments) from
the land-cover class mask using connected-component / blob analysis
(skimage.measure). This is a real, deterministic CV step — compact,
low-eccentricity blobs in the "urban" class are reported as buildings;
elongated ones are reported as roads.

Swap `get_object_detection_service()` for a wrapper around a trained
detector (e.g. YOLO / Faster R-CNN fine-tuned on xView/DOTA) without
touching any caller — they only depend on `DetectionOutput`.
"""
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import List

import numpy as np
from skimage import measure

from app.services.segmentation_service import CLASS_KEYS


@dataclass
class DetectedBox:
    label: str
    confidence: float
    bbox_norm: List[float]  # x, y, w, h normalized 0-1


@dataclass
class DetectionOutput:
    objects: List[DetectedBox]  # boxes actually drawn on the overlay (capped for readability)
    total_count: int  # the REAL total detected — never capped, always the honest number


class ObjectDetectionService(ABC):
    @abstractmethod
    def detect(self, class_mask: np.ndarray, target: str = "building") -> DetectionOutput: ...


class BlobObjectDetectionService(ObjectDetectionService):
    # A fixed pixel-area minimum doesn't scale with image size, so it's
    # expressed as a fraction of total image pixels instead — this keeps
    # results meaningful whether the image is small or large.
    MIN_AREA_FRACTION = 0.00004
    MIN_AREA_FLOOR_PX = 12
    # This caps only how many boxes are DRAWN on the overlay — dense scenes
    # can legitimately have hundreds of buildings, and drawing all of them
    # produces an unreadable, overlapping mess (as seen in testing). The
    # REPORTED count (`total_count`) is always the true, uncapped number —
    # it must never be silently truncated, or it looks fabricated even
    # when the underlying detection is completely real.
    MAX_DRAWN_BOXES = 60

    def detect(self, class_mask: np.ndarray, target: str = "building") -> DetectionOutput:
        h, w = class_mask.shape
        min_area_px = max(self.MIN_AREA_FLOOR_PX, int(h * w * self.MIN_AREA_FRACTION))

        urban_idx = CLASS_KEYS.index("urban")
        binary = class_mask == urban_idx
        labeled = measure.label(binary, connectivity=2)
        props = measure.regionprops(labeled)

        boxes: List[DetectedBox] = []
        for p in props:
            if p.area < min_area_px:
                continue
            minr, minc, maxr, maxc = p.bbox
            bw, bh = maxc - minc, maxr - minr
            aspect = max(bw, bh) / max(1, min(bw, bh))
            is_road_like = aspect > 4.0 and p.extent < 0.4

            label = "road_segment" if is_road_like else "building"
            if target == "building" and label != "building":
                continue
            if target == "road" and label != "road_segment":
                continue

            confidence = float(min(0.97, 0.55 + 0.4 * min(1.0, p.extent)))
            boxes.append(
                DetectedBox(
                    label=label,
                    confidence=round(confidence, 2),
                    bbox_norm=[minc / w, minr / h, bw / w, bh / h],
                )
            )

        boxes.sort(key=lambda b: b.confidence, reverse=True)
        total = len(boxes)
        # Sample across the confidence range (not just the top N) so the
        # drawn subset represents the scene's spread, not only its most
        # confident corner.
        if total <= self.MAX_DRAWN_BOXES:
            drawn = boxes
        else:
            step = total / self.MAX_DRAWN_BOXES
            drawn = [boxes[int(i * step)] for i in range(self.MAX_DRAWN_BOXES)]
        return DetectionOutput(objects=drawn, total_count=total)


_instance: ObjectDetectionService | None = None


def get_object_detection_service() -> ObjectDetectionService:
    global _instance
    if _instance is None:
        _instance = BlobObjectDetectionService()
    return _instance
