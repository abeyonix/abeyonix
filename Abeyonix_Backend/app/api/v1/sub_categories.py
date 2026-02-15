from fastapi import APIRouter, Depends, HTTPException, status, Form, UploadFile, File
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional

from app.db.session import get_db
from app.models.sub_categories import SubCategory
from app.models.categories import Category
from app.schemas.sub_categories import (
    SubCategoryCreate,
    SubCategoryUpdate,
    SubCategoryResponse
)

from app.utils.media import save_image, delete_image
from app.utils.slug import generate_slug

router = APIRouter(prefix="/api/v1/sub-categories", tags=["Sub Categories"])


@router.post("/", response_model=SubCategoryResponse, status_code=status.HTTP_201_CREATED)
def create_sub_category(
    name: str = Form(...),
    category_id: int = Form(...),
    description: Optional[str] = Form(None),
    is_active: bool = Form(True),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    # 🔒 Validate category
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    slug = generate_slug(name)
    image_path = save_image(image, "sub_categories") if image else None

    sub_category = SubCategory(
        name=name,
        slug=slug,
        description=description,
        is_active=is_active,
        category_id=category_id,
        image_path=image_path
    )

    db.add(sub_category)
    db.commit()
    db.refresh(sub_category)

    return sub_category



@router.get("/", response_model=List[SubCategoryResponse])
def get_sub_categories(db: Session = Depends(get_db)):
    return (
        db.query(SubCategory)
        .options(joinedload(SubCategory.category))
        .all()
    )



@router.get("/{sub_category_id}", response_model=SubCategoryResponse)
def get_sub_category(sub_category_id: int, db: Session = Depends(get_db)):
    sub_category = (
        db.query(SubCategory)
        .options(joinedload(SubCategory.category))
        .filter(SubCategory.id == sub_category_id)
        .first()
    )

    if not sub_category:
        raise HTTPException(status_code=404, detail="SubCategory not found")

    return sub_category



@router.put("/{sub_category_id}", response_model=SubCategoryResponse)
def update_sub_category(
    sub_category_id: int,
    name: Optional[str] = Form(None),
    category_id: Optional[int] = Form(None),
    description: Optional[str] = Form(None),
    is_active: Optional[bool] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    sub_category = db.query(SubCategory).filter(SubCategory.id == sub_category_id).first()
    if not sub_category:
        raise HTTPException(status_code=404, detail="SubCategory not found")

    # ✅ Update name + regenerate slug
    if name is not None:
        sub_category.name = name
        sub_category.slug = generate_slug(name)

    # ✅ Update category
    if category_id is not None:
        category = db.query(Category).filter(Category.id == category_id).first()
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")

        sub_category.category_id = category_id

    if description is not None:
        sub_category.description = description

    if is_active is not None:
        sub_category.is_active = is_active

    # ✅ Replace image
    if image:
        if sub_category.image_path:
            delete_image(sub_category.image_path)

        sub_category.image_path = save_image(image, "sub_categories")

    db.commit()
    db.refresh(sub_category)

    return sub_category



@router.delete("/{sub_category_id}")
def delete_sub_category(sub_category_id: int, db: Session = Depends(get_db)):
    sub_category = db.query(SubCategory).filter(SubCategory.id == sub_category_id).first()
    if not sub_category:
        raise HTTPException(status_code=404, detail="SubCategory not found")

    # ✅ Delete image from disk
    if sub_category.image_path:
        delete_image(sub_category.image_path)

    db.delete(sub_category)
    db.commit()

    return {"message": "SubCategory deleted successfully."}

