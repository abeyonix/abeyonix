from sqlalchemy import Column, Integer, BigInteger, String, ForeignKey, Numeric, Boolean, DateTime, func
from sqlalchemy.orm import relationship
from app.db.base import Base  # adjust import according to your project
from app.utils.id_generator import generate_time_based_id  # optional if you use custom ID

class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(BigInteger, primary_key=True, default=generate_time_based_id)
    
    # 🔗 Relations
    user_id = Column(BigInteger, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    product_id = Column(BigInteger, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)

    # Session
    session_id = Column(String(255), nullable=True)  # optional if guest user

    # Cart details
    quantity = Column(Integer, nullable=False, default=1)
    unit_price = Column(Numeric(10, 2), nullable=False)
    total_price = Column(Numeric(10, 2), nullable=False)

    is_active = Column(Boolean, default=True)

    # Audit fields
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", backref="cart_items")
    product = relationship("Product", backref="cart_items")
