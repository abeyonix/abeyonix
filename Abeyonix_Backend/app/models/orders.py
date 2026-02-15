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

from app.db.base import Base
from app.utils.id_generator import generate_time_based_id


class Order(Base):
    __tablename__ = "orders"

    id = Column(
        BigInteger,
        primary_key=True,
        default=generate_time_based_id
    )

    user_id = Column(BigInteger, nullable=False, index=True)

    order_number = Column(String(50), unique=True, nullable=False, index=True)

    subtotal_amount = Column(Numeric(10, 2), nullable=False)
    discount_amount = Column(Numeric(10, 2), nullable=False, default=0)
    tax_amount = Column(Numeric(10, 2), nullable=False, default=0)
    shipping_amount = Column(Numeric(10, 2), nullable=False, default=0)
    total_amount = Column(Numeric(10, 2), nullable=False)

    order_status = Column(String(50), nullable=False, default="PLACED")
    payment_status = Column(String(50), nullable=False, default="PENDING")

    shipping_address_id = Column(BigInteger, nullable=False)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        onupdate=func.now()
    )

    # Relationship
    items = relationship(
        "OrderItem",
        back_populates="order",
        cascade="all, delete-orphan"
    )





class OrderItem(Base):
    __tablename__ = "order_items"

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

    product_id = Column(
        BigInteger,
        ForeignKey("products.id"),
        nullable=False,
        index=True
    )

    product_name = Column(String(200), nullable=False)
    sku = Column(String(100), nullable=False)

    unit_price = Column(Numeric(10, 2), nullable=False)
    quantity = Column(Integer, nullable=False)
    total_price = Column(Numeric(10, 2), nullable=False)

    # Relationship
    order = relationship("Order", back_populates="items")






class OrderTracking(Base):
    __tablename__ = "order_tracking"

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

    status = Column(String(100), nullable=False)        # SHIPPED, OUT_FOR_DELIVERY, DELIVERED
    description = Column(String(300), nullable=True)    # Human readable message
    location = Column(String(200), nullable=True)       # Current location

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    # Relationship
    order = relationship("Order")