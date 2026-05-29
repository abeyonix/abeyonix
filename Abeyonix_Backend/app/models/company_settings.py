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


class CompanySettings(Base):
    __tablename__ = "company_settings"

    id = Column(BigInteger, primary_key=True, default=generate_time_based_id)

    company_name = Column(String(255))
    company_email = Column(String(255))
    company_phone = Column(String(20))

    address_line1 = Column(String(255))
    city = Column(String(100))
    state = Column(String(100))
    postal_code = Column(String(20))
    country = Column(String(100))

    gst_number = Column(String(100))
    website = Column(String(255))

    logo_url = Column(String(500))