from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.project import Project
from app.models.session import AnalysisSession
from app.schemas.analysis import SessionOut
from app.schemas.project import ProjectCreate, ProjectOut, ProjectUpdate
from app.utils.time_utils import utc_iso

router = APIRouter(prefix="/api/projects", tags=["projects"])


@router.post("", response_model=ProjectOut)
def create_project(payload: ProjectCreate, db: Session = Depends(get_db)):
    project = Project(name=payload.name.strip(), description=payload.description)
    db.add(project)
    db.commit()
    db.refresh(project)
    return _project_out(project, 0)


@router.get("", response_model=list[ProjectOut])
def list_projects(db: Session = Depends(get_db)):
    projects = db.query(Project).order_by(desc(Project.updated_at)).all()
    out = []
    for p in projects:
        count = db.query(AnalysisSession).filter(AnalysisSession.project_id == p.id).count()
        out.append(_project_out(p, count))
    return out


@router.get("/{project_id}", response_model=ProjectOut)
def get_project(project_id: str, db: Session = Depends(get_db)):
    project = db.get(Project, project_id)
    if not project:
        raise HTTPException(404, "Project not found")
    count = db.query(AnalysisSession).filter(AnalysisSession.project_id == project.id).count()
    return _project_out(project, count)


@router.patch("/{project_id}", response_model=ProjectOut)
def update_project(project_id: str, payload: ProjectUpdate, db: Session = Depends(get_db)):
    project = db.get(Project, project_id)
    if not project:
        raise HTTPException(404, "Project not found")
    if payload.name is not None:
        project.name = payload.name.strip()
    if payload.description is not None:
        project.description = payload.description
    project.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(project)
    count = db.query(AnalysisSession).filter(AnalysisSession.project_id == project.id).count()
    return _project_out(project, count)


@router.delete("/{project_id}")
def delete_project(project_id: str, db: Session = Depends(get_db)):
    project = db.get(Project, project_id)
    if not project:
        raise HTTPException(404, "Project not found")
    # Unlink sessions rather than deleting their history
    db.query(AnalysisSession).filter(AnalysisSession.project_id == project_id).update(
        {"project_id": None}
    )
    db.delete(project)
    db.commit()
    return {"ok": True}


@router.get("/{project_id}/sessions", response_model=list[SessionOut])
def project_sessions(project_id: str, db: Session = Depends(get_db)):
    project = db.get(Project, project_id)
    if not project:
        raise HTTPException(404, "Project not found")
    sessions = (
        db.query(AnalysisSession)
        .filter(AnalysisSession.project_id == project_id)
        .order_by(desc(AnalysisSession.created_at))
        .all()
    )
    return [
        SessionOut(
            id=s.id,
            title=s.title,
            mode=s.mode,
            image_id=s.image_id,
            before_image_id=s.before_image_id,
            after_image_id=s.after_image_id,
            project_id=s.project_id,
            created_at=utc_iso(s.created_at),
        )
        for s in sessions
    ]


def _project_out(p: Project, session_count: int) -> ProjectOut:
    return ProjectOut(
        id=p.id,
        name=p.name,
        description=p.description,
        session_count=session_count,
        created_at=utc_iso(p.created_at),
        updated_at=utc_iso(p.updated_at),
    )
