"""
VisionLanguageService
-----------------------
The ONLY layer allowed to touch an LLM/VLM. It never invents pixel-level
facts (percentages, object counts, detected classes) — those always come
from the CV/geospatial services and are passed IN as grounding context.
This service's job is query understanding, intent routing, and turning
already-computed structured results into fluent natural language.

Two implementations:
  - MockVisionLanguageService   — deterministic, offline, used when
    DEMO_MODE=true or no GEMINI_API_KEY is configured.
  - GeminiVisionLanguageService — calls Google's Gemini API.

Swap implementations from `get_vision_language_service()` only; nothing
else in the codebase should import a concrete class.
"""
import json
import re
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional

from app.config import get_settings

settings = get_settings()

INTENTS = [
    "LAND_COVER_ANALYSIS",
    "WATER_BODY_DETECTION",
    "VEGETATION_ANALYSIS",
    "BUILDING_DETECTION",
    "ROAD_DETECTION",
    "URBAN_ANALYSIS",
    "AREA_CALCULATION",
    "CHANGE_DETECTION",
    "URBANIZATION_TREND",
    "DISASTER_IMPACT_ASSESSMENT",
    "GENERAL_DESCRIPTION",
]

_KEYWORD_RULES: List[tuple] = [
    ("CHANGE_DETECTION", ["what changed", "difference between", "compare", "before and after", "between these"]),
    ("URBANIZATION_TREND", ["urbanization", "urban growth", "urban expansion", "has urbanization"]),
    ("WATER_BODY_DETECTION", ["water", "river", "lake", "pond", "flood"]),
    ("VEGETATION_ANALYSIS", ["vegetation", "forest", "tree", "green cover", "deforestation"]),
    ("BUILDING_DETECTION", ["building", "buildings", "structures", "houses"]),
    ("ROAD_DETECTION", ["road", "roads", "highway", "street"]),
    ("LAND_COVER_ANALYSIS", ["agricultural", "agriculture", "farmland", "crop", "land cover", "land use"]),
    ("URBAN_ANALYSIS", ["urban", "built-up", "built up", "city", "town"]),
    ("AREA_CALCULATION", ["percentage", "percent", "area", "how much", "hectares", "sq km", "square"]),
]


class VisionLanguageService(ABC):
    @abstractmethod
    def classify_intent(self, question: str, mode: str) -> str: ...

    @abstractmethod
    def understand_query(self, question: str) -> Dict[str, Any]: ...

    @abstractmethod
    def generate_answer(self, question: str, intent: str, grounding: Dict[str, Any]) -> str: ...

    @abstractmethod
    def summarize_analysis(self, grounding: Dict[str, Any]) -> str: ...


class MockVisionLanguageService(VisionLanguageService):
    """Offline, deterministic, template-driven. Powers DEMO_MODE."""

    def classify_intent(self, question: str, mode: str) -> str:
        q = question.lower()
        if mode == "compare":
            disaster_keywords = [
                "flood", "disaster", "damage", "affected area", "submerged",
                "destroyed", "devastation", "cyclone", "landslide", "relief",
            ]
            if any(k in q for k in disaster_keywords):
                return "DISASTER_IMPACT_ASSESSMENT"
            for keyword in ["urbanization", "urban growth", "urban expansion"]:
                if keyword in q:
                    return "URBANIZATION_TREND"
            return "CHANGE_DETECTION"
        for intent, keywords in _KEYWORD_RULES:
            if any(k in q for k in keywords):
                return intent
        return "GENERAL_DESCRIPTION"

    def understand_query(self, question: str) -> Dict[str, Any]:
        return {"question": question.strip(), "language": "en"}

    def generate_answer(self, question: str, intent: str, grounding: Dict[str, Any]) -> str:
        return _template_answer(intent, grounding)

    def summarize_analysis(self, grounding: Dict[str, Any]) -> str:
        return _template_answer("GENERAL_DESCRIPTION", grounding)


class GeminiVisionLanguageService(VisionLanguageService):
    """
    Thin wrapper around Google's Gemini API. Used for phrasing / intent
    disambiguation only — every number it is allowed to mention is supplied
    in `grounding`, and the prompt explicitly forbids inventing new figures.
    """

    def __init__(self):
        import google.generativeai as genai

        genai.configure(api_key=settings.GEMINI_API_KEY)
        self._model = genai.GenerativeModel(settings.GEMINI_MODEL)
        self._fallback = MockVisionLanguageService()

    def classify_intent(self, question: str, mode: str) -> str:
        prompt = (
            "Classify a remote-sensing question into exactly one label from this list: "
            f"{INTENTS}. Session mode is '{mode}' (single image or before/after compare). "
            f'Question: "{question}". Respond with ONLY the label, nothing else.'
        )
        try:
            resp = self._model.generate_content(prompt)
            text = (resp.text or "").strip().upper()
            match = re.search("|".join(INTENTS), text)
            if match:
                return match.group(0)
        except Exception:
            pass
        return self._fallback.classify_intent(question, mode)

    def understand_query(self, question: str) -> Dict[str, Any]:
        return {"question": question.strip(), "language": "en"}

    def generate_answer(self, question: str, intent: str, grounding: Dict[str, Any]) -> str:
        prompt = (
            "You are a remote-sensing analysis assistant. Answer the user's question "
            "using ONLY the JSON facts given below — do not invent any statistic, class, "
            "or object that is not present in the JSON. Be concise (2-4 sentences), "
            "quote the key numbers, and speak in plain, professional English.\n\n"
            f"User question: {question}\n"
            f"Intent: {intent}\n"
            f"Computed facts (JSON): {json.dumps(grounding, default=str)}\n"
        )
        try:
            resp = self._model.generate_content(prompt)
            text = (resp.text or "").strip()
            if text:
                return text
        except Exception:
            pass
        return self._fallback.generate_answer(question, intent, grounding)

    def summarize_analysis(self, grounding: Dict[str, Any]) -> str:
        return self.generate_answer("Describe what is visible in this image.", "GENERAL_DESCRIPTION", grounding)


