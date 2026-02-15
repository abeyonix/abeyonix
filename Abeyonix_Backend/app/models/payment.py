from sqlalchemy import (
    Column,
    BigInteger,
    String,
    Numeric,
    DateTime,
    ForeignKey,
    Integer,
    Text,
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.sqlite import JSON
from app.db.base import Base
from app.utils.id_generator import generate_time_based_id


class Payment(Base):
    __tablename__ = "payments"

    id = Column(
        BigInteger,
        primary_key=True,
        default=generate_time_based_id
    )

    order_id = Column(
        BigInteger,
        ForeignKey("orders.id"),
        nullable=False,
        index=True
    )

    payment_method = Column(String(50), nullable=False)      # UPI, CARD, COD
    payment_gateway = Column(String(100), nullable=True)     # Razorpay, Stripe
    transaction_id = Column(String(150), nullable=True)

    amount = Column(Numeric(10, 2), nullable=False)
    payment_status = Column(String(50), nullable=False)      # SUCCESS, FAILED, PENDING

    paid_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    # Relationship
    order = relationship("Order")




class PaymentSession(Base):
    __tablename__ = "payment_sessions"

    id = Column(BigInteger, primary_key=True, default=generate_time_based_id)

    transaction_id = Column(String(150), unique=True, index=True)
    user_id = Column(BigInteger, nullable=False)

    flow_type = Column(String(20))  # CART or BUY_NOW

    payload = Column(JSON)  # what to process after success

    amount = Column(Numeric(10,2))
    status = Column(String(20), default="INITIATED")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
