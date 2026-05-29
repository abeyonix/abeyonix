from pydantic import BaseModel, EmailStr
from typing import Optional


class CompanySettingsBase(BaseModel):
    company_name: Optional[str] = None
    company_email: Optional[EmailStr] = None
    company_phone: Optional[str] = None

    address_line1: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None

    gst_number: Optional[str] = None
    website: Optional[str] = None
    logo_url: Optional[str] = None


class CompanySettingsCreate(CompanySettingsBase):
    pass


class CompanySettingsUpdate(CompanySettingsBase):
    pass


class CompanySettingsResponse(CompanySettingsBase):
    id: int

    class Config:
        from_attributes = True