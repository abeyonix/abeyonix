from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class ProductMediaResponse(BaseModel):
    id: int
    url: str
    media_type: str
    is_primary: bool

    class Config:
        from_attributes = True


class PricingResponse(BaseModel):
    price: float
    discount_price: Optional[float]

    class Config:
        from_attributes = True



class InventoryResponse(BaseModel):
    quantity: int
    low_quantity_alert_at: int

    class Config:
        from_attributes = True



class ProductAttributeResponse(BaseModel):
    attribute_id: int
    attribute_name: str
    unit: Optional[str]
    value: str


class ProductDetailResponse(BaseModel):
    id: int
    name: str
    sku: str
    slug: str

    category_id: int
    category_name: Optional[str]

    sub_category_id: Optional[int]
    sub_category_name: Optional[str]

    brand: Optional[str]
    short_description: Optional[str]
    long_description: Optional[str]

    is_active: bool
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    pricing: PricingResponse
    inventory: InventoryResponse
    attributes: List[ProductAttributeResponse]
    media: List[ProductMediaResponse]

    class Config:
        from_attributes = True



# ---------------------------------------------------

class ProductListResponse(BaseModel):
    id: int
    name: str
    slug: str
    sku: str

    category_id: int
    category_name: Optional[str]

    sub_category_id: Optional[int]
    sub_category_name: Optional[str]

    brand: Optional[str]
    is_active: bool

    created_at: Optional[datetime]

    price: Optional[float]
    discount_price: Optional[float]

    class Config:
        from_attributes = True


class PaginatedProductResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: List[ProductDetailResponse]
