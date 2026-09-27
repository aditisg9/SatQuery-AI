"""
PipelineOrchestrator
-----------------------
Implements the flow from the spec:

  Satellite Image + User Question
    -> Query Understanding      (VisionLanguageService)
    -> Vision/Geospatial Analysis (Segmentation / Detection / Change / Geospatial)
    -> Evidence Extraction
    -> Natural-Language Explanation (VisionLanguageService, grounded)
    -> Visual Result

One entry point for each workflow: `analyze_single` and `analyze_compare`.
Every image (input and generated overlay) is bytes in/bytes out — nothing
here ever touches disk, so the app has no persistent-storage dependency.
"""
from typing import Optional

import numpy as np
from sqlalchemy.orm import Session

from app.core import intent_classifier
from app.schemas.analysis import (
    AnalysisResult,
    ChangeStat,
    ClassStat,
    DetectedObject,
    Evidence,
)
from app.services.change_detection_service import get_change_detection_service
from app.services.geospatial_service import GeoContext, get_geospatial_service
from app.services.object_detection_service import get_object_detection_service
from app.services.preprocessing import coregister_pair, prepare_for_analysis
from app.services.segmentation_service import CLASS_DEFS, CLASS_KEYS, get_segmentation_service
from app.services.multispectral_service import ndvi_vegetation_mask
from app.services.vision_language_service import get_vision_language_service
from app.utils.asset_store import save_asset
from app.utils.image_utils import array_to_png_bytes, load_as_rgb_array, try_read_red_nir_bands


def _class_stats(seg_output, geo: GeoContext) -> list[ClassStat]:
    geospatial = get_geospatial_service()
    stats = []
    for cdef in CLASS_DEFS:
        key = cdef["key"]
        count = seg_output.pixel_counts.get(key, 0)
        stats.append(
            ClassStat(
                key=key,
                label=cdef["label"],
                color=cdef["color"],
                pixel_count=count,
                pixel_percentage=geospatial.pixel_percentage(count, seg_output.total_pixels),
                area_hectares=geospatial.pixel_count_to_hectares(count, geo),
            )
        )
    return stats


def _evidence_for(
    intent: str,
    class_stats: list[ClassStat],
    objects: list[DetectedObject],
    changes: list[ChangeStat],
    total_detected: int | None = None,
    multispectral_used: bool = False,
) -> Evidence:
    points = []
    caveats = ["Pixel-color heuristics are used by default; connect a trained model for production accuracy."]
    if intent in ("CHANGE_DETECTION", "URBANIZATION_TREND", "DISASTER_IMPACT_ASSESSMENT"):
        method = "Before/after land-cover mask comparison"
        for c in changes[:4]:
            direction = "increase" if c.delta_percentage > 0 else "decrease"
            points.append(f"{c.label}: {direction} of {abs(c.delta_percentage)} percentage points")
    elif intent in ("BUILDING_DETECTION", "ROAD_DETECTION"):
        method = "Connected-component analysis over the built-up land-cover mask"
        n = total_detected if total_detected is not None else len(objects)
        points.append(f"{n} candidate object(s) localized")
        if objects:
            avg_conf = round(sum(o.confidence for o in objects) / len(objects), 2)
            points.append(f"average detection confidence {avg_conf}")
    else:
        if multispectral_used:
            method = "HSV segmentation + NDVI multispectral vegetation index (Red/NIR bands)"
            caveats = [
                "Vegetation is NDVI-based (real reflectance index); water/urban/soil still use RGB color heuristics."
            ]
        else:
            method = "HSV color-threshold land-cover segmentation"
        top = sorted(class_stats, key=lambda c: c.pixel_percentage, reverse=True)[:3]
        points = [f"{c.label}: {c.pixel_percentage}% of pixels" for c in top]

    if intent not in ("BUILDING_DETECTION", "ROAD_DETECTION"):
        confidence = 0.85 if multispectral_used else 0.7
    else:
        confidence = round(sum(o.confidence for o in objects) / len(objects), 2) if objects else 0.4
    return Evidence(
        summary=f"Derived from {method.lower()}.",
        supporting_points=points,
        method=method,
        confidence=confidence,
        caveats=caveats,
    )


