from fastapi import APIRouter, Depends, HTTPException, status, Form, UploadFile, File
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.utils.security import hash_password
from app.db.base import get_db
from app.models.users import Role, User
from app.models.otp_verification import OTPVerification
from app.schemas.auth import *
from app.utils.security import hash_password, verify_password, create_access_token
from app.utils.email_service import send_email
from app.utils.otp import generate_otp, otp_expiry
import uuid

router = APIRouter(prefix="/api/v1/auth", tags=["Auth Management"])


def registration_otp_email(name: str, otp: str):
    return f"""
    <html>
      <body style="font-family: Arial, sans-serif;">
        <h2>Verify Your Account</h2>
        <p>Hello <b>{name}</b>,</p>

        <p>Thank you for registering with us.  
        Please use the OTP below to verify your account:</p>

        <h1 style="color:#2E86C1;">{otp}</h1>

        <p>This OTP is valid for <b>10 minutes</b>.</p>

        <p>If you did not register, please ignore this email.</p>

        <br/>
        <p>Regards,<br/>
        <b>Abeyonix Team</b></p>
      </body>
    </html>
    """




@router.post("/register", response_model=UserRegisterResponse, status_code=status.HTTP_201_CREATED)
def register_user(payload: UserRegisterRequest, db: Session = Depends(get_db)):

    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(400, "Email already registered")

    if db.query(User).filter(User.user_name == payload.user_name).first():
        raise HTTPException(400, "Username already taken")

    role = db.query(Role).filter(Role.role_id == 2).first()
    if not role:
        raise HTTPException(404, "Invalid role")

    user = User(
        user_name=payload.user_name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        first_name=payload.first_name,
        last_name=payload.last_name,
        phone=payload.phone,
        role_id=role.role_id,
        is_verify=False,
        is_active=True
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    # ✅ SEND OTP ONLY FOR CUSTOMER
    if role.role_name == "customer":
        otp = generate_otp()

        otp_entry = OTPVerification(
            user_id=user.user_id,
            otp_code=otp,
            purpose="REGISTER",
            expires_at=otp_expiry()
        )

        db.add(otp_entry)
        db.commit()

        send_email(
            to_email=user.email,
            subject="Verify Your Account - OTP",
            html_content=registration_otp_email(user.first_name, otp)
        )

    return user


@router.post(
    "/resend-otp",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK
)
def resend_registration_otp(
    payload: ResendOTPRequest,
    db: Session = Depends(get_db)
):
    # 🔍 Find user
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(404, "User not found")

    # 🔐 Already verified?
    if user.is_verify:
        raise HTTPException(400, "User already verified")

    # 👤 Role check
    if user.role.role_name != "customer":
        raise HTTPException(400, "OTP resend allowed only for customers")

    # ⏳ Rate-limit (last OTP within 1 minute)
    last_otp = (
        db.query(OTPVerification)
        .filter(
            OTPVerification.user_id == user.user_id,
            OTPVerification.purpose == "REGISTER",
            OTPVerification.is_used == False
        )
        .order_by(OTPVerification.created_at.desc())
        .first()
    )

    if last_otp and (datetime.utcnow() - last_otp.created_at).seconds < 60:
        raise HTTPException(429, "Please wait before requesting another OTP")

    # ❌ Invalidate old OTPs
    db.query(OTPVerification).filter(
        OTPVerification.user_id == user.user_id,
        OTPVerification.purpose == "REGISTER",
        OTPVerification.is_used == False
    ).update({"is_used": True})

    # 🔢 Generate new OTP
    otp = generate_otp()

    new_otp = OTPVerification(
        user_id=user.user_id,
        otp_code=otp,
        purpose="REGISTER",
        expires_at=otp_expiry()
    )

    db.add(new_otp)
    db.commit()

    # 📧 Send email
    email_sent = send_email(
        to_email=user.email,
        subject="Your Abeyonix verification code",
        html_content=registration_otp_email(user.first_name, otp)
    )

    if not email_sent:
        raise HTTPException(500, "Failed to send OTP email")

    return {"message": "OTP has been resent successfully"}



# ------------------------

@router.post(
    "/verify-otp",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK
)
def verify_registration_otp(
    payload: VerifyOTPRequest,
    db: Session = Depends(get_db)
):
    # 🔍 Find user
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 🔐 Already verified?
    if user.is_verify:
        raise HTTPException(status_code=400, detail="User already verified")

    # 🔍 Find valid OTP
    otp_record = (
        db.query(OTPVerification)
        .filter(
            OTPVerification.user_id == user.user_id,
            OTPVerification.otp_code == payload.otp,
            OTPVerification.purpose == "REGISTER",
            OTPVerification.is_used == False
        )
        .order_by(OTPVerification.created_at.desc())
        .first()
    )

    if not otp_record:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    # ⏳ Expiry check
    if otp_record.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="OTP expired")

    # ✅ Verify user
    user.is_verify = True

    # 🗑️ Delete ALL OTPs for this user (clean up)
    db.query(OTPVerification).filter(
        OTPVerification.user_id == user.user_id
    ).delete()

    db.commit()

    return {"message": "Account verified successfully"}



