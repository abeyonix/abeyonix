from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
# from jose import JWTError
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.users import User


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

SECRET_KEY = "SUPER_SECRET_KEY_CHANGE_ME"
ALGORITHM = "HS256"

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        user_id: str = payload.get("sub")
        role: str = payload.get("role")

        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")

    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(User.user_id == int(user_id)).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user