import json
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.core.pipeline_orchestrator import get_orchestrator
from app.database import get_db
from app.models.analysis import AnalysisRecord
from app.models.image import SatelliteImage
from app.models.session import AnalysisSession
from app.schemas.analysis import AnalysisResult, QuestionIn, SessionCreate, SessionOut
from app.services.geospatial_service import GeoContext
from app.utils.asset_store import get_asset
from app.utils.time_utils import utc_iso

router = APIRouter(prefix="/api", tags=["analysis"])


@router.post("/sessions", response_model=SessionOut)
def create_session(payload: SessionCreate, db: Session = Depends(get_db)):
    if payload.mode == "single" and not payload.image_id:
        raise HTTPException(400, "image_id is required for mode='single'")
    if payload.mode == "compare" and not (payload.before_image_id and payload.after_image_id):
        raise HTTPException(400, "before_image_id and after_image_id are required for mode='compare'")

    title = payload.title or ("Single-image analysis" if payload.mode == "single" else "Change detection")
    session = AnalysisSession(
        title=title,
        mode=payload.mode,
        image_id=payload.image_id,
        before_image_id=payload.before_image_id,
        after_image_id=payload.after_image_id,
        project_id=payload.project_id,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return _session_out(session)


@router.get("/sessions", response_model=list[SessionOut])
def list_sessions(db: Session = Depends(get_db)):
    sessions = db.query(AnalysisSession).order_by(desc(AnalysisSession.created_at)).limit(50).all()
    return [_session_out(s) for s in sessions]


@router.get("/sessions/{session_id}/history")
def session_history(session_id: str, db: Session = Depends(get_db)):
    records = (
        db.query(AnalysisRecord)
        .filter(AnalysisRecord.session_id == session_id)
        .order_by(AnalysisRecord.created_at)
        .all()
    )
    return [
        {
            "id": r.id,
            "question": r.question,
            "intent": r.intent,
            "answer": r.answer,
            "result": json.loads(r.result_json) if r.result_json else None,
            "created_at": utc_iso(r.created_at),
        }
        for r in records
    ]


@router.get("/sessions/{session_id}", response_model=SessionOut)
def get_session(session_id: str, db: Session = Depends(get_db)):
    session = db.get(AnalysisSession, session_id)
    if not session:
        raise HTTPException(404, "Session not found")
    return _session_out(session)


@router.delete("/sessions/{session_id}")
def delete_session(session_id: str, db: Session = Depends(get_db)):
    session = db.get(AnalysisSession, session_id)
    if not session:
        raise HTTPException(404, "Session not found")
    db.query(AnalysisRecord).filter(AnalysisRecord.session_id == session_id).delete()
    db.delete(session)
    db.commit()
    return {"ok": True}


@router.post("/analyze", response_model=AnalysisResult)
def analyze(payload: QuestionIn, db: Session = Depends(get_db)):
    session = db.get(AnalysisSession, payload.session_id)
    if not session:
        raise HTTPException(404, "Session not found")

    orchestrator = get_orchestrator()

    if session.mode == "single":
        image = db.get(SatelliteImage, session.image_id)
        if not image:
            raise HTTPException(404, "Image not found")
        asset = get_asset(db, image.asset_id)
        if not asset:
            raise HTTPException(404, "Image data not found")
        geo = GeoContext(
            has_geo_metadata=bool(image.has_geo_metadata),
            pixel_resolution_m=image.pixel_resolution_m,
        )
        result = orchestrator.analyze_single(db, asset.data, image.filename, geo, payload.question)
    else:
        before = db.get(SatelliteImage, session.before_image_id)
        after = db.get(SatelliteImage, session.after_image_id)
        if not before or not after:
            raise HTTPException(404, "Before/after image not found")
        before_asset = get_asset(db, before.asset_id)
        after_asset = get_asset(db, after.asset_id)
        if not before_asset or not after_asset:
            raise HTTPException(404, "Image data not found")
        geo_before = GeoContext(bool(before.has_geo_metadata), before.pixel_resolution_m)
        geo_after = GeoContext(bool(after.has_geo_metadata), after.pixel_resolution_m)
        result = orchestrator.analyze_compare(
            db,
            before_asset.data,
            before.filename,
            after_asset.data,
            after.filename,
            geo_before,
            geo_after,
            payload.question,
        )

    record = AnalysisRecord(
        session_id=session.id,
        question=payload.question,
        intent=result.intent,
        answer=result.answer,
        result_json=result.model_dump_json(),
    )
    db.add(record)
    session.updated_at = datetime.utcnow()
    db.commit()

    return result


def _session_out(s: AnalysisSession) -> SessionOut:
    return SessionOut(
        id=s.id,
        title=s.title,
        mode=s.mode,
        image_id=s.image_id,
        before_image_id=s.before_image_id,
        after_image_id=s.after_image_id,
        project_id=s.project_id,
        created_at=utc_iso(s.created_at),
    )
