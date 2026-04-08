from sqlalchemy import Column, BigInteger, String, Text, DateTime
from sqlalchemy.sql import func

from app.db.base import Base
from app.utils.id_generator import generate_time_based_id


class Inquiry(Base):
    __tablename__ = "inquiries"

    id = Column(
        BigInteger,
        primary_key=True,
        default=generate_time_based_id
    )

    name = Column(String(150), nullable=False)
    email = Column(String(150), nullable=False, index=True)
    telephone = Column(String(20), nullable=True)

    message = Column(Text, nullable=False)

    status = Column(
        String(50),
        nullable=False,
        default="NEW"   # NEW, IN_PROGRESS, RESOLVED
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        onupdate=func.now()
    )