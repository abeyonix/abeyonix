from fastapi import APIRouter, Depends, HTTPException, status, Query as FastQuery
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, func
from typing import List

from app.db.base import Base
from app.db.session import get_db
from app.models.categories import Category
from app.models.sub_categories import SubCategory
from app.models.product import *
from app.schemas.shop import *

router = APIRouter(
    prefix="/api/v1",
    tags=["Shop"]
)



@router.get("/category-tree", response_model=List[CategoryTreeResponse])
def get_category_subcategory_tree(db: Session = Depends(get_db)):
    categories = (
        db.query(Category)
        .filter(Category.is_active == True)
        .all()
    )

    sub_categories = (
        db.query(SubCategory)
        .filter(SubCategory.is_active == True)
        .all()
    )

    # ----------------------------
    # Lookup maps
    # ----------------------------
    category_children_map = {}
    subcategory_map = {}

    for cat in categories:
        category_children_map.setdefault(cat.parent_id, []).append(cat)

    for sub in sub_categories:
        subcategory_map.setdefault(sub.category_id, []).append(sub)

    # ----------------------------
    # Recursive tree builder
    # ----------------------------
    def build_category_tree(category):
        return {
            "id": category.id,
            "name": category.name,
            "slug": category.slug,
            "image_path": category.image_path,
            "children": [
                build_category_tree(child)
                for child in category_children_map.get(category.id, [])
            ],
            "sub_categories": [
                {
                    "id": sub.id,
                    "name": sub.name,
                    "slug": sub.slug,
                    "image_path": sub.image_path,
                    "category_name": sub.category_name,
                }
                for sub in subcategory_map.get(category.id, [])
            ]
        }

    # ----------------------------
    # Root categories
    # ----------------------------
    tree = [
        build_category_tree(cat)
        for cat in category_children_map.get(None, [])
    ]

    return tree




# ---------------------------------------------------------------------


@router.get("/shop/products", response_model=ShopProductScrollResponse)
def get_shop_products(
    category_id: Optional[int] = None,
    sub_category_id: Optional[int] = None,

    last_id: Optional[int] = None,   # cursor
    limit: int = 12,

    db: Session = Depends(get_db),
):
    query = (
        db.query(Product)
        .join(Category, Product.category_id == Category.id)
        .outerjoin(SubCategory, Product.sub_category_id == SubCategory.id)
        .filter(Product.is_active == True)
    )

    # -------- Filters --------
    if category_id:
        query = query.filter(Product.category_id == category_id)

    if sub_category_id:
        query = query.filter(Product.sub_category_id == sub_category_id)

    # -------- Cursor Pagination --------
    if last_id:
        query = query.filter(Product.id < last_id)

    products = (
        query
        .options(
            joinedload(Product.category),
            joinedload(Product.sub_category),
        )
        .order_by(Product.id.desc())
        .limit(limit + 1)   # fetch one extra
        .all()
    )

    has_more = len(products) > limit
    products = products[:limit]

    product_ids = [p.id for p in products]

    # -------- Pricing --------
    pricing_map = {
        p.product_id: p
        for p in db.query(Pricing)
        .filter(Pricing.product_id.in_(product_ids))
        .all()
    }

    # -------- Primary Image --------
    media_map = {
        m.product_id: m.url
        for m in db.query(ProductMedia)
        .filter(
            ProductMedia.product_id.in_(product_ids),
            ProductMedia.is_primary == True
        )
        .all()
    }

    items = []
    for product in products:
        pricing = pricing_map.get(product.id)

        items.append({
            "id": product.id,
            "name": product.name,
            "slug": product.slug,
            "sku": product.sku,

            "category_id": product.category_id,
            "category_name": product.category_name,

            "sub_category_id": product.sub_category_id,
            "sub_category_name": product.sub_category_name,

            "brand": product.brand,

            "price": float(pricing.price) if pricing else None,
            "discount_price": float(pricing.discount_price) if pricing and pricing.discount_price else None,

            "primary_image": media_map.get(product.id),
        })

    return {
        "items": items,
        "last_id": items[-1]["id"] if items else None,
        "has_more": has_more
    }

@router.get("/product/search", response_model=ProductSearchResponse)
def search_products(
    search: Optional[str] = FastQuery(None),
    cursor: Optional[int] = FastQuery(None),
    limit: int = FastQuery(10, le=50),
    db: Session = Depends(get_db),
):

    query = (
        db.query(
            Product.id,
            Product.name,
            ProductMedia.url.label("primary_image"),
            func.coalesce(Pricing.discount_price, Pricing.price).label("price"),
        )
        .join(
            ProductMedia,
            and_(
                ProductMedia.product_id == Product.id,
                ProductMedia.is_primary == True,
            ),
            isouter=True,
        )
        .join(
            Pricing,
            Pricing.product_id == Product.id,
        )
        .filter(Product.is_active == True)
        .order_by(Product.id)
    )

    # 🔍 Search by name
    if search:
        query = query.filter(Product.name.ilike(f"%{search}%"))

    # ⚡ Scroll pagination
    if cursor:
        query = query.filter(Product.id > cursor)

    results = query.limit(limit).all()

    items = [
        ProductSearchItem(
            id=row.id,
            name=row.name,
            primary_image=row.primary_image,
            price=float(row.price),
        )
        for row in results
    ]

    next_cursor = results[-1].id if results else None

    return ProductSearchResponse(
        next_cursor=next_cursor,
        items=items,
    )
