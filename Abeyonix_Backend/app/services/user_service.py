from sqlalchemy.orm import Session
from app.models.users import *

def get_admin_emails(db: Session):
    return [
        user.email
        for user in db.query(User)
        .filter(
            User.role_id == 1,   # ✅ Admin role_id
            User.is_active == True
        )
        .all()
    ]