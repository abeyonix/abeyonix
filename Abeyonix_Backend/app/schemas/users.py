from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# Base schema
class RoleBase(BaseModel):
    role_name: str
    description: Optional[str] = None


# Create schema
class RoleCreate(RoleBase):
    pass


# Update schema
class RoleUpdate(BaseModel):
    role_name: Optional[str] = None
    description: Optional[str] = None


# Response schema
class RoleResponse(RoleBase):
    role_id: int

    class Config:
        from_attributes = True   # for SQLAlchemy compatibility



# ---------------------------


class UserBase(BaseModel):
    user_name: str
    email: EmailStr
    first_name: str
    last_name: str
    phone: str
    alternative_phone: Optional[str] = None
    role_id: int


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    user_name: Optional[str] = None
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    alternative_phone: Optional[str] = None
    role_id: Optional[int] = None
    is_active: Optional[bool] = None
    is_verify: Optional[bool] = None


class UserResponse(BaseModel):
    user_id: int
    user_identity_id: str
    user_name: str
    email: str
    first_name: str
    last_name: str
    phone: str
    alternative_phone: Optional[str]
    role_id: int
    role_name: Optional[str]
    profile_image_url: Optional[str]
    is_verify: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime]

    class Config:
        from_attributes = True