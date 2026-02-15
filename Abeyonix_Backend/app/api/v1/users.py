from fastapi import APIRouter, Depends, HTTPException, status, Form, UploadFile, File
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.utils.security import hash_password
from app.db.base import get_db
from app.models.users import Role, User
from app.schemas.users import *

router = APIRouter(prefix="/api/v1", tags=["Users Management"])


# Create Role

@router.post("/roles/", response_model=RoleResponse, status_code=status.HTTP_201_CREATED)
def create_role(role_data: RoleCreate, db: Session = Depends(get_db)):
    existing_role = db.query(Role).filter(Role.role_name == role_data.role_name).first()
    if existing_role:
        raise HTTPException(
            status_code=400,
            detail="Role with this name already exists"
        )

    role = Role(
        role_name=role_data.role_name,
        description=role_data.description
    )
    db.add(role)
    db.commit()
    db.refresh(role)
    return role


# Get All Roles
@router.get("/roles/", response_model=List[RoleResponse])
def get_all_roles(db: Session = Depends(get_db)):
    return db.query(Role).all()


# Get Role By ID
@router.get("/roles/{role_id}", response_model=RoleResponse)
def get_role_by_id(role_id: int, db: Session = Depends(get_db)):
    role = db.query(Role).filter(Role.role_id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    return role


# Update Role
@router.put("/roles/{role_id}", response_model=RoleResponse)
def update_role(role_id: int, role_data: RoleUpdate, db: Session = Depends(get_db)):
    role = db.query(Role).filter(Role.role_id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")

    if role_data.role_name is not None:
        role.role_name = role_data.role_name
    if role_data.description is not None:
        role.description = role_data.description

    db.commit()
    db.refresh(role)
    return role


# Delete Role
@router.delete("/roles/{role_id}")
def delete_role(role_id: int, db: Session = Depends(get_db)):
    role = db.query(Role).filter(Role.role_id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")

    db.delete(role)
    db.commit()
    return {"message":"Role deleted Successfully!"}


#------------------------------
# Users APIs
# -----------------------------


@router.post("/users/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    user_name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    first_name: str = Form(...),
    last_name: str = Form(...),
    phone: str = Form(...),
    role_id: int = Form(...),
    alternative_phone: Optional[str] = Form(None),
    profile_image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(400, "Email already exists")

    if not db.query(Role).filter(Role.role_id == role_id).first():
        raise HTTPException(404, "Role not found")
    
    if len(password) < 8:
        raise HTTPException(400, "Password must be at least 8 characters")

    image_path = None
    if profile_image:
        image_path = f"/uploads/users/{profile_image.filename}"

    user = User(
        user_name=user_name,
        email=email,
        password_hash=hash_password(password),
        first_name=first_name,
        last_name=last_name,
        phone=phone,
        alternative_phone=alternative_phone,
        role_id=role_id,
        profile_image_url=image_path
    )

    db.add(user)
    db.commit()
    db.refresh(user)
    return user



@router.get("/users/", response_model=List[UserResponse])
def get_all_users(db: Session = Depends(get_db)):
    return (
        db.query(User)
        .options(joinedload(User.role))
        .all()
    )


@router.get("/users/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = (
        db.query(User)
        .options(joinedload(User.role))
        .filter(User.user_id == user_id)
        .first()
    )
    if not user:
        raise HTTPException(404, "User not found")
    return user



@router.put("/users/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user_name: Optional[str] = Form(None),
    email: Optional[str] = Form(None),
    first_name: Optional[str] = Form(None),
    last_name: Optional[str] = Form(None),
    phone: Optional[str] = Form(None),
    alternative_phone: Optional[str] = Form(None),
    role_id: Optional[int] = Form(None),
    is_active: Optional[bool] = Form(None),
    is_verify: Optional[bool] = Form(None),
    profile_image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")

    if user_name is not None:
        user.user_name = user_name
    if email is not None:
        user.email = email
    if first_name is not None:
        user.first_name = first_name
    if last_name is not None:
        user.last_name = last_name
    if phone is not None:
        user.phone = phone
    if alternative_phone is not None:
        user.alternative_phone = alternative_phone
    if role_id is not None:
        user.role_id = role_id
    if is_active is not None:
        user.is_active = is_active
    if is_verify is not None:
        user.is_verify = is_verify

    if profile_image:
        user.profile_image_url = f"/uploads/users/{profile_image.filename}"

    db.commit()
    db.refresh(user)
    return user



@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")

    db.delete(user)
    db.commit()
    return {"message" : "User deleted successfully!"}
