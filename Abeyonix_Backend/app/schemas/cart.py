from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

class CartItemBase(BaseModel):
    user_id: int
    product_id: int
    quantity: int
    unit_price: float
    is_active: Optional[bool] = True
    session_id: Optional[str] = None

class CartItemCreate(CartItemBase):
    pass

class CartItemUpdate(BaseModel):
    quantity: Optional[int] = None
    is_active: Optional[bool] = None


class CartProductInfo(BaseModel):
    product_id: int
    name: str
    slug: str
    category_name: Optional[str]
    sub_category_name: Optional[str]
    primary_image: Optional[str]
    stock_quantity: Optional[int]

    class Config:
        from_attributes = True

class CartItemResponse(BaseModel):
    id: int
    quantity: int
    unit_price: float
    total_price: float
    is_active: bool

    product: CartProductInfo

    class Config:
        from_attributes = True

class CartListResponse(BaseModel):
    total_items: int
    items: List[CartItemResponse]
    