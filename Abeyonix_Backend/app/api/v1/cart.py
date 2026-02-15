from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import and_
from sqlalchemy.orm import Session
from typing import List
from app.db.base import get_db
from app.models.cart import CartItem
from app.models.product import Product, ProductMedia, Inventory
from app.schemas.cart import CartItemCreate, CartItemUpdate, CartItemResponse, CartListResponse

router = APIRouter(prefix="/api/v1/cart", tags=["Cart"])


def build_cart_response(cart_item: CartItem, db: Session):
    primary_image = (
        db.query(ProductMedia.url)
        .filter(
            ProductMedia.product_id == cart_item.product_id,
            ProductMedia.is_primary == True
        )
        .scalar()
    )

    inventory = (
        db.query(Inventory)
        .filter(Inventory.product_id == cart_item.product_id)
        .first()
    )

    return {
        "id": cart_item.id,
        "quantity": cart_item.quantity,
        "unit_price": float(cart_item.unit_price),
        "total_price": float(cart_item.total_price),
        "is_active": cart_item.is_active,
        "product": {
            "product_id": cart_item.product.id,
            "name": cart_item.product.name,
            "slug": cart_item.product.slug,
            "category_name": cart_item.product.category_name,
            "sub_category_name": cart_item.product.sub_category_name,
            "primary_image": primary_image,
            "stock_quantity": inventory.quantity if inventory else 0,
        },
    }


# -----------------------------
# Get all cart items for a user
# -----------------------------
@router.get("/{user_id}", response_model=CartListResponse)
def get_cart_items(user_id: int, db: Session = Depends(get_db)):

    query = (
        db.query(CartItem, Product, ProductMedia, Inventory)
        .join(Product, CartItem.product_id == Product.id)
        .outerjoin(
            ProductMedia,
            and_(
                ProductMedia.product_id == Product.id,
                ProductMedia.is_primary == True,
            ),
        )
        .outerjoin(Inventory, Inventory.product_id == Product.id)
        .filter(
            CartItem.user_id == user_id,
            CartItem.is_active == True,
            Product.is_active == True,
        )
    )

    results = query.all()

    cart_items = []
    total_items = 0

    for cart, product, media, inventory in results:
        total_items += cart.quantity

        cart_items.append({
            "id": cart.id,
            "quantity": cart.quantity,
            "unit_price": float(cart.unit_price),
            "total_price": float(cart.total_price),
            "is_active": cart.is_active,
            "product": {
                "product_id": product.id,
                "name": product.name,
                "slug": product.slug,
                "category_name": product.category_name,
                "sub_category_name": product.sub_category_name,
                "primary_image": media.url if media else None,
                "stock_quantity": inventory.quantity if inventory else 0,
            },
        })

    return {
        "total_items": total_items,
        "items": cart_items,
    }

# -----------------------------
# Add item to cart
# -----------------------------
@router.post("/", response_model=CartItemResponse, status_code=status.HTTP_201_CREATED)
def add_cart_item(payload: CartItemCreate, db: Session = Depends(get_db)):

    # 🔍 Check if item already exists in cart
    existing_item = (
        db.query(CartItem)
        .filter(
            CartItem.user_id == payload.user_id,
            CartItem.product_id == payload.product_id,
            CartItem.is_active == True
        )
        .first()
    )

    # 🔍 Check stock before adding
    inventory = (
        db.query(Inventory)
        .filter(Inventory.product_id == payload.product_id)
        .first()
    )

    if not inventory:
        raise HTTPException(status_code=400, detail="Product inventory not found")

    if payload.quantity > inventory.quantity:
        raise HTTPException(
            status_code=400,
            detail=f"Only {inventory.quantity} items available in stock"
        )

    # ✅ If item already in cart → increase quantity
    if existing_item:
        new_quantity = existing_item.quantity + payload.quantity

        if new_quantity > inventory.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Only {inventory.quantity} items available in stock"
            )

        existing_item.quantity = new_quantity
        existing_item.total_price = existing_item.quantity * existing_item.unit_price

        db.commit()
        db.refresh(existing_item)

        return build_cart_response(existing_item, db)

    # ✅ New cart item
    total_price = payload.quantity * payload.unit_price

    cart_item = CartItem(
        user_id=payload.user_id,
        product_id=payload.product_id,
        quantity=payload.quantity,
        unit_price=payload.unit_price,
        total_price=total_price,
        session_id=payload.session_id,
        is_active=True
    )

    db.add(cart_item)
    db.commit()
    db.refresh(cart_item)

    return build_cart_response(cart_item, db)


# -----------------------------
# Update cart item quantity or status
# -----------------------------
@router.put("/{cart_item_id}")
def update_cart_item(
    cart_item_id: int,
    payload: CartItemUpdate,
    db: Session = Depends(get_db)
):
    # 🔍 Find cart item
    cart_item = (
        db.query(CartItem)
        .filter(CartItem.id == cart_item_id, CartItem.is_active == True)
        .first()
    )
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    # ✅ If quantity update requested
    if payload.quantity is not None:

        # 🔍 Get stock from inventory
        inventory = (
            db.query(Inventory)
            .filter(Inventory.product_id == cart_item.product_id)
            .first()
        )

        if not inventory:
            raise HTTPException(
                status_code=400,
                detail="Product inventory not found"
            )

        # ❌ If requested quantity > stock
        if payload.quantity > inventory.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Only {inventory.quantity} items available in stock"
            )

        # ✅ Update quantity
        cart_item.quantity = payload.quantity
        cart_item.total_price = cart_item.quantity * cart_item.unit_price

    # ✅ Update active status
    if payload.is_active is not None:
        cart_item.is_active = payload.is_active

    db.commit()
    db.refresh(cart_item)
    return {"message": "Cart item Updated successfully"}


# -----------------------------
# Delete cart item (soft delete)
# -----------------------------
@router.delete("/{cart_item_id}", status_code=status.HTTP_200_OK)
def delete_cart_item(cart_item_id: int, db: Session = Depends(get_db)):
    cart_item = db.query(CartItem).filter(CartItem.id == cart_item_id, CartItem.is_active == True).first()
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    cart_item.is_active = False
    db.commit()
    return {"message": "Cart item deleted successfully"}

# -----------------------------
# Clear all cart items for a user
# -----------------------------
@router.delete("/clear/{user_id}", status_code=status.HTTP_200_OK)
def clear_cart(user_id: int, db: Session = Depends(get_db)):
    cart_items = db.query(CartItem).filter(CartItem.user_id == user_id, CartItem.is_active == True).all()
    for item in cart_items:
        item.is_active = False
    db.commit()
    return {"message": "Cart cleared successfully"}
