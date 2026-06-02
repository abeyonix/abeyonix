from fastapi import APIRouter, Depends, HTTPException, status, Query as FastQuery
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.sql import func
from sqlalchemy import or_
from decimal import Decimal
import hmac, hashlib
import uuid
import json
from fastapi import BackgroundTasks
from app.core.config import *
from app.utils.phonepe import *
from app.utils.order_no_generator import *
from app.db.session import get_db, SessionLocal
from app.models.orders import Order, OrderItem, OrderTracking, PendingOrder
from app.models.cart import CartItem
from app.models.users import User
from app.models.address import UserAddress
from app.models.product import Inventory, ProductMedia, Pricing, Product
from app.models.company_settings import CompanySettings
from app.schemas.orders import *
from app.utils.email_templates import order_notification_email
from app.services.user_service import get_admin_emails
from app.utils.email_service import send_email
from app.core.config import Settings
from app.services.mail.mail_triggers import( send_order_delivered_email, send_order_placed_email, 
                                            send_order_confirmed_email, 
                                            send_order_shipped_email,)
from app.models.address import UserAddress
from app.services.invoice.invoice_service import generate_invoice_pdf


router = APIRouter(prefix="/api/v1/orders", tags=["Orders"])

RAZORPAY_KEY_ID = settings.RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET = settings.RAZORPAY_KEY_SECRET

CANCEL_ALLOWED_STATUSES = [
    "PLACED",
    "CONFIRMED",
]

@router.get("/checkout-page", response_model=CheckoutPageResponse)
def get_checkout_page_data(
    user_id: int = FastQuery(...),
    product_id: int | None = FastQuery(None),
    quantity: int = FastQuery(1),
    db: Session = Depends(get_db)
):
    # 1️⃣ User
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")

    # 2️⃣ Default Address
    addresses = db.query(UserAddress).filter(
        UserAddress.user_id == user_id
    ).all()

    
    
    address_data = []

    for addr in addresses:
        address_data.append({
            "address_id": addr.address_id,
            "contact_name": addr.contact_name,
            "contact_phone": addr.contact_phone,
            "address_line1": addr.address_line1,
            "address_line2": addr.address_line2,
            "city": addr.city,
            "state_province": addr.state_province    ,
            "postal_code": addr.postal_code,
            "country": addr.country,
            "is_default": addr.is_default  # ⭐ important for UI
        })

    products_data = []
    subtotal = Decimal("0.00")

    # ================= CART FLOW =================
    if product_id is None:
        cart_items = db.query(CartItem).filter(
            CartItem.user_id == user_id,
            CartItem.is_active == True
        ).all()

        if not cart_items:
            raise HTTPException(400, "Cart is empty")

        for item in cart_items:
            primary_image = db.query(ProductMedia.url).filter(
                ProductMedia.product_id == item.product_id,
                ProductMedia.is_primary == True
            ).scalar()

            line_total = item.unit_price * item.quantity
            subtotal += line_total

            products_data.append({
                "product_id": item.product_id,
                "product_name": item.product.name,
                "sku": item.product.sku,
                "unit_price": item.unit_price,
                "quantity": item.quantity,
                "total_price": line_total,
                "primary_image": primary_image
            })

    # ================= BUY NOW FLOW =================
    else:
        product = db.query(Product).filter(
            Product.id == product_id
        ).first()

        if not product:
            raise HTTPException(404, "Product not found")

        pricing = db.query(Pricing).filter(
            Pricing.product_id == product.id
        ).first()

        unit_price = pricing.discount_price or pricing.price

        primary_image = db.query(ProductMedia.url).filter(
            ProductMedia.product_id == product.id,
            ProductMedia.is_primary == True
        ).scalar()

        line_total = unit_price * quantity
        subtotal += line_total

        products_data.append({
            "product_id": product.id,
            "product_name": product.name,
            "sku": product.sku,
            "unit_price": unit_price,
            "quantity": quantity,
            "total_price": line_total,
            "primary_image": primary_image
        })

    # 3️⃣ Totals
    tax = subtotal * Decimal("0.00")
    shipping = Decimal("0.00")
    total_amount = subtotal + tax + shipping

    return {
        "user": user,
        "address": address_data,
        "products": products_data,
        "subtotal": subtotal,
        "tax": tax,
        "shipping": shipping,
        "total_amount": total_amount
    }

#---------------------------------------------------
#
# --------------------------------------------------

