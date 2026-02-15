from sqlalchemy import Column, Integer, String, Text, Boolean, Enum as SAEnum, Numeric, ForeignKey, Date, Time, DateTime, func, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.base import Base
from enum import Enum
import uuid


class Role(Base):
    __tablename__ = "roles"

    role_id = Column(Integer, primary_key=True, index=True)
    role_name = Column(String(50), unique=True, nullable=False)
    description = Column(Text)


# --------------------------
# USERS
# --------------------------

def generate_user_identity_id():
    """
    System-generated unique user identity
    Example: USR-9f3a2c1d
    """
    return f"USR-{uuid.uuid4().hex[:8]}"


class User(Base):
    __tablename__ = "users"

    # Primary Key
    user_id = Column(Integer, primary_key=True, index=True)

    # System generated unique identity
    user_identity_id = Column(
        String(20),
        unique=True,
        nullable=False,
        default=generate_user_identity_id
    )

    # Login / Identity
    user_name = Column(String(100), unique=True, nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)

    # Personal Info
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    phone = Column(String(15), nullable=False)
    alternative_phone = Column(String(15), nullable=True)

    # Role (FK)
    role_id = Column(
        Integer,
        ForeignKey("roles.role_id"),
        nullable=False
    )

    # Profile
    profile_image_url = Column(String(255), nullable=True)

    # Status Flags
    is_verify = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)

    # Audit Fields
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )
    last_login = Column(DateTime(timezone=True), nullable=True)

    # Relationship
    role = relationship("Role", backref="users")

    # ✅ Computed Property
    @property
    def role_name(self):
        return self.role.role_name if self.role else None
