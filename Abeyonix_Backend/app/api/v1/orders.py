from fastapi import APIRouter, Depends, HTTPException, status, Query as FastQuery
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.sql import func
from decimal import Decimal
import uuid
import json
from fastapi import BackgroundTasks
from app.core.config import *
from app.utils.phonepe import *
from app.utils.order_no_generator import *
from app.db.session import get_db
from app.models.orders import Order, OrderItem, OrderTracking
from app.models.cart import CartItem
from app.models.users import User
from app.models.address import UserAddress
from app.models.product import Inventory, ProductMedia, Pricing, Product
from app.models.payment import PaymentSession, Payment
from app.schemas.orders import *
from app.utils.email_templates import order_notification_email
from app.services.user_service import get_admin_emails
from app.utils.email_service import send_email

router = APIRouter(prefix="/api/v1/orders", tags=["Orders"])

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
            # "full_name": addr.full_name,
            # "phone": addr.phone,
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
    shipping = Decimal("50.00")
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

def send_order_emails(db: Session, order, order_items, user):
    admin_emails = get_admin_emails(db)

    if admin_emails:
        html_content = order_notification_email(order, order_items, user)

        for email in admin_emails:
            send_email(
                to_email=email,
                subject=f"New Order Received - {order.order_number}",
                html_content=html_content
            )

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


def create_order_from_cart(session: PaymentSession, db: Session):
    payload = session.payload
    user_id = session.user_id
    shipping_address_id = payload["shipping_address_id"]

    # 1️⃣ Get all active cart items
    cart_items = db.query(CartItem).filter(
        CartItem.user_id == user_id,
        CartItem.is_active == True
    ).all()

    if not cart_items:
        raise HTTPException(400, "Cart is empty")

    subtotal = Decimal("0.00")
    order_items_data = []

    # 2️⃣ Stock check + calculation
    for item in cart_items:
        inventory = db.query(Inventory).filter(
            Inventory.product_id == item.product_id
        ).first()

        if not inventory or inventory.quantity < item.quantity:
            raise HTTPException(
                400,
                f"Insufficient stock for product {item.product.name}"
            )

        line_total = item.quantity * item.unit_price
        subtotal += line_total

        order_items_data.append({
            "product_id": item.product_id,
            "product_name": item.product.name,
            "sku": item.product.sku,
            "unit_price": item.unit_price,
            "quantity": item.quantity,
            "total_price": line_total,
        })

    # 3️⃣ Calculate final amounts (dummy logic for now)
    discount = Decimal("0.00")
    tax = subtotal * Decimal("0.05")  # 5% tax example
    shipping = Decimal("50.00")

    total_amount = subtotal - discount + tax + shipping

    # 4️⃣ Create Order
    order = Order(
        user_id=user_id,
        order_number=str(uuid.uuid4())[:10].upper(),
        subtotal_amount=subtotal,
        discount_amount=discount,
        tax_amount=tax,
        shipping_amount=shipping,
        total_amount=total_amount,
        shipping_address_id=shipping_address_id,
    )

    db.add(order)
    db.flush()  # get order.id before commit

    # 5️⃣ Create Order Items + Reduce Inventory
    for data in order_items_data:
        order_item = OrderItem(
            order_id=order.id,
            **data
        )
        db.add(order_item)

        # Reduce stock
        inventory = db.query(Inventory).filter(
            Inventory.product_id == data["product_id"]
        ).first()
        inventory.quantity -= data["quantity"]

    # 6️⃣ Clear cart
    for item in cart_items:
        item.is_active = False

    db.commit()
    db.refresh(order)

    payment = Payment(
        order_id=order.id,
        payment_method="UPI",
        payment_gateway="PHONEPE",
        transaction_id=session.transaction_id,
        amount=session.amount,
        payment_status="SUCCESS",
        paid_at=datetime.utcnow()
    )
    db.add(payment)

    order.payment_status = "SUCCESS"

    return {
        "order_id": order.id,
        "order_number": order.order_number,
        "total_amount": order.total_amount,
        "items": order.items
    }


def create_order_from_buy_now(session: PaymentSession, db: Session):
    payload = session.payload
    user_id = session.user_id
    shipping_address_id = payload["shipping_address_id"]
    product_id = payload["product_id"]
    quantity = payload["quantity"]

    # 1️⃣ Get product
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(404, "Product not found")

    # 2️⃣ Check inventory
    inventory = db.query(Inventory).filter(
        Inventory.product_id == product_id
    ).first()

    if not inventory or inventory.quantity < quantity:
        raise HTTPException(400, "Insufficient stock")

    # 3️⃣ Calculate amounts
    unit_price = product.price
    subtotal = unit_price * quantity

    discount = Decimal("0.00")
    tax = subtotal * Decimal("0.00")
    shipping = Decimal("50.00")
    total_amount = subtotal - discount + tax + shipping

    # 4️⃣ Create Order
    order = Order(
        user_id=user_id,
        order_number=str(uuid.uuid4())[:10].upper(),
        subtotal_amount=subtotal,
        discount_amount=discount,
        tax_amount=tax,
        shipping_amount=shipping,
        total_amount=total_amount,
        shipping_address_id=shipping_address_id,
    )

    db.add(order)
    db.flush()

    # 5️⃣ Create single Order Item
    order_item = OrderItem(
        order_id=order.id,
        product_id=product.id,
        product_name=product.name,
        sku=product.sku,
        unit_price=unit_price,
        quantity=quantity,
        total_price=subtotal,
    )
    db.add(order_item)

    # 6️⃣ Reduce inventory
    inventory.quantity -= quantity

    db.commit()
    db.refresh(order)

    payment = Payment(
        order_id=order.id,
        payment_method="UPI",
        payment_gateway="PHONEPE",
        transaction_id=session.transaction_id,
        amount=session.amount,
        payment_status="SUCCESS",
        paid_at=datetime.utcnow()
    )
    db.add(payment)

    order.payment_status = "SUCCESS"

    return {
        "order_id": order.id,
        "order_number": order.order_number,
        "total_amount": order.total_amount,
        "items": order.items
    }






@router.get("/{order_id}", response_model=OrderDetailsResponse)
def get_order_details(order_id: int, db: Session = Depends(get_db)):

    order = (
        db.query(Order)
        .filter(Order.id == order_id)
        .first()
    )

    if not order:
        raise HTTPException(404, "Order not found")

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
        "items": item_responses
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
            "updated_at": row.updated_at
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
            "updated_at": row.updated_at
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





@router.post("/update-tracking", status_code=200)
def update_order_tracking(
    request: UpdateOrderTrackingRequest,
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
        location=request.location
    )

    db.add(tracking)

    # 🔄 Update order status (latest status)
    order.order_status = request.status

    db.commit()

    return {
        "message": "Order tracking updated successfully",
        "order_id": order.id,
        "current_status": order.order_status
    }