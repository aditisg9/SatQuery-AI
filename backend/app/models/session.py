from datetime import datetime

from sqlalchemy import Column, DateTime, String

from app.database import Base
from app.models.image import gen_id


class AnalysisSession(Base):
    """
    A session groups either one image (single-image analysis) or two images
    (before/after change detection) together with the chat-style Q&A that
    happens against them.
    """

    __tablename__ = "analysis_sessions"

    id = Column(String, primary_key=True, default=gen_id)
    title = Column(String, default="Untitled analysis")
    mode = Column(String, default="single")  # "single" | "compare"

    image_id = Column(String, nullable=True)
    before_image_id = Column(String, nullable=True)
    after_image_id = Column(String, nullable=True)
    project_id = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
