from pydantic import BaseModel, EmailStr
from typing import Optional

class InquiryCreate(BaseModel):
    name: str
    email: EmailStr
    telephone: Optional[str]
    message: str


class InquiryResponse(BaseModel):
    id: int
    name: str
    email: str
    telephone: Optional[str]
    message: str
    status: str

    class Config:
        from_attributes = True