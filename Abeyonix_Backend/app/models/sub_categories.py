from sqlalchemy import (
    Column,
    BigInteger,
    String,
    Boolean,
    ForeignKey,
    Text
)
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.utils.id_generator import generate_time_based_id


class SubCategory(Base):
    __tablename__ = "sub_categories"

    id = Column(
        BigInteger,
        primary_key=True,
        default=generate_time_based_id
    )

    name = Column(String(150), nullable=False)
    slug = Column(String(150), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
    image_path = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)

    category_id = Column(
        BigInteger,
        ForeignKey("categories.id"),
        nullable=False
    )

    category = relationship(
        "Category",
    )

    @property
    def category_name(self):
        return self.category.name if self.category else None