class PipelineOrchestrator:
    def __init__(self):
        self.vlm = get_vision_language_service()
        self.segmentation = get_segmentation_service()
        self.detection = get_object_detection_service()
        self.change = get_change_detection_service()
        self.geospatial = get_geospatial_service()

    # ---------- Workflow A: single image ----------
    def analyze_single(
        self, db: Session, image_bytes: bytes, filename: str, geo: GeoContext, question: str
    ) -> AnalysisResult:
        intent = intent_classifier.classify(question, mode="single")
        raw = load_as_rgb_array(image_bytes, filename)
        arr = prepare_for_analysis(raw)

        seg = self.segmentation.segment(arr)

        # If this is a 4+ band multispectral GeoTIFF (common for real
        # Sentinel-2/Landsat exports), recompute vegetation using real NDVI
        # — the standard remote-sensing formula — instead of the RGB color
        # heuristic. This only ever refines the vegetation class; water,
        # urban, and soil classification are unaffected.
        multispectral_used = False
        red_nir = try_read_red_nir_bands(image_bytes, filename)
        if red_nir is not None:
            red, nir = red_nir
            veg_mask = ndvi_vegetation_mask(red, nir, target_shape=seg.class_mask.shape)
            veg_idx = CLASS_KEYS.index("vegetation")
            other_idx = CLASS_KEYS.index("other")
            was_veg = seg.class_mask == veg_idx
            seg.class_mask[was_veg & ~veg_mask] = other_idx  # HSV guess not confirmed by NDVI
            seg.class_mask[veg_mask] = veg_idx  # NDVI-confirmed vegetation is authoritative
            seg.pixel_counts = {k: int(np.sum(seg.class_mask == i)) for i, k in enumerate(CLASS_KEYS)}
            multispectral_used = True

        class_stats = _class_stats(seg, geo)

        objects: list[DetectedObject] = []
        total_detected = 0

        needs_detection = intent in ("BUILDING_DETECTION", "ROAD_DETECTION")
        if needs_detection:
            target = "building" if intent == "BUILDING_DETECTION" else "road"
            det = self.detection.detect(seg.class_mask, target=target)
            objects = [DetectedObject(label=o.label, confidence=o.confidence, bbox=o.bbox_norm) for o in det.objects]
            total_detected = det.total_count
            overlay_arr = _draw_boxes(seg.overlay_rgb(arr, alpha=0.25), det.objects)
        else:
            overlay_arr = seg.overlay_rgb(arr)

        overlay_asset_id = save_asset(db, array_to_png_bytes(overlay_arr), "image/png")
        overlay_url = f"/api/assets/{overlay_asset_id}"

        grounding = {
            "class_stats": [c.model_dump() for c in class_stats],
            "objects": [o.model_dump() for o in objects],
            "total_objects_detected": total_detected,
            "geo_available": geo.has_geo_metadata,
            "multispectral_ndvi_used": multispectral_used,
        }
        evidence = _evidence_for(intent, class_stats, objects, [], total_detected=total_detected, multispectral_used=multispectral_used)
        answer = self.vlm.generate_answer(question, intent, grounding)

        chart_data = [{"name": c.label, "value": c.pixel_percentage, "color": c.color} for c in class_stats]

        notes = [] if geo.has_geo_metadata else [
            "No georeferencing found in this image — showing pixel percentages only, not real-world area."
        ]
        if needs_detection and total_detected > len(objects):
            notes.append(
                f"{total_detected} total detected — showing {len(objects)} representative boxes on the overlay for readability."
            )
        if multispectral_used:
            notes.append(
                "Vegetation classified using NDVI (Red/NIR bands) from the uploaded multispectral GeoTIFF — a real remote-sensing index, not a color estimate."
            )

        return AnalysisResult(
            intent=intent,
            answer=answer,
            evidence=evidence,
            class_stats=class_stats,
            objects=objects,
            overlay_image_url=overlay_url,
            chart_data=chart_data,
            geo_available=geo.has_geo_metadata,
            notes=notes,
        )

    # ---------- Workflow B: two-image change detection ----------
    def analyze_compare(
        self,
        db: Session,
        before_bytes: bytes,
        before_filename: str,
        after_bytes: bytes,
        after_filename: str,
        geo_before: GeoContext,
        geo_after: GeoContext,
        question: str,
    ) -> AnalysisResult:
        intent = intent_classifier.classify(question, mode="compare")

        raw_before = prepare_for_analysis(load_as_rgb_array(before_bytes, before_filename))
        raw_after = prepare_for_analysis(load_as_rgb_array(after_bytes, after_filename))
        before_rgb, after_rgb = coregister_pair(raw_before, raw_after)

        seg_before = self.segmentation.segment(before_rgb)
        seg_after = self.segmentation.segment(after_rgb)

        cls_before = _class_stats(seg_before, geo_before)
        cls_after = _class_stats(seg_after, geo_after)
        geo_ok = geo_before.has_geo_metadata and geo_after.has_geo_metadata

        change_stats: list[ChangeStat] = []
        by_label_before = {c.label: c for c in cls_before}
        for c_after in cls_after:
            c_before = by_label_before[c_after.label]
            delta_area = None
            if geo_ok and c_before.area_hectares is not None and c_after.area_hectares is not None:
                delta_area = round(c_after.area_hectares - c_before.area_hectares, 2)
            change_stats.append(
                ChangeStat(
                    label=c_after.label,
                    color=c_after.color,
                    before_pixel_percentage=c_before.pixel_percentage,
                    after_pixel_percentage=c_after.pixel_percentage,
                    delta_percentage=round(c_after.pixel_percentage - c_before.pixel_percentage, 2),
                    before_area_hectares=c_before.area_hectares,
                    after_area_hectares=c_after.area_hectares,
                    delta_area_hectares=delta_area,
                )
            )

        change_out = self.change.compare(seg_before.class_mask, seg_after.class_mask)
        change_map = change_out.change_map_rgb(after_rgb)

        change_map_asset_id = save_asset(db, array_to_png_bytes(change_map), "image/png")
        before_overlay_asset_id = save_asset(db, array_to_png_bytes(seg_before.overlay_rgb(before_rgb)), "image/png")
        after_overlay_asset_id = save_asset(db, array_to_png_bytes(seg_after.overlay_rgb(after_rgb)), "image/png")

        grounding = {
            "class_stats": [c.model_dump() for c in cls_after],
            "change_stats": [c.model_dump() for c in change_stats],
            "changed_pixel_pct": change_out.changed_pixel_pct,
            "transitions": change_out.transitions,
            "geo_available": geo_ok,
        }
        evidence = _evidence_for(intent, cls_after, [], change_stats)
        evidence.supporting_points.append(f"{change_out.changed_pixel_pct}% of pixels changed class overall")
        answer = self.vlm.generate_answer(question, intent, grounding)

        chart_data = [
            {"name": c.label, "before": c.before_pixel_percentage, "after": c.after_pixel_percentage}
            for c in change_stats
        ]

        return AnalysisResult(
            intent=intent,
            answer=answer,
            evidence=evidence,
            class_stats=cls_after,
            change_stats=change_stats,
            before_overlay_url=f"/api/assets/{before_overlay_asset_id}",
            after_overlay_url=f"/api/assets/{after_overlay_asset_id}",
            change_map_url=f"/api/assets/{change_map_asset_id}",
            chart_data=chart_data,
            geo_available=geo_ok,
            notes=[] if geo_ok else [
                "One or both images lack georeferencing — showing pixel-percentage change only, not real-world area."
            ],
        )


def _draw_boxes(base_rgb: np.ndarray, boxes) -> np.ndarray:
    """Cheap in-numpy rectangle drawing (no extra dependency)."""
    out = base_rgb.copy()
    h, w = out.shape[:2]
    color = np.array([34, 199, 214], dtype=np.uint8)
    thickness = max(1, min(h, w) // 300)
    for b in boxes:
        x, y, bw, bh = b.bbox_norm
        x0, y0 = int(x * w), int(y * h)
        x1, y1 = int((x + bw) * w), int((y + bh) * h)
        x1, y1 = min(x1, w - 1), min(y1, h - 1)
        out[y0 : y0 + thickness, x0:x1] = color
        out[max(y0, y1 - thickness) : y1, x0:x1] = color
        out[y0:y1, x0 : x0 + thickness] = color
        out[y0:y1, max(x0, x1 - thickness) : x1] = color
    return out


_instance: Optional[PipelineOrchestrator] = None


def get_orchestrator() -> PipelineOrchestrator:
    global _instance
    if _instance is None:
        _instance = PipelineOrchestrator()
    return _instance
