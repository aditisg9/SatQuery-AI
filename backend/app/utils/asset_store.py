from typing import Optional

from sqlalchemy.orm import Session

from app.models.asset import Asset


def save_asset(db: Session, data: bytes, content_type: str) -> str:
    """Store bytes in the DB and return the new asset's id. Flushes (not
    commits) so the id is available immediately; the caller's eventual
    db.commit() persists it as part of the same transaction."""
    asset = Asset(content_type=content_type, data=data)
    db.add(asset)
    db.flush()
    return asset.id


def get_asset(db: Session, asset_id: str) -> Optional[Asset]:
    return db.get(Asset, asset_id)