def send_order_emails( order, order_items, user):
    db = SessionLocal()
    try:
        admin_emails = get_admin_emails(db)
        if admin_emails:
            html_content = order_notification_email(order, order_items, user)
            for email in admin_emails:
                send_email(
                    to_email=email,
                    subject=f"New Order Received - {order.order_number}",
                    html_content=html_content
                )
    except Exception as e:
        print("Admin email error:", e)
    finally:
        db.close()




@router.post("/verify-payment", response_model=PlaceOrderResponse)
def verify_payment(
    request: VerifyPaymentRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    # ── 1. Verify signature (MOST IMPORTANT STEP) ──────────────────
    body        = f"{request.razorpay_order_id}|{request.razorpay_payment_id}"
    expected_sig = hmac.new(
        RAZORPAY_KEY_SECRET.encode(),
        body.encode(),
        hashlib.sha256
    ).hexdigest()

    if expected_sig != request.razorpay_signature:
        raise HTTPException(400, "Payment verification failed — invalid signature")

    # ── 2. Load PendingOrder ───────────────────────────────────────
    pending = db.query(PendingOrder).filter(
        PendingOrder.razorpay_order_id == request.razorpay_order_id
    ).first()

    if not pending:
        raise HTTPException(404, "Order session not found")

    if pending.status != "PENDING":
        raise HTTPException(400, f"Order already processed: {pending.status}")

    user = db.query(User).filter(User.user_id == pending.user_id).first()

    # ── 3. Re-check stock + deduct (with row lock) ─────────────────
    order_items = []

    if pending.product_id is None:
        # Cart flow
        cart_items = db.query(CartItem).filter(
            CartItem.user_id   == pending.user_id,
            CartItem.is_active == True
        ).all()

        if not cart_items:
            pending.status = "FAILED"
            db.commit()
            raise HTTPException(400, "Cart is empty")

        for item in cart_items:
            inventory = db.query(Inventory).filter(
                Inventory.product_id == item.product_id
            ).with_for_update().first()

            if not inventory or inventory.quantity < item.quantity:
                pending.status = "FAILED"
                db.commit()
                raise HTTPException(
                    400,
                    f"Stock changed during payment for {item.product.name}. "
                    "A refund will be issued within 5–7 business days."
                )

            # inventory.quantity -= item.quantity
            line_total = item.unit_price * item.quantity

            order_items.append({
                "product_id":   item.product_id,
                "product_name": item.product.name,
                "sku":          item.product.sku,
                "unit_price":   item.unit_price,
                "quantity":     item.quantity,
                "total_price":  line_total
            })

    else:
        # Buy Now flow
        product = db.query(Product).filter(
            Product.id == pending.product_id
        ).first()

        pricing = db.query(Pricing).filter(
            Pricing.product_id == product.id
        ).first()

        inventory = db.query(Inventory).filter(
            Inventory.product_id == product.id
        ).with_for_update().first()

        if not inventory or inventory.quantity < pending.quantity:
            pending.status = "FAILED"
            db.commit()
            raise HTTPException(
                400,
                "Stock changed during payment. "
                "A refund will be issued within 5–7 business days."
            )

        # inventory.quantity -= pending.quantity
        unit_price = pricing.discount_price or pricing.price
        line_total = unit_price * pending.quantity

        order_items.append({
            "product_id":   product.id,
            "product_name": product.name,
            "sku":          product.sku,
            "unit_price":   unit_price,
            "quantity":     pending.quantity,
            "total_price":  line_total
        })

    # ── 4. Create Order ────────────────────────────────────────────
    order = Order(
        user_id             = pending.user_id,
        order_number        = generate_order_number(),
        subtotal_amount     = pending.subtotal,
        discount_amount     = Decimal("0.00"),
        tax_amount          = pending.tax,
        shipping_amount     = pending.shipping,
        total_amount        = pending.total_amount,
        order_status        = "PLACED",
        payment_status      = "PAID",               # ← PAID, not PENDING
        shipping_address_id = pending.address_id
    )
    db.add(order)
    db.flush()

    # ── 5. Order Items ─────────────────────────────────────────────
    for item in order_items:
        db.add(OrderItem(
            order_id     = order.id,
            product_id   = item["product_id"],
            product_name = item["product_name"],
            sku          = item["sku"],
            unit_price   = item["unit_price"],
            quantity     = item["quantity"],
            total_price  = item["total_price"]
        ))

    # ── 6. Tracking ────────────────────────────────────────────────
    db.add(OrderTracking(
        order_id    = order.id,
        status      = "PLACED",
        description = "Order placed and payment confirmed"
    ))

    # ── 7. Clear Cart ──────────────────────────────────────────────
    if pending.product_id is None:
        db.query(CartItem).filter(
            CartItem.user_id   == pending.user_id,
            CartItem.is_active == True
        ).update({"is_active": False})

    # ── 8. Mark pending order as PAID ──────────────────────────────
    pending.status = "PAID"

    db.commit()

    # ── 9. Fetch address for email ─────────────────────────────────────────────
    address = db.query(UserAddress).filter(
        UserAddress.address_id == pending.address_id
    ).first()

    # ── 10. Send customer email ────────────────────────────────────────────────
    background_tasks.add_task(
        send_order_placed_email, order, order_items, user, address
    )

    # ── 11. Send admin email (your existing one) ───────────────────────────────
    background_tasks.add_task(
        send_order_emails, order, order_items, user
    )

    return {
        "order_id":     order.id,
        "order_number": order.order_number,
        "total_amount": order.total_amount,
        "order_status": order.order_status
    }






@router.post("/place-order", response_model=PlaceOrderResponse)
def place_order(
    request: PlaceOrderRequest,
    background_tasks: BackgroundTasks, 
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(User.user_id == request.user_id).first()
    if not user:
        raise HTTPException(404, "User not found")

    # validate address
    address = db.query(UserAddress).filter(
        UserAddress.address_id == request.address_id,
        UserAddress.user_id == request.user_id
    ).first()

    if not address:
        raise HTTPException(400, "Invalid address")

    order_items = []
    subtotal = Decimal("0.00")

    # ================= CART FLOW =================
    if request.product_id is None:

        cart_items = db.query(CartItem).filter(
            CartItem.user_id == request.user_id,
            CartItem.is_active == True
        ).all()

        if not cart_items:
            raise HTTPException(400, "Cart is empty")

        for item in cart_items:
            inventory = db.query(Inventory).filter(
                Inventory.product_id == item.product_id
            ).with_for_update().first()   # 🔒 LOCK ROW

            if not inventory or inventory.quantity < item.quantity:
                raise HTTPException(
                    400,
                    f"Insufficient stock for {item.product.name}"
                )

            # ✅ Reduce stock
            inventory.quantity -= item.quantity

            line_total = item.unit_price * item.quantity
            subtotal += line_total

            order_items.append({
                "product_id": item.product_id,
                "product_name": item.product.name,
                "sku": item.product.sku,
                "unit_price": item.unit_price,
                "quantity": item.quantity,
                "total_price": line_total
            })

    # ================= BUY NOW FLOW =================
    else:

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
        ).with_for_update().first()

        if not inventory or inventory.quantity < request.quantity:
            raise HTTPException(400, "Insufficient stock")

        # ✅ Reduce stock
        inventory.quantity -= request.quantity

        unit_price = pricing.discount_price or pricing.price

        line_total = unit_price * request.quantity
        subtotal += line_total

        order_items.append({
            "product_id": product.id,
            "product_name": product.name,
            "sku": product.sku,
            "unit_price": unit_price,
            "quantity": request.quantity,
            "total_price": line_total
        })

    # ================= TOTAL CALCULATION =================

    tax = subtotal * Decimal("0.00")
    shipping = Decimal("50.00")
    total_amount = subtotal + tax + shipping

    # ================= CREATE ORDER =================

    order = Order(
        user_id=request.user_id,
        order_number=generate_order_number(),
        subtotal_amount=subtotal,
        discount_amount=Decimal("0.00"),
        tax_amount=tax,
        shipping_amount=shipping,
        total_amount=total_amount,
        order_status="PLACED",
        payment_status="PENDING",
        shipping_address_id=request.address_id
    )

    db.add(order)
    db.flush()  # get order.id

    # ================= CREATE ORDER ITEMS =================

    for item in order_items:
        db.add(OrderItem(
            order_id=order.id,
            product_id=item["product_id"],
            product_name=item["product_name"],
            sku=item["sku"],
            unit_price=item["unit_price"],
            quantity=item["quantity"],
            total_price=item["total_price"]
        ))

    # ================= ORDER TRACKING =================

    db.add(OrderTracking(
        order_id=order.id,
        status="PLACED",
        description="Order successfully placed"
    ))

    # ================= CLEAR CART =================

    if request.product_id is None:
        db.query(CartItem).filter(
            CartItem.user_id == request.user_id,
            CartItem.is_active == True
        ).update({"is_active": False})

    db.commit()

    # ================= SEND EMAIL TO ADMINS =================

    # ✅ NON-BLOCKING
    background_tasks.add_task(
        send_order_emails,
        db,
        order,
        order_items,
        user
    )

    return {
        "order_id": order.id,
        "order_number": order.order_number,
        "total_amount": order.total_amount,
        "order_status": order.order_status
    }


#---------------------------------------------------
#
# --------------------------------------------------









@router.get("/{order_identifier}", response_model=OrderDetailsResponse)
def get_order_details(
    order_identifier: str,
    db: Session = Depends(get_db)
):

    # =====================================================
    # GET ORDER USING:
    # 1. ORDER ID
    # 2. ORDER NUMBER
    # =====================================================

    if order_identifier.isdigit():

        # Search using ORDER ID
        order = (
            db.query(Order)
            .filter(Order.id == int(order_identifier))
            .first()
        )

    else:

        # Search using ORDER NUMBER
        order = (
            db.query(Order)
            .filter(Order.order_number == order_identifier)
            .first()
        )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )
    
    # =====================================================
    # GET ORDER TRACKING HISTORY
    # =====================================================
    
    tracking_history = (
        db.query(OrderTracking)
        .filter(OrderTracking.order_id == order.id)
        .order_by(OrderTracking.updated_at.desc())
        .all()
    )

    # =====================================================
    # GET SHIPPING ADDRESS
    # =====================================================

    shipping_address = (
        db.query(UserAddress)
        .filter(
            UserAddress.address_id == order.shipping_address_id
        )
        .first()
    )

    # =====================================================
    # ORDER ITEMS
    # =====================================================

    item_responses = []

    for item in order.items:

        primary_image = (
            db.query(ProductMedia.url)
            .filter(
                ProductMedia.product_id == item.product_id,
                ProductMedia.is_primary == True
            )
            .scalar()
        )

        item_responses.append({
            "product_id": item.product_id,
            "product_name": item.product_name,
            "sku": item.sku,
            "unit_price": item.unit_price,
            "quantity": item.quantity,
            "total_price": item.total_price,
            "primary_image": primary_image
        })

    # =====================================================
    # RETURN RESPONSE
    # =====================================================

    return {
        "order_id": order.id,
        "order_number": order.order_number,

        "order_status": order.order_status,
        "payment_status": order.payment_status,

        "subtotal_amount": order.subtotal_amount,
        "tax_amount": order.tax_amount,
        "shipping_amount": order.shipping_amount,
        "discount_amount": order.discount_amount,
        "total_amount": order.total_amount,

        "created_at": order.created_at,

        # ✅ TRACKING HISTORY
        "tracking": tracking_history,
        # ✅ SHIPPING ADDRESS
        "shipping_address": shipping_address,

        # ✅ ITEMS
        "items": item_responses,

    }






