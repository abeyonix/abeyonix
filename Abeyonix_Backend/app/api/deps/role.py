from fastapi import Depends, HTTPException, status
from app.models.users import User
from .auth import get_current_user


def admin_required(current_user: User = Depends(get_current_user)):
    if current_user.role_name != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin can perform this action"
        )
    return current_user