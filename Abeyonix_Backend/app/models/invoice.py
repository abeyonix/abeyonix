# app/models/invoice.py

import secrets
from datetime import datetime, timedelta, timezone

from sqlalchemy import BigInteger, Column, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship

from app.db.base import Base
from app.utils.id_generator import generate_time_based_id


def generate_invoice_number():
    from datetime import datetime
    now = datetime.now()
    rand = secrets.token_hex(3).upper()
    return f"INV-{now.strftime('%Y%m')}-{rand}"


def generate_download_token():
    return secrets.token_urlsafe(48)


def token_expiry():
    # Token valid for 30 days
    return datetime.now(timezone.utc) + timedelta(days=30)


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(BigInteger, primary_key=True, default=generate_time_based_id)

    order_id = Column(
        BigInteger,
        ForeignKey("orders.id"),
        unique=True,          # one invoice per order
        nullable=False,
        index=True
    )

    invoice_number = Column(String(50), unique=True, nullable=False,
                            default=generate_invoice_number)

    # Local file path — e.g. invoices/INV-202501-AB12CD.pdf
    pdf_path = Column(String(500), nullable=False)

    # Secure token for download link (no auth needed, token is the secret)
    download_token = Column(String(200), unique=True, nullable=False,
                            default=generate_download_token)

    token_expires_at = Column(DateTime(timezone=True), nullable=False,
                              default=token_expiry)

    created_at = Column(DateTime(timezone=True), server_default="now()")

    # Relationship
    order = relationship("Order")