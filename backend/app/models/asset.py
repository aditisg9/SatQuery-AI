import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, LargeBinary, String

from app.database import Base


def gen_asset_id() -> str:
    return uuid.uuid4().hex[:16]


class Asset(Base):
    """
    Generic binary blob storage, living in the same database as everything
    else. This is what lets the whole app run with ZERO filesystem
    dependency — no persistent disk needed, which matters because Render's
    free web service tier does not support attaching one. Every uploaded
    image, thumbnail, segmentation overlay, and change map is a row here;
    served back out via GET /api/assets/{id}.
    """

    __tablename__ = "assets"

    id = Column(String, primary_key=True, default=gen_asset_id)
    content_type = Column(String, nullable=False, default="application/octet-stream")
    data = Column(LargeBinary, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
