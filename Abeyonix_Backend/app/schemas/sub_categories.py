from pydantic import BaseModel
from typing import Optional


class SubCategoryBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    image_path: Optional[str] = None
    is_active: bool = True
    category_id: int


class SubCategoryCreate(SubCategoryBase):
    pass


class SubCategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    image_path: Optional[str] = None
    is_active: Optional[bool] = None
    category_id: Optional[int] = None


class SubCategoryResponse(SubCategoryBase):
    id: int
    category_name: Optional[str] = None

    class Config:
        from_attributes = True
