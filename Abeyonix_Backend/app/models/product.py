from sqlalchemy import (
    Column,
    BigInteger,
    Integer,
    String,
    Boolean,
    ForeignKey,
    DateTime,
    Text,
    Numeric,
    Index
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base
from app.utils.id_generator import generate_time_based_id


class Product(Base):
    __tablename__ = "products"

    id = Column(
        BigInteger,
        primary_key=True,
        default=generate_time_based_id
    )

    name = Column(String(150), nullable=False)
    sku = Column(String(100), nullable=False, unique=True, index=True)
    slug = Column(String(150), nullable=False, unique=True, index=True)

    category_id = Column(
        BigInteger,
        ForeignKey("categories.id"),
        nullable=False
    )

    sub_category_id = Column(
        BigInteger,
        ForeignKey("sub_categories.id"),
        nullable=True
    )

    brand = Column(String(150), nullable=True)

    short_description = Column(String(500), nullable=True)
    long_description = Column(Text, nullable=True)

    is_active = Column(Boolean, default=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        onupdate=func.now()
    )

    # Relationships
    category = relationship("Category")
    sub_category = relationship("SubCategory")

    __table_args__ = (
        Index("idx_product_slug_active", "slug", "is_active"),
    )

    # ---------- Computed Properties ----------

    @property
    def category_name(self):
        return self.category.name if self.category else None

    @property
    def sub_category_name(self):
        return self.sub_category.name if self.sub_category else None
    


class ProductAttributeValue(Base):
    __tablename__ = "product_attribute_values"

    id = Column(BigInteger, primary_key=True, default=generate_time_based_id)
    product_id = Column(BigInteger, ForeignKey("products.id"), nullable=False)
    attribute_id = Column(BigInteger, ForeignKey("attributes.id"), nullable=False)
    value = Column(String, nullable=False)

    

class ProductMedia(Base):
    __tablename__ = "product_media"

    id = Column(BigInteger, primary_key=True, default=generate_time_based_id)
    product_id = Column(BigInteger, ForeignKey("products.id"), nullable=False)
    url = Column(String, nullable=False)
    media_type = Column(String, nullable=False)
    is_primary = Column(Boolean, default=False)

    __table_args__ = (
        Index("idx_product_media_primary", "product_id", "is_primary"),
    )


class Pricing(Base):
    __tablename__ = "pricing"

    id = Column(BigInteger, primary_key=True, default=generate_time_based_id)
    product_id = Column(BigInteger, ForeignKey("products.id"), nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    discount_price = Column(Numeric(10, 2), nullable=True)


class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(BigInteger, primary_key=True, default=generate_time_based_id)
    product_id = Column(BigInteger, ForeignKey("products.id"), nullable=False)
    quantity = Column(BigInteger, nullable=False)
    low_quantity_alert_at = Column(Integer, nullable=False)



