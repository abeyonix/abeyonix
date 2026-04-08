from fastapi import APIRouter, Depends, HTTPException, status, Query as FastQuery
from sqlalchemy import desc
from sqlalchemy.orm import Session, joinedload
from typing import List,Optional

from app.db.base import Base
from app.db.session import get_db  # Your DB session dependency
from app.models.inquiry import Inquiry
from app.schemas.inquiry import InquiryCreate, InquiryResponse


router = APIRouter(
    prefix="/api/v1/inquiry",
    tags=["INQUIRIES"]
)


@router.post("/", response_model=InquiryResponse)
def create_inquiry(payload: InquiryCreate, db: Session = Depends(get_db)):

    inquiry = Inquiry(
        name=payload.name,
        email=payload.email,
        telephone=payload.telephone,
        message=payload.message
    )

    db.add(inquiry)
    db.commit()
    db.refresh(inquiry)

    return inquiry


@router.get("/")
def get_inquiries(
    page: int = FastQuery(1, ge=1),
    page_size: int = FastQuery(10, ge=1, le=100),
    db: Session = Depends(get_db)
):

    # 🔢 Calculate offset
    offset = (page - 1) * page_size

    # 📊 Total count
    total_records = db.query(Inquiry).count()

    # 📦 Fetch paginated data
    inquiries = (
        db.query(Inquiry)
        .order_by(desc(Inquiry.created_at))
        .offset(offset)
        .limit(page_size)
        .all()
    )

    # 🧾 Format response
    records = [
        {
            "id": item.id,
            "name": item.name,
            "email": item.email,
            "telephone": item.telephone,
            "message": item.message,
            "status": item.status,
            "created_at": item.created_at
        }
        for item in inquiries
    ]

    return {
        "total_records": total_records,
        "page": page,
        "page_size": page_size,
        "total_pages": (total_records + page_size - 1) // page_size,
        "records": records
    }