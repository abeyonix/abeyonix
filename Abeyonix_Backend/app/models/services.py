from sqlalchemy import Column, BigInteger, String, Text
from app.db.base import Base
from app.utils.id_generator import generate_time_based_id


class Service(Base):
    __tablename__ = "services"

    id = Column(
        BigInteger,
        primary_key=True,
        default=generate_time_based_id
    )

    name = Column(
        String(150),
        nullable=False
    )

    email = Column(
        String(255),
        nullable=False,
        index=True
    )

    mobile_number = Column(
        String(20),
        nullable=False
    )

    city = Column(
        String(100),
        nullable=False
    )

    service_type = Column(
        String(100),
        nullable=False
    )

    message = Column(
        Text,
        nullable=True
    )