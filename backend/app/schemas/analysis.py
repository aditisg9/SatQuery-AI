from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class SessionCreate(BaseModel):
    mode: str  # "single" | "compare"
    image_id: Optional[str] = None
    before_image_id: Optional[str] = None
    after_image_id: Optional[str] = None
    title: Optional[str] = None
    project_id: Optional[str] = None


class SessionOut(BaseModel):
    id: str
    title: str
    mode: str
    image_id: Optional[str] = None
    before_image_id: Optional[str] = None
    after_image_id: Optional[str] = None
    project_id: Optional[str] = None
    created_at: str


class QuestionIn(BaseModel):
    session_id: str
    question: str


class ClassStat(BaseModel):
    key: str
    label: str
    color: str
    pixel_count: int
    pixel_percentage: float
    area_hectares: Optional[float] = None


class ChangeStat(BaseModel):
    label: str
    color: str
    before_pixel_percentage: float
    after_pixel_percentage: float
    delta_percentage: float
    before_area_hectares: Optional[float] = None
    after_area_hectares: Optional[float] = None
    delta_area_hectares: Optional[float] = None


class DetectedObject(BaseModel):
    label: str
    confidence: float
    bbox: List[float]  # [x, y, w, h] in normalized 0-1 coords


class Evidence(BaseModel):
    summary: str
    supporting_points: List[str]
    method: str
    confidence: Optional[float] = None
    caveats: List[str] = []


class AnalysisResult(BaseModel):
    intent: str
    answer: str
    evidence: Evidence

    class_stats: List[ClassStat] = []
    change_stats: List[ChangeStat] = []
    objects: List[DetectedObject] = []

    overlay_image_url: Optional[str] = None
    before_overlay_url: Optional[str] = None
    after_overlay_url: Optional[str] = None
    change_map_url: Optional[str] = None

    chart_data: List[Dict[str, Any]] = []

    geo_available: bool = False
    notes: List[str] = []
