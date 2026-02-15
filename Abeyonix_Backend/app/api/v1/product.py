from fastapi import APIRouter, Depends, Form, File, UploadFile, HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
import json

from app.db.session import get_db
from app.models.product import Product
from app.models.attributes import *
from app.models.categories import Category
from app.models.sub_categories import SubCategory
from app.models.product import ProductMedia, ProductAttributeValue, Pricing, Inventory
from app.utils.media import save_image
from app.schemas.product import *
from app.utils.slug import generate_slug

router = APIRouter(prefix="/api/v1/products", tags=["Products"])


@router.post("/", status_code=201)
def create_product(
    # -------- Product ----------
    name: str = Form(...),
    sku: str = Form(...),
    # slug: str = Form(...),
    category_id: int = Form(...),
    sub_category_id: Optional[int] = Form(None),
    brand: Optional[str] = Form(None),
    short_description: Optional[str] = Form(None),
    long_description: Optional[str] = Form(None),

    # -------- Pricing ----------
    price: float = Form(...),
    discount_price: Optional[float] = Form(None),

    # -------- Inventory ----------
    quantity: int = Form(...),
    low_quantity_alert_at: int = Form(...),

    # -------- Attributes ----------
    attributes: str = Form(...),  # JSON string

    # -------- Media ----------
    images: List[UploadFile] = File(...),
    primary_image_index: int = Form(0),

    db: Session = Depends(get_db)
):
    try:
        # ---------- Product ----------
        product = Product(
            name=name,
            sku=sku,
            slug=generate_slug(name),
            category_id=category_id,
            sub_category_id=sub_category_id,
            brand=brand,
            short_description=short_description,
            long_description=long_description,
        )
        db.add(product)
        db.flush()  # get product.id

        # ---------- Pricing ----------
        db.add(
            Pricing(
                product_id=product.id,
                price=price,
                discount_price=discount_price,
            )
        )

        # ---------- Inventory ----------
        db.add(
            Inventory(
                product_id=product.id,
                quantity=quantity,
                low_quantity_alert_at=low_quantity_alert_at,
            )
        )

        # ---------- Attributes ----------
        attribute_list = json.loads(attributes)

        for attr in attribute_list:
            db.add(
                ProductAttributeValue(
                    product_id=product.id,
                    attribute_id=attr["attribute_id"],
                    value=attr["value"],
                )
            )

        # ---------- Media (using save_image) ----------
        for index, image in enumerate(images):
            image_path = save_image(image, folder="products")

            db.add(
                ProductMedia(
                    product_id=product.id,
                    url=image_path,
                    media_type=image.content_type,
                    is_primary=(index == primary_image_index),
                )
            )

        db.commit()

        return {
            "message": "Product created successfully",
            "product_id": product.id
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))




@router.get("/", response_model=PaginatedProductResponse)
def get_products(
    category_id: Optional[int] = None,
    sub_category_id: Optional[int] = None,
    search: Optional[str] = None,

    page: int = 1,
    page_size: int = 10,

    db: Session = Depends(get_db),
):
    query = (
        db.query(Product)
        .join(Category, Product.category_id == Category.id)
        .outerjoin(SubCategory, Product.sub_category_id == SubCategory.id)
    )

    # -------- Filters --------
    if category_id:
        query = query.filter(Product.category_id == category_id)

    if sub_category_id:
        query = query.filter(Product.sub_category_id == sub_category_id)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Product.name.ilike(search_term),
                Category.name.ilike(search_term),
                SubCategory.name.ilike(search_term),
            )
        )

    total = query.count()

    offset = (page - 1) * page_size

    products = (
        query
        .options(
            joinedload(Product.category),
            joinedload(Product.sub_category),
        )
        .order_by(Product.created_at.desc())
        .offset(offset)
        .limit(page_size)
        .all()
    )

    if not products:
        return {
            "total": total,
            "page": page,
            "page_size": page_size,
            "items": []
        }

    product_ids = [p.id for p in products]

    # -------- Pricing --------
    pricing_map = {
        p.product_id: p
        for p in db.query(Pricing)
        .filter(Pricing.product_id.in_(product_ids))
        .all()
    }

    # -------- Inventory --------
    inventory_map = {
        i.product_id: i
        for i in db.query(Inventory)
        .filter(Inventory.product_id.in_(product_ids))
        .all()
    }

    # -------- Media --------
    media_map = {}
    for m in (
        db.query(ProductMedia)
        .filter(ProductMedia.product_id.in_(product_ids))
        .all()
    ):
        media_map.setdefault(m.product_id, []).append(m)

    # -------- Attributes --------
    attribute_rows = (
        db.query(
            ProductAttributeValue.product_id,
            ProductAttributeValue.attribute_id,
            ProductAttributeValue.value,
            Attribute.name.label("attribute_name"),
            Attribute.unit,
        )
        .join(Attribute, Attribute.id == ProductAttributeValue.attribute_id)
        .filter(ProductAttributeValue.product_id.in_(product_ids))
        .all()
    )

    attribute_map = {}
    for row in attribute_rows:
        attribute_map.setdefault(row.product_id, []).append({
            "attribute_id": row.attribute_id,
            "attribute_name": row.attribute_name,
            "unit": row.unit,
            "value": row.value
        })

    # ✅ IMPORTANT: items must be created HERE
    items = []

    for product in products:
        items.append({
            "id": product.id,
            "name": product.name,
            "sku": product.sku,
            "slug": product.slug,

            "category_id": product.category_id,
            "category_name": product.category_name,

            "sub_category_id": product.sub_category_id,
            "sub_category_name": product.sub_category_name,

            "brand": product.brand,
            "short_description": product.short_description,
            "long_description": product.long_description,

            "is_active": product.is_active,
            "created_at": product.created_at,
            "updated_at": product.updated_at,

            "pricing": pricing_map.get(product.id),
            "inventory": inventory_map.get(product.id),
            "attributes": attribute_map.get(product.id, []),
            "media": media_map.get(product.id, []),
        })

    # ✅ FINAL RETURN (this was missing)
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "items": items
    }











