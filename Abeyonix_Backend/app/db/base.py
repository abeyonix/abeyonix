from sqlalchemy.ext.declarative import declarative_base
from app.db.session import SessionLocal


Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()