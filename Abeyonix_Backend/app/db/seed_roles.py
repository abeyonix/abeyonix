from sqlalchemy.orm import Session
from app.models.users import Role


def seed_default_roles(db: Session):
    default_roles = [
        {"role_id": 1, "role_name": "admin", "description": "System Administrator"},
        {"role_id": 2, "role_name": "customer", "description": "Application Customer"},
    ]

    for role_data in default_roles:
        role = db.query(Role).filter(
            (Role.role_id == role_data["role_id"]) |
            (Role.role_name == role_data["role_name"])
        ).first()

        if not role:
            db.add(Role(**role_data))

    db.commit()
