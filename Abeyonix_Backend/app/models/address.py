from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    ForeignKey
)
from sqlalchemy.orm import relationship
from app.db.base import Base


class UserAddress(Base):
    __tablename__ = "user_addresses"

    # 🔑 Primary Key
    address_id = Column(Integer, primary_key=True, index=True)

    # 🔗 User Relation
    user_id = Column(
        Integer,
        ForeignKey("users.user_id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # 📍 Address Info
    address_type = Column(String(20), nullable=False)  # HOME, OFFICE, BILLING, SHIPPING
    address_line1 = Column(String(255), nullable=False)
    address_line2 = Column(String(255), nullable=True)

    city = Column(String(100), nullable=False)
    state_province = Column(String(100), nullable=False)
    postal_code = Column(String(20), nullable=False)
    country = Column(String(100), nullable=False)

    contact_name  = Column(String(100), nullable=False)
    contact_phone = Column(String(20), nullable=False)

    # ⭐ Default Address
    is_default = Column(Boolean, default=False)

    # 🔁 Relationship
    user = relationship("User", backref="addresses")
