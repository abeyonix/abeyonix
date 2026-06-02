# app/schemas/dashboard.py

from pydantic import BaseModel
from typing import List
from decimal import Decimal

class RevenueStats(BaseModel):
    today: float
    this_week: float
    this_month: float
    total: float

class OrderStatusCount(BaseModel):
    status: str
    count: int

class MonthlyRevenue(BaseModel):
    month: str
    revenue: float

class TopProduct(BaseModel):
    product_name: str
    sku: str
    total_quantity: int
    total_revenue: float
    primary_image: str | None = None

class LowStockProduct(BaseModel):
    product_id: int
    product_name: str
    sku: str
    quantity: int
    low_quantity_alert_at: int

class RecentOrder(BaseModel):
    order_id: int
    order_number: str
    total_amount: float
    order_status: str
    payment_status: str
    created_at: str

class DashboardResponse(BaseModel):
    # Revenue
    revenue: RevenueStats

    # Orders
    total_orders: int
    order_status_breakdown: List[OrderStatusCount]
    monthly_revenue: List[MonthlyRevenue]

    # Users
    total_users: int
    new_users_this_month: int

    # Products
    total_products: int
    low_stock_products: List[LowStockProduct]
    top_selling_products: List[TopProduct]

    # Recent
    recent_orders: List[RecentOrder]

    # Services & Inquiries
    total_services: int
    total_inquiries: int
    new_inquiries: int