# in your orders/admin router or a new dashboard.py router

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, timedelta
from app.db.session import get_db
from app.models.orders import Order, OrderItem, OrderTracking
from app.models.users import User
from app.models.product import Product, ProductMedia, Inventory
from app.models.services import Service
from app.models.inquiry import Inquiry
from app.schemas.dashboard import DashboardResponse

router = APIRouter(prefix="/api/v1/admin", tags=["Admin Dashboard"])

@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard(db: Session = Depends(get_db)):
    now = datetime.utcnow()
    start_of_today = now.replace(hour=0, minute=0, second=0, microsecond=0)
    start_of_week = start_of_today - timedelta(days=now.weekday())
    start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    # ── Revenue ───────────────────────────────────────────────────
    def get_revenue(start):
        result = db.query(func.sum(Order.total_amount)).filter(
            Order.payment_status == "PAID",
            Order.created_at >= start
        ).scalar()
        return float(result or 0)

    revenue = {
        "today":      get_revenue(start_of_today),
        "this_week":  get_revenue(start_of_week),
        "this_month": get_revenue(start_of_month),
        "total":      get_revenue(datetime(2000, 1, 1)),
    }

    # ── Orders ────────────────────────────────────────────────────
    total_orders = db.query(func.count(Order.id)).scalar() or 0

    order_status_breakdown = [
        {"status": row[0], "count": row[1]}
        for row in db.query(Order.order_status, func.count(Order.id))
        .group_by(Order.order_status).all()
    ]

    # ── Monthly Revenue (last 6 months) ───────────────────────────
    monthly_revenue = []
    for i in range(5, -1, -1):
        month_start = (now.replace(day=1) - timedelta(days=30 * i)).replace(
            day=1, hour=0, minute=0, second=0, microsecond=0
        )
        if i > 0:
            month_end = (now.replace(day=1) - timedelta(days=30 * (i - 1))).replace(
                day=1, hour=0, minute=0, second=0, microsecond=0
            )
        else:
            month_end = now

        rev = db.query(func.sum(Order.total_amount)).filter(
            Order.payment_status == "PAID",
            Order.created_at >= month_start,
            Order.created_at < month_end,
        ).scalar()

        monthly_revenue.append({
            "month": month_start.strftime("%b %Y"),
            "revenue": float(rev or 0),
        })

    # ── Users ─────────────────────────────────────────────────────
    total_users = db.query(func.count(User.user_id)).scalar() or 0
    new_users_this_month = db.query(func.count(User.user_id)).filter(
        User.created_at >= start_of_month
    ).scalar() or 0

    # ── Products ──────────────────────────────────────────────────
    total_products = db.query(func.count(Product.id)).filter(
        Product.is_active == True
    ).scalar() or 0

    low_stock = (
    db.query(Inventory, Product)
    .join(Product, Product.id == Inventory.product_id)
    .filter(
        Inventory.quantity <= Inventory.low_quantity_alert_at
    )
    .all()
)

    low_stock_products = [
    {
        "product_id": product.id,
        "product_name": product.name,
        "sku": product.sku,
        "quantity": inventory.quantity,
        "low_quantity_alert_at": inventory.low_quantity_alert_at,
    }
    for inventory, product in low_stock
]

    # ── Top Selling Products ──────────────────────────────────────
    top_selling_rows = (
        db.query(
            OrderItem.product_name,
            OrderItem.sku,
            func.sum(OrderItem.quantity).label("total_quantity"),
            func.sum(OrderItem.total_price).label("total_revenue"),
        )
        .join(Order, Order.id == OrderItem.order_id)
        .filter(Order.payment_status == "PAID")
        .group_by(OrderItem.product_name, OrderItem.sku)
        .order_by(func.sum(OrderItem.quantity).desc())
        .limit(5)
        .all()
    )

    # Get primary images for top products
    top_skus = [row.sku for row in top_selling_rows]
    product_ids_map = {
        p.sku: p.id
        for p in db.query(Product.sku, Product.id).filter(Product.sku.in_(top_skus)).all()
    }
    media_map = {
        m.product_id: m.url
        for m in db.query(ProductMedia).filter(
            ProductMedia.product_id.in_(list(product_ids_map.values())),
            ProductMedia.is_primary == True
        ).all()
    }

    top_selling_products = [
        {
            "product_name":  row.product_name,
            "sku":           row.sku,
            "total_quantity": int(row.total_quantity),
            "total_revenue":  float(row.total_revenue),
            "primary_image":  media_map.get(product_ids_map.get(row.sku)),
        }
        for row in top_selling_rows
    ]

    # ── Recent Orders (last 5) ────────────────────────────────────
    recent = db.query(Order).order_by(Order.created_at.desc()).limit(5).all()
    recent_orders = [
        {
            "order_id":      o.id,
            "order_number":  o.order_number,
            "total_amount":  float(o.total_amount),
            "order_status":  o.order_status,
            "payment_status": o.payment_status,
            "created_at":    o.created_at.isoformat(),
        }
        for o in recent
    ]

    # ── Services & Inquiries ──────────────────────────────────────
    total_services  = db.query(func.count(Service.id)).scalar() or 0
    total_inquiries = db.query(func.count(Inquiry.id)).scalar() or 0
    new_inquiries   = db.query(func.count(Inquiry.id)).filter(
        Inquiry.status == "NEW"
    ).scalar() or 0

    return {
        "revenue":                revenue,
        "total_orders":           total_orders,
        "order_status_breakdown": order_status_breakdown,
        "monthly_revenue":        monthly_revenue,
        "total_users":            total_users,
        "new_users_this_month":   new_users_this_month,
        "total_products":         total_products,
        "low_stock_products":     low_stock_products,
        "top_selling_products":   top_selling_products,
        "recent_orders":          recent_orders,
        "total_services":         total_services,
        "total_inquiries":        total_inquiries,
        "new_inquiries":          new_inquiries,
    }