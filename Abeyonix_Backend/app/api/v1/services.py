from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.models.services import Service
from app.schemas.services import ServiceCreate, ServiceResponse

router = APIRouter(prefix="/api/v1/services", tags=["Services"])


# ✅ CREATE SERVICE
@router.post(
    "/",
    response_model=ServiceResponse,
    status_code=status.HTTP_201_CREATED
)
def create_service(payload: ServiceCreate, db: Session = Depends(get_db)):

    new_service = Service(
        name=payload.name,
        email=payload.email,
        mobile_number=payload.mobile_number,
        city=payload.city,
        service_type=payload.service_type,
        message=payload.message  # Optional field
    )

    db.add(new_service)
    db.commit()
    db.refresh(new_service)

    return new_service


# ✅ GET ALL SERVICES
@router.get(
    "/",
    response_model=List[ServiceResponse]
)
def get_services(db: Session = Depends(get_db)):

    services = db.query(Service).order_by(Service.id.desc()).all()
    return services


# ✅ GET SINGLE SERVICE BY ID
@router.get(
    "/{service_id}",
    response_model=ServiceResponse
)
def get_service(service_id: int, db: Session = Depends(get_db)):

    service = db.query(Service).filter(Service.id == service_id).first()

    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )

    return service