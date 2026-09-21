from datetime import datetime

from sqlalchemy import Column, DateTime, String, Text

from app.database import Base
from app.models.image import gen_id


class AnalysisRecord(Base):
    """
    One natural-language question asked within a session, and everything
    the pipeline produced in response. `result_json` holds the full
    structured payload (stats, evidence, chart data, image paths) so the
    frontend can re-render history without recomputation.
    """

    __tablename__ = "analysis_records"

    id = Column(String, primary_key=True, default=gen_id)
    session_id = Column(String, nullable=False)

    question = Column(Text, nullable=False)
    intent = Column(String, nullable=True)

    answer = Column(Text, nullable=True)
    result_json = Column(Text, nullable=True)  # JSON-encoded AnalysisResult

    created_at = Column(DateTime, default=datetime.utcnow)
