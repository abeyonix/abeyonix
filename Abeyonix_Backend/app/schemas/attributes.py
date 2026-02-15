from pydantic import BaseModel
from typing import Optional

# Schema for reading attributes
class AttributeBase(BaseModel):
    name: str
    unit: Optional[str] = None
    data_type: Optional[str] = None

# Schema for creating attribute
class AttributeCreate(AttributeBase):
    pass

# Schema for updating attribute
class AttributeUpdate(BaseModel):
    name: Optional[str] = None
    unit: Optional[str] = None
    data_type: Optional[str] = None

# Schema for reading response
class AttributeOut(AttributeBase):
    id: int

    class Config:
        from_attributes = True



# -----------------------------------
# category attribute
# -----------------------------------


class CategoryAttributeBase(BaseModel):
    category_id: int
    sub_category_id: Optional[int] = None
    attribute_id: int


class CategoryAttributeCreate(CategoryAttributeBase):
    pass


class CategoryAttributeUpdate(BaseModel):
    category_id: Optional[int] = None
    sub_category_id: Optional[int] = None
    attribute_id: Optional[int] = None


class CategoryAttributeOut(CategoryAttributeBase):
    id: int
    category_name: Optional[str] = None
    sub_category_name: Optional[str] = None

    class Config:
        from_attributes = True