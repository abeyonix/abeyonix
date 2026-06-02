# app/services/mail/mail_triggers.py

import os
from jinja2 import Environment, FileSystemLoader
from sqlalchemy.orm import Session
from app.db.session import SessionLocal

from app.models.company_settings import CompanySettings
from app.models.product import ProductMedia
from app.utils.email_service import send_email
from app.core.config import settings

# ── Jinja2 Setup ──────────────────────────────────────────────────────────────
TEMPLATES_DIR = os.path.join(os.path.dirname(__file__), "templates")
jinja_env = Environment(loader=FileSystemLoader(TEMPLATES_DIR))

FRONTEND_URL = settings.FRONTEND_URL
MEDIA_BASE_URL = settings.MEDIA_BASE_URL
BACKEND_URL = settings.BACKEND_URL


# ── Helper: fetch company from DB ─────────────────────────────────────────────
def get_company(db: Session):
    return db.query(CompanySettings).first()


# ── Helper: render template ───────────────────────────────────────────────────
def render_template(template_name: str, **context) -> str:
    template = jinja_env.get_template(template_name)
    return template.render(**context)


# ── Helper: attach product image to each order item ───────────────────────────
def attach_product_images(db: Session, order_items: list) -> list:
    enriched = []
    for item in order_items:
        # Fetch primary image for this product
        media = db.query(ProductMedia).filter(
            ProductMedia.product_id == item["product_id"],
            ProductMedia.is_primary == True,
            ProductMedia.media_type == "image"
        ).first()

        enriched.append({
            **item,
            "image_url": media.url if media else None
        })
    return enriched

# ─────────────────────────────────────────────────────────────────────────────
# ✅ MAIL 1 — Order Placed
# ─────────────────────────────────────────────────────────────────────────────
def send_order_placed_email(order, order_items: list, user, address):
    db = SessionLocal()
    try:
        company = get_company(db)
        if not company:
            print("⚠️ Company settings not found — skipping email")
            return
        
        # Attach images to items
        enriched_items = attach_product_images(db, order_items)


        html = render_template(
            "order_placed.html",
            subject      = "We received your order!",
            company      = company,
            order        = order,
            order_items  = enriched_items,
            user        = user,
            address     = address,
            frontend_url = FRONTEND_URL,
            media_url   = MEDIA_BASE_URL,
        )

        send_email(
            to_email     = user.email,
            subject      =  f"We received your order! 🛍️ #{order.order_number}",
            html_content = html,
        )

    except Exception as e:
        print(f"❌ Order placed email failed: {e}")




# ─────────────────────────────────────────────────────────────────────────────
# ✅ MAIL 2 — Order Confirmed (with Invoice Download)
# ─────────────────────────────────────────────────────────────────────────────
def send_order_confirmed_email(order, user, invoice):
    db = SessionLocal()
    try:
        company = get_company(db)
        if not company:
            print("⚠️ Company settings not found")
            return

        # Build the download URL using the secure token
        invoice_download_url = f"{BACKEND_URL}invoices/download/{invoice.download_token}"

        html = render_template(
            "order_confirmed.html",
            subject              = "Your Order is Confirmed!",
            company              = company,
            order                = order,
            user                 = user,
            invoice_download_url = invoice_download_url,
            frontend_url         = FRONTEND_URL,
            media_url            = MEDIA_BASE_URL,
        )
        send_email(
            to_email     = user.email,
            subject      = f"Your Order is Confirmed ✅ #{order.order_number}",
            html_content = html,
        )
    except Exception as e:
        print(f"❌ Order confirmed email failed: {e}")




# ─────────────────────────────────────────────────────────────────────────────
# ✅ MAIL 3 — Order Shipped
# ─────────────────────────────────────────────────────────────────────────────
def send_order_shipped_email(order, user, address, tracking):
    db = SessionLocal()
    try:
        company = get_company(db)
        if not company:
            print("⚠️ Company settings not found")
            return

        html = render_template(
            "order_shipped.html",
            subject      = "Your Order is On the Way!",
            company      = company,
            order        = order,
            user         = user,
            address      = address,
            tracking     = tracking,        # ← full tracking object
            frontend_url = FRONTEND_URL,
            media_url    = MEDIA_BASE_URL,
        )

        send_email(
            to_email     = user.email,
            subject      = f"Your Order is Shipped 🚚 #{order.order_number}",
            html_content = html,
        )

    except Exception as e:
        print(f"❌ Order shipped email failed: {e}")




# ─────────────────────────────────────────────────────────────────────────────
# ✅ MAIL 4 — Order Delivered (with Star Rating)
# ─────────────────────────────────────────────────────────────────────────────
def send_order_delivered_email(order, user, address):
    db = SessionLocal()
    try:
        company = get_company(db)
        if not company:
            print("⚠️ Company settings not found")
            return

        # ── Create rating record with one-time token ───────────────
        from app.models.rating import OrderRating, generate_rating_token
        rating_record = OrderRating(
            order_id = order.id,
            user_id  = order.user_id,
            token    = generate_rating_token(),
        )
        db.add(rating_record)
        db.commit()
        db.refresh(rating_record)

        html = render_template(
            "order_delivered.html",
            subject      = "Your Order Has Been Delivered!",
            company      = company,
            order        = order,
            user         = user,
            address      = address,
            rating_token = rating_record.token,
            api_url      = BACKEND_URL,
            frontend_url = FRONTEND_URL,
            media_url    = MEDIA_BASE_URL,
        )

        send_email(
            to_email     = user.email,
            subject      = f"Your Order is Delivered 📦 #{order.order_number}",
            html_content = html,
        )

    except Exception as e:
        print(f"❌ Order delivered email failed: {e}")