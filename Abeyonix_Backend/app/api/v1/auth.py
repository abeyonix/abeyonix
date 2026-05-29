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
from datetime import datetime
import uuid

router = APIRouter(prefix="/api/v1/auth", tags=["Auth Management"])


def registration_otp_email(name: str, otp: str, company_name: str = "Abeyonix") -> str:
    return f"""
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>
<body style="margin:0; padding:0; background:#f4f4f4; font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:30px 10px;">
        <table width="520" cellpadding="0" cellspacing="0"
               style="background:#fff; border-radius:10px;
                      box-shadow:0 2px 8px rgba(0,0,0,0.08); overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:#1a1a2e; padding:24px; text-align:center;">
              <span style="color:#fff; font-size:22px; font-weight:bold;
                           letter-spacing:1px;">
                {company_name}
              </span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px; color:#333;">
              <h2 style="margin:0 0 12px; color:#1a1a2e; font-size:20px;">
                Verify Your Account
              </h2>
              <p style="margin:0 0 20px; color:#555; font-size:15px;">
                Hi <strong>{name}</strong>,
              </p>
              <p style="margin:0 0 24px; color:#555; font-size:15px;">
                Thank you for registering with us. Use the OTP below to
                verify your account:
              </p>

              <!-- OTP Box -->
              <div style="text-align:center; margin:28px 0;">
                <span style="display:inline-block; background:#f0f4ff;
                             border:2px dashed #2563eb; border-radius:10px;
                             padding:16px 40px; font-size:36px;
                             font-weight:bold; color:#2563eb;
                             letter-spacing:10px;">
                  {otp}
                </span>
              </div>

              <p style="margin:0 0 8px; color:#888; font-size:13px;
                        text-align:center;">
                ⏱️ This OTP is valid for <strong>10 minutes</strong>.
              </p>
              <p style="margin:0 0 24px; color:#aaa; font-size:12px;
                        text-align:center;">
                If you did not register, please ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8f8f8; padding:18px 40px;
                       border-top:1px solid #eee;
                       font-size:12px; color:#aaa; text-align:center;">
              © {company_name} · This is an automated email, please do not reply.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    """




# @router.post("/register", response_model=UserRegisterResponse, status_code=status.HTTP_201_CREATED)
# def register_user(payload: UserRegisterRequest, db: Session = Depends(get_db)):

#     if db.query(User).filter(User.email == payload.email).first():
#         raise HTTPException(400, "Email already registered")

#     if db.query(User).filter(User.user_name == payload.user_name).first():
#         raise HTTPException(400, "Username already taken")

#     role = db.query(Role).filter(Role.role_id == 2).first()
#     if not role:
#         raise HTTPException(404, "Invalid role")

#     user = User(
#         user_name=payload.user_name,
#         email=payload.email,
#         password_hash=hash_password(payload.password),
#         first_name=payload.first_name,
#         last_name=payload.last_name,
#         phone=payload.phone,
#         role_id=role.role_id,
#         is_verify=False,
#         is_active=True
#     )

#     db.add(user)
#     db.commit()
#     db.refresh(user)

#     # ✅ SEND OTP ONLY FOR CUSTOMER
#     if role.role_name == "customer":
#         otp = generate_otp()

#         otp_entry = OTPVerification(
#             user_id=user.user_id,
#             otp_code=otp,
#             purpose="REGISTER",
#             expires_at=otp_expiry()
#         )

#         db.add(otp_entry)
#         db.commit()

#         send_email(
#             to_email=user.email,
#             subject="Verify Your Account - OTP",
#             html_content=registration_otp_email(user.first_name, otp)
#         )

#     return user

@router.post("/register", response_model=UserRegisterResponse, status_code=status.HTTP_201_CREATED)
def register_user(payload: UserRegisterRequest, db: Session = Depends(get_db)):

    # ── Check email ────────────────────────────────────────────────
    existing_by_email = db.query(User).filter(User.email == payload.email).first()

    if existing_by_email:
        # Already verified → hard stop
        if existing_by_email.is_verify:
            raise HTTPException(400, "Email already registered")

        # ── Not verified → clean up and let them retry ─────────────
        # Covers case where they also changed their username on retry
        _cleanup_unverified_user(db, existing_by_email)

    # ── Check username (after cleanup, so deleted user won't block) ─
    if db.query(User).filter(User.user_name == payload.user_name).first():
        raise HTTPException(400, "Username already taken")

    # ── Fetch role ─────────────────────────────────────────────────
    role = db.query(Role).filter(Role.role_id == 2).first()
    if not role:
        raise HTTPException(404, "Invalid role")

    # ── Create user ────────────────────────────────────────────────
    user = User(
        user_name     = payload.user_name,
        email         = payload.email,
        password_hash = hash_password(payload.password),
        first_name    = payload.first_name,
        last_name     = payload.last_name,
        phone         = payload.phone,
        role_id       = role.role_id,
        is_verify     = False,
        is_active     = True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # ── Send OTP for customer ──────────────────────────────────────
    if role.role_name == "customer":
        _send_registration_otp(db, user)

    return user


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _cleanup_unverified_user(db: Session, user: User):
    """
    Deletes all OTP records and the unverified user.
    Called when same email tries to register again without verifying.
    """
    db.query(OTPVerification).filter(
        OTPVerification.user_id == user.user_id
    ).delete()

    db.delete(user)
    db.commit()


def _send_registration_otp(db: Session, user: User):
    """
    Generates OTP, saves to DB, sends email.
    """
    otp = generate_otp()

    otp_entry = OTPVerification(
        user_id    = user.user_id,
        otp_code   = otp,
        purpose    = "REGISTER",
        expires_at = otp_expiry()
    )
    db.add(otp_entry)
    db.commit()

    send_email(
        to_email     = user.email,
        subject      = "Your Abeyonix verification code",
        html_content = registration_otp_email(user.first_name, otp)
    )


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

    # 🧹 STEP 1: Delete expired OTPs (cleanup)
    db.query(OTPVerification).filter(
        # OTPVerification.user_id == user.user_id,
        OTPVerification.expires_at < datetime.utcnow()
    ).delete(synchronize_session=False)

    # 🔍 STEP 2: Find valid OTP
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

    # ⏳ Expiry check (extra safety)
    if otp_record.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="OTP expired")

    # ✅ Verify user
    user.is_verify = True

    # 🗑️ STEP 3: Delete ALL OTPs for this user (final cleanup)
    db.query(OTPVerification).filter(
        OTPVerification.user_id == user.user_id
    ).delete(synchronize_session=False)

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

    # ✅ Not verified — return a specific code frontend can act on
    if not user.is_verify:
        raise HTTPException(
            status_code=403,
            detail={
                "code":    "NOT_VERIFIED",
                "message": "Account not verified. Please verify your email.",
                "email":   user.email      # ← frontend needs this to pre-fill
            }
        )

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
