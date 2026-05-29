from sqlalchemy.orm import Session
from app.models.company_settings import CompanySettings


def get_company_settings(db: Session):
    return db.query(CompanySettings).first()