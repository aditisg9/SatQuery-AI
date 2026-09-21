from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.config import get_settings

settings = get_settings()


def _normalized_db_url(url: str) -> str:
    """
    Managed Postgres providers (Render, Heroku, etc.) hand back connection
    strings prefixed 'postgres://', which SQLAlchemy 2.x rejects — it wants
    'postgresql://' (or an explicit driver like 'postgresql+psycopg2://').
    Normalize so DATABASE_URL from any of these providers just works.
    """
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql+psycopg2://", 1)
    return url


DATABASE_URL = _normalized_db_url(settings.DATABASE_URL)
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    # Import models so they register on Base.metadata before create_all
    from app.models import image, session as session_model, analysis, project, asset  # noqa: F401

    Base.metadata.create_all(bind=engine)