@router.get("/{product_id}", response_model=ProductDetailResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = (
        db.query(Product)
        .options(
            joinedload(Product.category),
            joinedload(Product.sub_category),
        )
        .filter(Product.id == product_id)
        .first()
    )

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    pricing = (
        db.query(Pricing)
        .filter(Pricing.product_id == product.id)
        .first()
    )

    inventory = (
        db.query(Inventory)
        .filter(Inventory.product_id == product.id)
        .first()
    )

    media = (
        db.query(ProductMedia)
        .filter(ProductMedia.product_id == product.id)
        .all()
    )

    attributes = (
        db.query(
            ProductAttributeValue.attribute_id,
            Attribute.name.label("attribute_name"),
            Attribute.unit,
            ProductAttributeValue.value
        )
        .join(Attribute, Attribute.id == ProductAttributeValue.attribute_id)
        .filter(ProductAttributeValue.product_id == product.id)
        .all()
    )

    attribute_response = [
        {
            "attribute_id": a.attribute_id,
            "attribute_name": a.attribute_name,
            "unit": a.unit,
            "value": a.value
        }
        for a in attributes
    ]

    return {
        "id": product.id,
        "name": product.name,
        "sku": product.sku,
        "slug": product.slug,

        "category_id": product.category_id,
        "category_name": product.category_name,

        "sub_category_id": product.sub_category_id,
        "sub_category_name": product.sub_category_name,

        "brand": product.brand,
        "short_description": product.short_description,
        "long_description": product.long_description,

        "is_active": product.is_active,
        "created_at": product.created_at,
        "updated_at": product.updated_at,

        "pricing": pricing,
        "inventory": inventory,
        "attributes": attribute_response,
        "media": media,
    }




@router.put("/{product_id}", status_code=200)
def update_product(
    product_id: int,

    # -------- Product ----------
    name: str = Form(...),
    sku: str = Form(...),
    # slug: str = Form(...),
    category_id: int = Form(...),
    sub_category_id: Optional[int] = Form(None),
    brand: Optional[str] = Form(None),
    short_description: Optional[str] = Form(None),
    long_description: Optional[str] = Form(None),

    # -------- Pricing ----------
    price: float = Form(...),
    discount_price: Optional[float] = Form(None),

    # -------- Inventory ----------
    quantity: int = Form(...),
    low_quantity_alert_at: int = Form(...),

    # -------- Attributes ----------
    attributes: str = Form(...),  # JSON string

    # -------- Media ----------
    existing_media_ids: Optional[str] = Form(None),  # JSON array of IDs
    images: Optional[List[UploadFile]] = File(None),
    primary_image_index: int = Form(0),

    db: Session = Depends(get_db),
):
    try:
        # ---------- Fetch product ----------
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        # ---------- Update Product ----------
        product.name = name
        product.sku = sku
        product.slug = generate_slug(name)
        product.category_id = category_id
        product.sub_category_id = sub_category_id
        product.brand = brand
        product.short_description = short_description
        product.long_description = long_description

        # ---------- Pricing ----------
        pricing = db.query(Pricing).filter(Pricing.product_id == product_id).first()
        if pricing:
            pricing.price = price
            pricing.discount_price = discount_price
        else:
            db.add(
                Pricing(
                    product_id=product_id,
                    price=price,
                    discount_price=discount_price,
                )
            )

        # ---------- Inventory ----------
        inventory = db.query(Inventory).filter(Inventory.product_id == product_id).first()
        if inventory:
            inventory.quantity = quantity
            inventory.low_quantity_alert_at = low_quantity_alert_at
        else:
            db.add(
                Inventory(
                    product_id=product_id,
                    quantity=quantity,
                    low_quantity_alert_at=low_quantity_alert_at,
                )
            )

        # ---------- Attributes (replace) ----------
        db.query(ProductAttributeValue).filter(
            ProductAttributeValue.product_id == product_id
        ).delete()

        attribute_list = json.loads(attributes)
        for attr in attribute_list:
            db.add(
                ProductAttributeValue(
                    product_id=product_id,
                    attribute_id=attr["attribute_id"],
                    value=attr["value"],
                )
            )

        # ---------- Media ----------
        keep_media_ids = json.loads(existing_media_ids) if existing_media_ids else []

        # Delete removed media
        db.query(ProductMedia).filter(
            ProductMedia.product_id == product_id,
            ~ProductMedia.id.in_(keep_media_ids)
        ).delete(synchronize_session=False)

        # Add new images
        new_media = []
        if images:
            for image in images:
                image_path = save_image(image, folder="products")
                media = ProductMedia(
                    product_id=product_id,
                    url=image_path,
                    media_type=image.content_type,
                    is_primary=False,
                )
                db.add(media)
                new_media.append(media)

        db.flush()

        # ---------- Set Primary Image ----------
        all_media = (
            db.query(ProductMedia)
            .filter(ProductMedia.product_id == product_id)
            .order_by(ProductMedia.id)
            .all()
        )

        for i, media in enumerate(all_media):
            media.is_primary = (i == primary_image_index)

        db.commit()

        return {
            "message": "Product updated successfully",
            "product_id": product_id
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

