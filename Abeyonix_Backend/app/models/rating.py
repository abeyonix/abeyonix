# app/models/rating.py

import secrets
from sqlalchemy import (
    BigInteger, Boolean, Column, DateTime,
    ForeignKey, Integer, String, Text
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base
from app.utils.id_generator import generate_time_based_id


def generate_rating_token():
    return secrets.token_urlsafe(48)


class OrderRating(Base):
    __tablename__ = "order_ratings"

    id = Column(BigInteger, primary_key=True, default=generate_time_based_id)

    order_id = Column(
        BigInteger,
        ForeignKey("orders.id"),
        unique=True,          # one rating per order
        nullable=False,
        index=True
    )

    user_id = Column(
        BigInteger,
        ForeignKey("users.user_id"),
        nullable=False,
        index=True
    )

    # ⭐ Rating
    rating  = Column(Integer,  nullable=True)    # 1–5, filled after customer rates
    message = Column(Text,     nullable=True)    # optional review message

    # 🔐 Secure token
    token      = Column(String(200), unique=True, nullable=False,
                        default=generate_rating_token)
    token_used = Column(Boolean, default=False, nullable=False)

    # 🕐 Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    rated_at   = Column(DateTime(timezone=True), nullable=True)  # when customer submitted

    # Relationships
    order = relationship("Order")
    user  = relationship("User")