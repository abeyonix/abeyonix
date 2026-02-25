from pydantic import BaseModel, EmailStr, Field
from typing import Optional


# 🔹 Create Schema
class ServiceCreate(BaseModel):
    name: str = Field(..., max_length=150)
    email: EmailStr
    mobile_number: str = Field(..., max_length=20)
    city: str = Field(..., max_length=100)
    service_type: str = Field(..., max_length=100)
    message: Optional[str] = None


# 🔹 Response Schema
class ServiceResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    mobile_number: str
    city: str
    service_type: str
    message: Optional[str] = None

    class Config:
        from_attributes = True  # For SQLAlchemy ORM (Pydantic v2)