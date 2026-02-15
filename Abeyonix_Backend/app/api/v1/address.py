from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.models.address import UserAddress
from app.models.users import User
from app.schemas.address import (
    UserAddressCreate,
    UserAddressUpdate,
    UserAddressResponse
)

router = APIRouter(prefix="/api/v1/addresses", tags=["User Addresses"])



def reset_default_address(db: Session, user_id: int):
    db.query(UserAddress).filter(
        UserAddress.user_id == user_id
    ).update({"is_default": False})


@router.post(
    "/",
    response_model=UserAddressResponse,
    status_code=status.HTTP_201_CREATED
)
def create_address(
    payload: UserAddressCreate,
    user_id: int,   # 🔐 get from token later
    db: Session = Depends(get_db)
):
    if payload.is_default:
        reset_default_address(db, user_id)

    address = UserAddress(
        user_id=user_id,
        **payload.dict()
    )

    db.add(address)
    db.commit()
    db.refresh(address)

    return address



@router.get(
    "/",
    response_model=List[UserAddressResponse]
)
def get_user_addresses(
    user_id: int,
    db: Session = Depends(get_db)
):
    return db.query(UserAddress).filter(
        UserAddress.user_id == user_id
    ).order_by(UserAddress.is_default.desc()).all()


@router.get(
    "/{address_id}",
    response_model=UserAddressResponse
)
def get_address(
    address_id: int,
    user_id: int,
    db: Session = Depends(get_db)
):
    address = db.query(UserAddress).filter(
        UserAddress.address_id == address_id,
        UserAddress.user_id == user_id
    ).first()

    if not address:
        raise HTTPException(status_code=404, detail="Address not found")

    return address



@router.put(
    "/{address_id}",
    response_model=UserAddressResponse
)
def update_address(
    address_id: int,
    payload: UserAddressUpdate,
    user_id: int,
    db: Session = Depends(get_db)
):
    address = db.query(UserAddress).filter(
        UserAddress.address_id == address_id,
        UserAddress.user_id == user_id
    ).first()

    if not address:
        raise HTTPException(status_code=404, detail="Address not found")

    if payload.is_default is True:
        reset_default_address(db, user_id)

    for key, value in payload.dict(exclude_unset=True).items():
        setattr(address, key, value)

    db.commit()
    db.refresh(address)

    return address


@router.patch(
    "/{address_id}/make-default",
    status_code=status.HTTP_200_OK
)
def make_default_address(
    address_id: int,
    user_id: int,
    db: Session = Depends(get_db)
):
    address = db.query(UserAddress).filter(
        UserAddress.address_id == address_id,
        UserAddress.user_id == user_id
    ).first()

    if not address:
        raise HTTPException(status_code=404, detail="Address not found")

    reset_default_address(db, user_id)

    address.is_default = True
    db.commit()

    return {"message": "Default address updated successfully"}


@router.delete(
    "/{address_id}",
    status_code=status.HTTP_200_OK
)
def delete_address(
    address_id: int,
    user_id: int,
    db: Session = Depends(get_db)
):
    # 🔍 Fetch address
    address = db.query(UserAddress).filter(
        UserAddress.address_id == address_id,
        UserAddress.user_id == user_id
    ).first()

    if not address:
        raise HTTPException(status_code=404, detail="Address not found")

    was_default = address.is_default

    # 🗑️ Delete address
    db.delete(address)
    db.flush()  # keep transaction open

    # 🔁 If deleted address was default
    if was_default:
        previous_address = (
            db.query(UserAddress)
            .filter(
                UserAddress.user_id == user_id,
                UserAddress.address_id < address_id
            )
            .order_by(UserAddress.address_id.desc())
            .first()
        )

        if previous_address:
            previous_address.is_default = True

    db.commit()

    return {"message": "Address deleted successfully"}

