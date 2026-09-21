from datetime import datetime

from sqlalchemy import Column, DateTime, String, Text

from app.database import Base
from app.models.image import gen_id


class Project(Base):
    """
    A Project groups repeat monitoring of the same area of interest —
    multiple single-image or change-detection sessions filed under one
    named case (e.g. "Yamuna Floodplain Watch", "Ward 12 Urban Growth").
    """

    __tablename__ = "projects"

    id = Column(String, primary_key=True, default=gen_id)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
