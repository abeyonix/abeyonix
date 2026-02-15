from pydantic import BaseModel
from typing import Optional, List


class CategoryBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    image_path: Optional[str] = None
    is_active: bool = True
    parent_id: Optional[int] = None


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    image_path: Optional[str] = None
    is_active: Optional[bool] = None
    parent_id: Optional[int] = None


class CategoryResponse(CategoryBase):
    id: int

    class Config:
        from_attributes = True
