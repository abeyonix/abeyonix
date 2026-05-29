from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.sql import func
from decimal import Decimal
import razorpay
import uuid
import json
import httpx
from app.core.config import *
from app.utils.phonepe import *
from app.db.session import get_db
from app.models.users import User
from app.models.address import UserAddress
from app.models.product import Product, Pricing, Inventory
from app.models.orders import Order, OrderItem, PendingOrder
from app.models.cart import CartItem
from app.models.payment import PaymentSession, Payment
from app.schemas.payment import *
from app.core.config import settings

router = APIRouter(prefix="/api/v1", tags=["Payment"])

RAZORPAY_KEY_ID = settings.RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET = settings.RAZORPAY_KEY_SECRET

client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))




@router.post("/initiate-payment", response_model=InitiatePaymentResponse)
def initiate_payment(
    request: InitiatePaymentRequest,
    db: Session = Depends(get_db)
):
    # ── Validate user ──────────────────────────────────────────────
    user = db.query(User).filter(User.user_id == request.user_id).first()
    if not user:
        raise HTTPException(404, "User not found")

    # ── Validate address ───────────────────────────────────────────
    address = db.query(UserAddress).filter(
        UserAddress.address_id == request.address_id,
        UserAddress.user_id    == request.user_id
    ).first()
    if not address:
        raise HTTPException(400, "Invalid address")

    # ── Calculate subtotal (NO stock deduction here) ───────────────
    subtotal = Decimal("0.00")

    if request.product_id is None:
        # Cart flow
        cart_items = db.query(CartItem).filter(
            CartItem.user_id  == request.user_id,
            CartItem.is_active == True
        ).all()

        if not cart_items:
            raise HTTPException(400, "Cart is empty")

        for item in cart_items:
            # Just check stock exists — don't deduct yet
            inventory = db.query(Inventory).filter(
                Inventory.product_id == item.product_id
            ).first()
            if not inventory or inventory.quantity < item.quantity:
                raise HTTPException(
                    400, f"Insufficient stock for {item.product.name}"
                )
            subtotal += item.unit_price * item.quantity

    else:
        # Buy Now flow
        product = db.query(Product).filter(
            Product.id == request.product_id
        ).first()
        if not product:
            raise HTTPException(404, "Product not found")

        pricing = db.query(Pricing).filter(
            Pricing.product_id == product.id
        ).first()
        if not pricing:
            raise HTTPException(400, "Pricing not found")

        inventory = db.query(Inventory).filter(
            Inventory.product_id == product.id
        ).first()
        if not inventory or inventory.quantity < request.quantity:
            raise HTTPException(400, "Insufficient stock")

        unit_price = pricing.discount_price or pricing.price
        subtotal   = unit_price * request.quantity

    # ── Totals ─────────────────────────────────────────────────────
    tax          = subtotal * Decimal("0.02")
    shipping     = Decimal("0.00")
    total_amount = subtotal + tax + shipping
    amount_paise = int(total_amount * 100)          # Razorpay needs paise

    # ── Create Razorpay order ──────────────────────────────────────
    rz_order = client.order.create({
        "amount":   amount_paise,
        "currency": "INR",
        "payment_capture": 1                        # auto-capture
    })

    # ── Save PendingOrder ──────────────────────────────────────────
    pending = PendingOrder(
        user_id           = request.user_id,
        address_id        = request.address_id,
        product_id        = request.product_id,
        quantity          = request.quantity,
        razorpay_order_id = rz_order["id"],
        subtotal          = subtotal,
        shipping          = shipping,
        tax               = tax,
        total_amount      = total_amount,
        status            = "PENDING"
    )
    db.add(pending)
    db.commit()

    return {
        "razorpay_order_id": rz_order["id"],
        "amount":            amount_paise,
        "currency":          "INR",
        "key_id":            RAZORPAY_KEY_ID
    }