@router.get("/user/{user_id}", response_model=UserOrderListResponse)
def get_user_orders(user_id: int, db: Session = Depends(get_db)):

    # Load orders with items in single go
    orders = (
        db.query(Order)
        .options(joinedload(Order.items))
        .filter(Order.user_id == user_id)
        .order_by(Order.created_at.desc())
        .all()
    )

    # Get all product_ids from all items
    product_ids = {
        item.product_id
        for order in orders
        for item in order.items
    }

    # Fetch all primary images in one query
    media_rows = (
        db.query(ProductMedia.product_id, ProductMedia.url)
        .filter(
            ProductMedia.product_id.in_(product_ids),
            ProductMedia.is_primary == True
        )
        .all()
    )

    # Map: product_id -> image
    image_map = {pid: url for pid, url in media_rows}

     # ================= TRACKING =================

    order_ids = [order.id for order in orders]

    tracking_rows = (
        db.query(OrderTracking)
        .filter(OrderTracking.order_id.in_(order_ids))
        .order_by(OrderTracking.updated_at.asc())
        .all()
    )

    # Map: order_id -> list of tracking
    tracking_map = {}

    for row in tracking_rows:
        tracking_map.setdefault(row.order_id, []).append({
            "status": row.status,
            "description": row.description,
            "location": row.location,
            "updated_at": row.updated_at,
            "tracking_id": row.tracking_id,
            "carrier_name": row.carrier_name,
            "tracking_url": row.tracking_url
        })

    order_list = []

    for order in orders:
        item_list = []

        for item in order.items:
            item_list.append({
                "product_id": item.product_id,
                "product_name": item.product_name,
                "sku": item.sku,
                "quantity": item.quantity,
                "unit_price": item.unit_price,
                "total_price": item.total_price,
                "primary_image": image_map.get(item.product_id)
            })

        order_list.append({
            "order_id": order.id,
            "order_number": order.order_number,
            "order_status": order.order_status,
            "payment_status": order.payment_status,
            "total_amount": order.total_amount,
            "created_at": order.created_at,
            "items": item_list,
            "tracking": tracking_map.get(order.id, [])
        })

    return {
        "total_orders": len(order_list),
        "orders": order_list
    }




