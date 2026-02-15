from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.base import Base
from app.db.session import get_db  # Your DB session dependency
from app.models.attributes import Attribute, CategoryAttribute
from app.schemas.attributes import (
    AttributeCreate,
    AttributeUpdate,
    AttributeOut,
    CategoryAttributeCreate,
    CategoryAttributeUpdate,
    CategoryAttributeOut
)

router = APIRouter(
    prefix="/api/v1",
    tags=["Attributes"]
)

# Create attribute
@router.post("/attributes/", response_model=AttributeOut, status_code=status.HTTP_201_CREATED)
def create_attribute(payload: AttributeCreate, db: Session = Depends(get_db)):
    attribute = Attribute(**payload.model_dump())
    db.add(attribute)
    db.commit()
    db.refresh(attribute)
    return attribute

# Get all attributes
@router.get("/attributes/", response_model=List[AttributeOut])
def get_attributes(db: Session = Depends(get_db)):
    return db.query(Attribute).all()

# Get single attribute by ID
@router.get("/attributes/{attribute_id}", response_model=AttributeOut)
def get_attribute(attribute_id: int, db: Session = Depends(get_db)):
    attribute = db.query(Attribute).filter(Attribute.id == attribute_id).first()
    if not attribute:
        raise HTTPException(status_code=404, detail="Attribute not found")
    return attribute

# Update attribute
@router.put("/attributes/{attribute_id}", response_model=AttributeOut)
def update_attribute(attribute_id: int, payload: AttributeUpdate, db: Session = Depends(get_db)):
    attribute = db.query(Attribute).filter(Attribute.id == attribute_id).first()
    if not attribute:
        raise HTTPException(status_code=404, detail="Attribute not found")
    
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(attribute, key, value)

    db.commit()
    db.refresh(attribute)
    return attribute

# Delete attribute
@router.delete("/attributes/{attribute_id}")
def delete_attribute(attribute_id: int, db: Session = Depends(get_db)):
    attribute = db.query(Attribute).filter(Attribute.id == attribute_id).first()
    if not attribute:
        raise HTTPException(status_code=404, detail="Attribute not found")
    
    db.delete(attribute)
    db.commit()
    return {"message":"Attribute delted successfully."}





# ---------------------------------
# category attributes
# ---------------------------------



# ---------------- CREATE ----------------
@router.post(
    "/category-attributes/",
    response_model=CategoryAttributeOut,
    status_code=status.HTTP_201_CREATED
)
def create_category_attribute(
    payload: CategoryAttributeCreate,
    db: Session = Depends(get_db)
):
    mapping = CategoryAttribute(**payload.dict())
    db.add(mapping)
    db.commit()
    db.refresh(mapping)
    return mapping


# ---------------- READ ALL ----------------
@router.get("/category-attributes/", response_model=List[CategoryAttributeOut])
def get_all_category_attributes(db: Session = Depends(get_db)):
    return db.query(CategoryAttribute).all()


# ---------------- READ ONE ----------------
@router.get("/category-attributes/{mapping_id}", response_model=CategoryAttributeOut)
def get_category_attribute(
    mapping_id: int,
    db: Session = Depends(get_db)
):
    mapping = (
        db.query(CategoryAttribute)
        .filter(CategoryAttribute.id == mapping_id)
        .first()
    )

    if not mapping:
        raise HTTPException(status_code=404, detail="Category attribute not found")

    return mapping


# ---------------- UPDATE ----------------
@router.put("/category-attributes/{mapping_id}", response_model=CategoryAttributeOut)
def update_category_attribute(
    mapping_id: int,
    payload: CategoryAttributeUpdate,
    db: Session = Depends(get_db)
):
    mapping = (
        db.query(CategoryAttribute)
        .filter(CategoryAttribute.id == mapping_id)
        .first()
    )

    if not mapping:
        raise HTTPException(status_code=404, detail="Category attribute not found")

    for key, value in payload.dict(exclude_unset=True).items():
        setattr(mapping, key, value)

    db.commit()
    db.refresh(mapping)
    return mapping


# ---------------- DELETE ----------------
@router.delete("/category-attributes/{mapping_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category_attribute(
    mapping_id: int,
    db: Session = Depends(get_db)
):
    mapping = (
        db.query(CategoryAttribute)
        .filter(CategoryAttribute.id == mapping_id)
        .first()
    )

    if not mapping:
        raise HTTPException(status_code=404, detail="Category attribute not found")

    db.delete(mapping)
    db.commit()
    return