# -----------------------------------------------


@router.post(
    "/login",
    response_model=LoginResponse,
    status_code=status.HTTP_200_OK
)
def login_user(
    payload: LoginRequest,
    db: Session = Depends(get_db)
):
    # 🔍 Find user
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # 🔒 Active check
    if not user.is_active:
        raise HTTPException(status_code=403, detail="User account is disabled")

    # ❗ Verification check
    if not user.is_verify:
        raise HTTPException(status_code=403, detail="Account not verified")

    # 🔑 Password check
    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # 🎟️ Create JWT
    token = create_access_token(
        data={
            "sub": str(user.user_id),
            "email": user.email,
            "role": user.role_name
        }
    )

    # 🕒 Update last login
    user.last_login = datetime.utcnow()
    db.commit()

    return LoginResponse(
        access_token=token,
        user_id=user.user_id,
        user_identity_id=user.user_identity_id,
        user_name=user.user_name,
        full_name= user.first_name + " " + user.last_name,
        email=user.email,
        role=user.role_name
    )




# -----------------------------------------------------------



def forgot_password_otp_email(name: str, otp: str):
    return f"""
    <html>
      <body style="font-family: Arial, sans-serif;">
        <h2>Reset Your Password</h2>

        <p>Hello <b>{name}</b>,</p>

        <p>
          We received a request to reset your password.
          Please use the OTP below to proceed:
        </p>

        <h1 style="color:#E74C3C;">{otp}</h1>

        <p>This OTP is valid for <b>10 minutes</b>.</p>

        <p>
          If you did not request a password reset, please ignore this email.
          Your account remains secure.
        </p>

        <br/>
        <p>Regards,<br/>
        <b>Abeyonix Team</b></p>
      </body>
    </html>
    """


def send_forgot_password_otp(user_email: str, db: Session):
    user = db.query(User).filter(User.email == user_email).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # 🔢 Generate OTP
    otp = generate_otp()

    # 🧹 Optional: invalidate previous reset OTPs
    db.query(OTPVerification).filter(
        OTPVerification.user_id == user.user_id,
        OTPVerification.purpose == "RESET_PASSWORD",
        OTPVerification.is_used == False
    ).update({"is_used": True})

    # 💾 Save OTP
    otp_entry = OTPVerification(
        user_id=user.user_id,
        otp_code=otp,
        purpose="RESET_PASSWORD",
        expires_at=otp_expiry()
    )

    db.add(otp_entry)
    db.commit()

    # 📧 Send Email
    email_sent = send_email(
        to_email=user.email,
        subject="Reset Your Password - OTP",
        html_content=forgot_password_otp_email(user.first_name, otp)
    )

    if not email_sent:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send OTP email"
        )

    return {
        "message": "OTP sent to your email for password reset"
    }



@router.post("/forgot-password")
def forgot_password(email: str, db: Session = Depends(get_db)):
    return send_forgot_password_otp(email, db)




@router.post(
    "/verify-forgot-password-otp",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK
)
def verify_forgot_password_otp(
    payload: VerifyOTPRequest,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    otp_record = (
        db.query(OTPVerification)
        .filter(
            OTPVerification.user_id == user.user_id,
            OTPVerification.otp_code == payload.otp,
            OTPVerification.purpose == "RESET_PASSWORD",
            OTPVerification.is_used == False
        )
        .order_by(OTPVerification.created_at.desc())
        .first()
    )

    if not otp_record:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    if otp_record.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="OTP expired")

    # ✅ Mark OTP as used (DON'T delete yet)
    otp_record.is_used = True
    db.commit()

    return {"message": "OTP verified successfully"}


# -------------------------------------------------------------------------

@router.post(
    "/reset-password",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK
)
def reset_password(
    payload: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    # 🔍 Find user
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 🔍 Check OTP status (already verified step)
    otp_record = (
        db.query(OTPVerification)
        .filter(
            OTPVerification.user_id == user.user_id,
            OTPVerification.purpose == "RESET_PASSWORD",
            OTPVerification.is_used == True
        )
        .order_by(OTPVerification.created_at.desc())
        .first()
    )

    if not otp_record:
        raise HTTPException(
            status_code=400,
            detail="OTP verification required before resetting password"
        )


    # 🔐 Update password
    user.password_hash = hash_password(payload.new_password)

    # ✅ Mark OTP as used
    otp_record.is_used = True

    # ✅ Mark OTP as used OR delete all 
    db.query(OTPVerification).filter(
        OTPVerification.user_id == user.user_id
    ).delete()

    db.commit()

    return {"message": "Password reset successfully"}
