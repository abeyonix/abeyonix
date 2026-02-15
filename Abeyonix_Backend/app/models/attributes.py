from sqlalchemy import Column, BigInteger, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.utils.id_generator import generate_time_based_id

class Attribute(Base):
    __tablename__ = "attributes"

    id = Column(BigInteger, primary_key=True, default=generate_time_based_id)
    name = Column(String(150), nullable=False)
    unit = Column(String(50), nullable=True)
    data_type = Column(String(50), nullable=True)

# -------------------------------
# category attribute
# -------------------------------



class CategoryAttribute(Base):
    __tablename__ = "category_attributes"

    id = Column(
        BigInteger,
        primary_key=True,
        default=generate_time_based_id
    )

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

    attribute_id = Column(
        BigInteger,
        ForeignKey("attributes.id"),
        nullable=False
    )

    # Relationships
    category = relationship("Category")
    sub_category = relationship("SubCategory")
    attribute = relationship("Attribute")

    # ---------- Computed Properties ----------

    @property
    def category_name(self):
        return self.category.name if self.category else None

    @property
    def sub_category_name(self):
        return self.sub_category.name if self.sub_category else None