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


class Category(Base):
    __tablename__ = "categories"

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

    parent_id = Column(
        BigInteger,
        ForeignKey("categories.id"),
        nullable=True
    )

    parent = relationship(
        "Category",
        remote_side=[id],
        backref="children"
    )

