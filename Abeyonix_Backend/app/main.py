from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.db.session import engine, SessionLocal   
from app.db.base import Base
from app.db.seed_roles import seed_default_roles
from app.api.v1 import (
    auth, users, categories,
    sub_categories, attributes,
    product, shop, address, cart,
    orders, payment
)

Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Abeyonix",
    description="FastAPI backend for managing drone or iot project/components sales, 3D priniting orders and drone service",
    version="1.0.0"
)

# app.mount("/media", StaticFiles(directory="media"), name="media")


# Add Startup Event
@app.on_event("startup")
def startup_event():
    db = SessionLocal()
    try:
        seed_default_roles(db)
    finally:
        db.close()


# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # Change to frontend domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register Routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(address.router)
app.include_router(categories.router)
app.include_router(sub_categories.router)
app.include_router(attributes.router)
app.include_router(product.router)
app.include_router(shop.router)
app.include_router(cart.router)
app.include_router(orders.router)
app.include_router(payment.router)


# Health Check
@app.get("/")
def root():
    return {"message": "Abeyonix API is running "}