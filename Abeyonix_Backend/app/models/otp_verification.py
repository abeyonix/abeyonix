from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta
from app.db.base import Base


class OTPVerification(Base):
    __tablename__ = "otp_verifications"

    otp_id = Column(Integer, primary_key=True, index=True)

    # 🔗 User relation
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)

    # 🔢 OTP details
    otp_code = Column(String(10), nullable=False)
    purpose = Column(String(30), nullable=False)  
    # examples: REGISTER, LOGIN, RESET_PASSWORD

    # ⏳ Validity
    expires_at = Column(DateTime, nullable=False)
    is_used = Column(Boolean, default=False)

    # 🔁 Retry tracking (optional but recommended)
    attempts = Column(Integer, default=0)

    # 🕒 Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)

    # 🔁 Relationship
    user = relationship("User")
