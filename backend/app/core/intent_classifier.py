"""
Thin routing layer: decides which pipeline(s) the orchestrator needs to run
for a given intent. Kept separate from VisionLanguageService so the "which
CV services to call" decision is explicit and easy to extend.
"""
from app.services.vision_language_service import get_vision_language_service

# Maps intent -> which CV pipelines the orchestrator should execute.
INTENT_PIPELINES = {
    "LAND_COVER_ANALYSIS": ["segmentation"],
    "WATER_BODY_DETECTION": ["segmentation"],
    "VEGETATION_ANALYSIS": ["segmentation"],
    "BUILDING_DETECTION": ["segmentation", "detection_building"],
    "ROAD_DETECTION": ["segmentation", "detection_road"],
    "URBAN_ANALYSIS": ["segmentation"],
    "AREA_CALCULATION": ["segmentation"],
    "GENERAL_DESCRIPTION": ["segmentation"],
    "CHANGE_DETECTION": ["segmentation_pair", "change"],
    "URBANIZATION_TREND": ["segmentation_pair", "change"],
    "DISASTER_IMPACT_ASSESSMENT": ["segmentation_pair", "change"],
}


def classify(question: str, mode: str) -> str:
    return get_vision_language_service().classify_intent(question, mode)


def pipelines_for(intent: str) -> list[str]:
    return INTENT_PIPELINES.get(intent, ["segmentation"])
