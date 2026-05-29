from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
    UploadFile,
    File,
    Form
)

from sqlalchemy.orm import Session
from typing import Optional

from app.db.base import get_db
from app.models.company_settings import CompanySettings
from app.schemas.company_settings import CompanySettingsResponse

from app.utils.media import save_image, delete_image


router = APIRouter(
    prefix="/api/v1/company-settings",
    tags=["Company Settings"]
)


# =========================================================
# CREATE COMPANY SETTINGS
# =========================================================
@router.post(
    "/",
    response_model=CompanySettingsResponse,
    status_code=status.HTTP_201_CREATED
)
def create_company_settings(
    company_name: str = Form(...),
    company_email: Optional[str] = Form(None),
    company_phone: Optional[str] = Form(None),

    address_line1: Optional[str] = Form(None),
    city: Optional[str] = Form(None),
    state: Optional[str] = Form(None),
    postal_code: Optional[str] = Form(None),
    country: Optional[str] = Form(None),

    gst_number: Optional[str] = Form(None),
    website: Optional[str] = Form(None),

    logo: Optional[UploadFile] = File(None),

    db: Session = Depends(get_db),
):

    # Optional:
    # Only allow one company settings record
    existing = db.query(CompanySettings).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Company settings already exists"
        )

    logo_path = save_image(logo, "company") if logo else None

    company = CompanySettings(
        company_name=company_name,
        company_email=company_email,
        company_phone=company_phone,

        address_line1=address_line1,
        city=city,
        state=state,
        postal_code=postal_code,
        country=country,

        gst_number=gst_number,
        website=website,

        logo_url=logo_path
    )

    db.add(company)
    db.commit()
    db.refresh(company)

    return company


# =========================================================
# GET ALL COMPANY SETTINGS
# =========================================================
@router.get(
    "/",
    response_model=list[CompanySettingsResponse]
)
def get_company_settings(
    db: Session = Depends(get_db)
):
    return db.query(CompanySettings).all()


# =========================================================
# GET SINGLE COMPANY SETTINGS
# =========================================================
@router.get(
    "/{company_id}",
    response_model=CompanySettingsResponse
)
def get_company_settings_by_id(
    company_id: int,
    db: Session = Depends(get_db)
):
    company = (
        db.query(CompanySettings)
        .filter(CompanySettings.id == company_id)
        .first()
    )

    if not company:
        raise HTTPException(
            status_code=404,
            detail="Company settings not found"
        )

    return company


# =========================================================
# UPDATE COMPANY SETTINGS
# =========================================================
@router.put(
    "/{company_id}",
    response_model=CompanySettingsResponse
)
def update_company_settings(
    company_id: int,

    company_name: Optional[str] = Form(None),
    company_email: Optional[str] = Form(None),
    company_phone: Optional[str] = Form(None),

    address_line1: Optional[str] = Form(None),
    city: Optional[str] = Form(None),
    state: Optional[str] = Form(None),
    postal_code: Optional[str] = Form(None),
    country: Optional[str] = Form(None),

    gst_number: Optional[str] = Form(None),
    website: Optional[str] = Form(None),

    logo: Optional[UploadFile] = File(None),

    db: Session = Depends(get_db),
):

    company = (
        db.query(CompanySettings)
        .filter(CompanySettings.id == company_id)
        .first()
    )

    if not company:
        raise HTTPException(
            status_code=404,
            detail="Company settings not found"
        )

    # =====================================================
    # UPDATE FIELDS
    # =====================================================

    if company_name is not None:
        company.company_name = company_name

    if company_email is not None:
        company.company_email = company_email

    if company_phone is not None:
        company.company_phone = company_phone

    if address_line1 is not None:
        company.address_line1 = address_line1

    if city is not None:
        company.city = city

    if state is not None:
        company.state = state

    if postal_code is not None:
        company.postal_code = postal_code

    if country is not None:
        company.country = country

    if gst_number is not None:
        company.gst_number = gst_number

    if website is not None:
        company.website = website

    # =====================================================
    # UPDATE LOGO
    # =====================================================

    if logo:

        # delete old logo
        if company.logo_url:
            delete_image(company.logo_url)

        # save new logo
        company.logo_url = save_image(logo, "company")

    db.commit()
    db.refresh(company)

    return company


# =========================================================
# DELETE COMPANY SETTINGS
# =========================================================
@router.delete("/{company_id}")
def delete_company_settings(
    company_id: int,
    db: Session = Depends(get_db)
):

    company = (
        db.query(CompanySettings)
        .filter(CompanySettings.id == company_id)
        .first()
    )

    if not company:
        raise HTTPException(
            status_code=404,
            detail="Company settings not found"
        )

    # delete logo
    if company.logo_url:
        delete_image(company.logo_url)

    db.delete(company)
    db.commit()

    return {
        "message": "Company settings deleted successfully"
    }