@router.get("/admin/", response_model=AdminOrderListResponse)
def get_all_orders(
    page: int = 1,
    page_size: int = 10,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Order)

    # ================= SEARCH =================
    if search:
        query = query.filter(
            (Order.order_number.ilike(f"%{search}%")) |
            (Order.id == search if search.isdigit() else False)
        )

    # ================= TOTAL COUNT =================
    total_count = query.count()

    # ================= PAGINATION =================
    orders = (
        query
        .options(joinedload(Order.items))
        .order_by(Order.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    # ================= PRODUCT IDS =================
    product_ids = {
        item.product_id
        for order in orders
        for item in order.items
    }

    # ================= MEDIA =================
    media_rows = (
        db.query(ProductMedia.product_id, ProductMedia.url)
        .filter(
            ProductMedia.product_id.in_(product_ids),
            ProductMedia.is_primary == True
        )
        .all()
    )

    image_map = {pid: url for pid, url in media_rows}

    # ================= TRACKING =================
    order_ids = [order.id for order in orders]

    tracking_rows = (
        db.query(OrderTracking)
        .filter(OrderTracking.order_id.in_(order_ids))
        .order_by(OrderTracking.updated_at.asc())
        .all()
    )

    tracking_map = {}

    for row in tracking_rows:
        tracking_map.setdefault(row.order_id, []).append({
            "status": row.status,
            "description": row.description,
            "location": row.location,
            "updated_at": row.updated_at,
            "tracking_id": row.tracking_id,
            "carrier_name": row.carrier_name,
            "tracking_url": row.tracking_url
        })

    # ================= BUILD RESPONSE =================
    order_list = []

    for order in orders:
        items = []

        for item in order.items:
            items.append({
                "product_id": item.product_id,
                "product_name": item.product_name,
                "sku": item.sku,
                "quantity": item.quantity,
                "unit_price": item.unit_price,
                "total_price": item.total_price,
                "primary_image": image_map.get(item.product_id)
            })

        order_list.append({
            "order_id": order.id,
            "order_number": order.order_number,
            "order_status": order.order_status,
            "payment_status": order.payment_status,
            "total_amount": order.total_amount,
            "created_at": order.created_at,
            "items": items,
            "tracking": tracking_map.get(order.id, [])
        })

    # ================= WIDGETS =================
    total_orders = db.query(Order).count()

    delivered_orders = db.query(Order).filter(
        Order.order_status == "DELIVERED"
    ).count()

    active_orders = db.query(Order).filter(
        Order.order_status.notin_(["DELIVERED", "CANCELLED"])
    ).count()

    widgets = {
        "total_orders": total_orders,
        "active_orders": active_orders,
        "delivered_orders": delivered_orders
    }

    return {
        "total_orders": len(order_list),
        "page": page,
        "page_size": page_size,
        "total_count": total_count,
        "widgets": widgets,
        "orders": order_list
    }



def _handle_confirmed(order):
    """
    Runs when admin sets status → CONFIRMED:
      1. Deduct stock (with row lock)
      2. Generate invoice PDF
      3. Send confirmation email
    """

    db = SessionLocal()

    # ── 1. Fetch order items ───────────────────────────────────────
    db_items = db.query(OrderItem).filter(
        OrderItem.order_id == order.id
    ).all()

    order_items_list = []

    for item in db_items:
        # ── 2. Deduct stock with row lock ──────────────────────────
        inventory = db.query(Inventory).filter(
            Inventory.product_id == item.product_id
        ).with_for_update().first()

        if not inventory or inventory.quantity < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for '{item.product_name}'. "
                       "Cannot confirm order."
            )

        inventory.quantity -= item.quantity

        order_items_list.append({
            "product_id":   item.product_id,
            "product_name": item.product_name,
            "sku":          item.sku,
            "unit_price":   item.unit_price,
            "quantity":     item.quantity,
            "total_price":  item.total_price,
        })

    db.flush()  # flush inventory changes before generating invoice

    # ── 3. Fetch user + address + company ──────────────────────────
    user    = db.query(User).filter(User.user_id == order.user_id).first()
    address = db.query(UserAddress).filter(
        UserAddress.address_id == order.shipping_address_id
    ).first()
    company = db.query(CompanySettings).first()

    # ── 4. Generate invoice PDF and save to DB ─────────────────────
    invoice = generate_invoice_pdf(
        db          = db,
        order       = order,
        order_items = order_items_list,
        user        = user,
        address     = address,
        company     = company,
    )

    # ── 5. Queue confirmation email ────────────────────────────────
    send_order_confirmed_email(
    order,
    user,
    invoice
)


def handle_confirmed_background(order_id: int):
    db = SessionLocal()

    try:
        order = db.query(Order).filter(Order.id == order_id).first()

        if order:
            _handle_confirmed(order)

        db.commit()

    except Exception as e:
        db.rollback()
        print("Confirm background error:", e)

    finally:
        db.close()



# ── add this helper alongside _handle_confirmed ────────────────────────────
def _handle_shipped(db: Session, background_tasks: BackgroundTasks, order, tracking):
    """Runs when admin sets status → SHIPPED"""

    user    = db.query(User).filter(User.user_id == order.user_id).first()
    address = db.query(UserAddress).filter(
        UserAddress.address_id == order.shipping_address_id
    ).first()

    background_tasks.add_task(
        send_order_shipped_email, order, user, address, tracking
    )


def _handle_delivered(db: Session, background_tasks: BackgroundTasks, order):
    """Runs when admin sets status → DELIVERED"""

    user    = db.query(User).filter(User.user_id == order.user_id).first()
    address = db.query(UserAddress).filter(
        UserAddress.address_id == order.shipping_address_id
    ).first()

    background_tasks.add_task(
        send_order_delivered_email, order, user, address
    )




@router.post("/update-tracking", status_code=200)
def update_order_tracking(
    request: UpdateOrderTrackingRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    # 🔍 Check order exists
    order = db.query(Order).filter(Order.id == request.order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # 📝 Add tracking record
    tracking = OrderTracking(
    order_id=request.order_id,
    status=request.status,
    description=request.description,
    location=request.location,

    tracking_id=request.tracking_id,
    carrier_name=request.carrier_name,
    tracking_url=request.tracking_url
)

    db.add(tracking)
    db.flush()   # ← get tracking.id + updated_at before commit

    # 🔄 Update order status (latest status)
    order.order_status = request.status

    # ── Handle CONFIRMED specifically ─────────────────────────────
    if request.status and request.status.strip().lower() in [
            "confirmed",
            "confirm",
        ]:
        # _handle_confirmed(db, background_tasks, order)
        
        # background_tasks.add_task(
        #     handle_confirmed_background,
        #     order.id
        # )

        background_tasks.add_task(
            handle_confirmed_background,
            order.id
        )
    elif request.status == "SHIPPED":
        _handle_shipped(db, background_tasks, order, tracking)
    
    elif request.status == "DELIVERED":
        _handle_delivered(db, background_tasks, order)

    db.commit()

    return {
        "message": "Order tracking updated successfully",
        "order_id": order.id,
        "current_status": order.order_status
    }




@router.post("/cancel-order/{order_id}", status_code=200)
def cancel_order(
    order_id: int,
    db: Session = Depends(get_db)
):
    # 🔍 Find order
    order = db.query(Order).filter(Order.id == order_id).first()

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    # ❌ Already cancelled
    if order.order_status == "CANCELLED":
        raise HTTPException(
            status_code=400,
            detail="Order already cancelled"
        )

    # ❌ Cancellation not allowed
    if order.order_status not in CANCEL_ALLOWED_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=f"Order cannot be cancelled after '{order.order_status}' status"
        )

    # ✅ Update order status
    order.order_status = "CANCELLED"

    # 📝 Add tracking history
    tracking = OrderTracking(
        order_id=order.id,
        status="CANCELLED",
        description="Order cancelled by customer",
        location=None
    )

    db.add(tracking)

    db.commit()

    return {
        "message": "Order cancelled successfully",
        "order_id": order.id,
        "current_status": order.order_status
    }