from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime



class SubCategoryTreeResponse(BaseModel):
    id: int
    name: str
    slug: str
    image_path: Optional[str]
    category_name: Optional[str]

    class Config:
        from_attributes = True


class CategoryTreeResponse(BaseModel):
    id: int
    name: str
    slug: str
    image_path: Optional[str]
    children: List["CategoryTreeResponse"] = []
    sub_categories: List[SubCategoryTreeResponse] = []

    class Config:
        from_attributes = True


CategoryTreeResponse.model_rebuild()



# ----------------------------------------------


class ShopProductResponse(BaseModel):
    id: int
    name: str
    slug: str
    sku: str

    category_id: int
    category_name: Optional[str]

    sub_category_id: Optional[int]
    sub_category_name: Optional[str]

    brand: Optional[str]

    price: Optional[float]
    discount_price: Optional[float]

    primary_image: Optional[str]

    class Config:
        from_attributes = True


class ShopProductScrollResponse(BaseModel):
    items: List[ShopProductResponse]
    last_id: Optional[int]
    has_more: bool


class ProductSearchItem(BaseModel):
    id: int
    name: str
    primary_image: Optional[str]
    price: float

    class Config:
        from_attributes = True


class ProductSearchResponse(BaseModel):
    next_cursor: Optional[int]
    items: List[ProductSearchItem]