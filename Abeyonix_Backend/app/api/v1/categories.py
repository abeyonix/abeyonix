from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import uuid
from app.db.session import get_db
from app.models.categories import Category
from app.schemas.categories import (
    CategoryCreate,
    CategoryUpdate,
    CategoryResponse
)
from app.utils.media import save_image, delete_image
from app.utils.slug import generate_slug

router = APIRouter(prefix="/api/v1/categories", tags=["Categories"])


# 
@router.post("/", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    name: str = Form(...),
    description: Optional[str] = Form(None),
    is_active: bool = Form(True),
    parent_id: Optional[int] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    slug = generate_slug(name)

    image_path = save_image(image, "categories") if image else None

    category = Category(
        name=name,
        slug=slug,
        description=description,
        is_active=is_active,
        parent_id=parent_id,
        image_path=image_path
    )

    db.add(category)
    db.commit()
    db.refresh(category)
    return category



@router.get("/", response_model=List[CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()


@router.get("/{category_id}", response_model=CategoryResponse)
def get_category(category_id: int, db: Session = Depends(get_db)):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category



@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: int,
    name: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    is_active: Optional[bool] = Form(None),
    parent_id: Optional[int] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    # ✅ Update name + auto-generate slug
    if name is not None:
        category.name = name
        category.slug = generate_slug(name)

    if description is not None:
        category.description = description

    if is_active is not None:
        category.is_active = is_active

    if parent_id is not None:
        category.parent_id = parent_id

    # ✅ Replace image (delete old → save new)
    if image:
        if category.image_path:
            delete_image(category.image_path)

        category.image_path = save_image(image, "categories")

    db.commit()
    db.refresh(category)
    return category




@router.delete("/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db)):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    # ✅ Delete image from folder if exists
    if category.image_path:
        delete_image(category.image_path)

    db.delete(category)
    db.commit()

    return {"message": "Category deleted successfully."}