def _template_answer(intent: str, g: Dict[str, Any]) -> str:
    """Deterministic natural-language phrasing for DEMO_MODE, built strictly
    from the grounding dict computed by the CV/geospatial pipeline."""
    classes = {c["key"]: c for c in g.get("class_stats", [])}
    changes = g.get("change_stats", [])
    objects = g.get("objects", [])

    def pct(key):
        c = classes.get(key)
        return c["pixel_percentage"] if c else 0.0

    def area_txt(key):
        c = classes.get(key)
        if c and c.get("area_hectares") is not None:
            return f" (~{c['area_hectares']} hectares)"
        return ""

    if intent == "LAND_COVER_ANALYSIS":
        return (
            f"Approximately {pct('bare_soil')}% of the visible region is classified as "
            f"bare soil / agricultural land{area_txt('bare_soil')}, with vegetation covering "
            f"{pct('vegetation')}% and built-up area covering {pct('urban')}%."
        )
    if intent == "WATER_BODY_DETECTION":
        return (
            f"Water bodies cover about {pct('water')}% of the image{area_txt('water')}. "
            f"The overlay highlights the detected water regions in blue."
        )
    if intent == "VEGETATION_ANALYSIS":
        return (
            f"Vegetation is present across roughly {pct('vegetation')}% of the scene{area_txt('vegetation')}, "
            f"concentrated in the regions highlighted in green on the overlay."
        )
    if intent in ("BUILDING_DETECTION", "ROAD_DETECTION"):
        n = g.get("total_objects_detected", len(objects))
        kind = "buildings" if intent == "BUILDING_DETECTION" else "road segments"
        return (
            f"Detected {n} candidate {kind} in the image based on built-up surface geometry. "
            f"Bounding boxes are drawn on the overlay; built-up surface overall covers {pct('urban')}% of the frame."
        )
    if intent in ("URBAN_ANALYSIS", "AREA_CALCULATION"):
        return (
            f"Built-up / urban surface covers approximately {pct('urban')}% of the image{area_txt('urban')}. "
            f"For reference, vegetation covers {pct('vegetation')}% and water covers {pct('water')}%."
        )
    if intent in ("CHANGE_DETECTION", "URBANIZATION_TREND", "DISASTER_IMPACT_ASSESSMENT"):
        if not changes:
            return "No significant land-cover change was detected between the two images."
        if intent == "DISASTER_IMPACT_ASSESSMENT":
            water_change = next((c for c in changes if c["label"] == "Water"), None)
            urban_change = next((c for c in changes if c["label"].startswith("Urban")), None)
            lines = []
            if water_change and water_change["delta_percentage"] > 0.5:
                area_note = ""
                if water_change.get("delta_area_hectares") is not None:
                    area_note = f" (~{water_change['delta_area_hectares']} hectares newly submerged)"
                lines.append(
                    f"water-covered area increased by {water_change['delta_percentage']}%{area_note}, "
                    f"consistent with flood-affected extent"
                )
            elif water_change and water_change["delta_percentage"] < -0.5:
                lines.append(f"water-covered area decreased by {abs(water_change['delta_percentage'])}%, consistent with floodwater recession")
            if urban_change and urban_change["delta_percentage"] < -0.5:
                lines.append(
                    f"built-up area decreased by {abs(urban_change['delta_percentage'])}%, a possible "
                    f"indicator of structural damage in the affected zone"
                )
            if not lines:
                return (
                    "No substantial water or built-up area change was detected between the two "
                    "images, suggesting limited disaster impact in this specific frame."
                )
            return "Disaster impact assessment: " + "; ".join(lines) + "."
        lines = []
        for c in changes:
            direction = "increased" if c["delta_percentage"] > 0 else "decreased"
            if abs(c["delta_percentage"]) < 0.5:
                continue
            area_note = ""
            if c.get("delta_area_hectares") is not None:
                area_note = f" ({c['before_area_hectares']} ha -> {c['after_area_hectares']} ha)"
            lines.append(f"{c['label']} {direction} by {abs(c['delta_percentage'])}%{area_note}")
        if not lines:
            return "Land cover is largely stable between the two images, with only minor pixel-level differences."
        return "Between the before and after images: " + "; ".join(lines) + "."
    # GENERAL_DESCRIPTION
    parts = [f"{c['label'].lower()} {c['pixel_percentage']}%" for c in g.get("class_stats", [])]
    return "The image shows a mix of land-cover types: " + ", ".join(parts) + "."


_instance: Optional[VisionLanguageService] = None


def get_vision_language_service() -> VisionLanguageService:
    global _instance
    if _instance is not None:
        return _instance
    if settings.uses_gemini:
        try:
            _instance = GeminiVisionLanguageService()
        except Exception:
            _instance = MockVisionLanguageService()
    else:
        _instance = MockVisionLanguageService()
    return _instance
