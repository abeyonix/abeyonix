from pydantic import BaseModel, EmailStr, Field
from datetime import datetime


class UserRegisterRequest(BaseModel):
    user_name: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=8)
    first_name: str
    last_name: str
    phone: str
    # role_id: int


class UserRegisterResponse(BaseModel):
    user_id: int
    user_identity_id: str
    user_name: str
    email: EmailStr
    first_name: str
    last_name: str
    phone: str
    role_id: int
    role_name: str
    is_verify: bool
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# -------------------------------------------

class ResendOTPRequest(BaseModel):
    email: EmailStr


class MessageResponse(BaseModel):
    message: str


# --------------------------------------------


class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str


class MessageResponse(BaseModel):
    message: str


# -----------------------------------------------

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

    user_id: int
    user_identity_id: str
    user_name: str
    full_name: str
    email: EmailStr
    role: str


# ----------------------------------------
class ResetPasswordRequest(BaseModel):
    email: EmailStr
    new_password: str = Field(..., min_length=8)

class MessageResponse(BaseModel):
    message: str 