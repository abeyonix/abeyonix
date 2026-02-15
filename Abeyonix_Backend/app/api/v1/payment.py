from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.sql import func
from decimal import Decimal
import uuid
import json
import httpx
from app.core.config import *
from app.utils.phonepe import *
from app.db.session import get_db
from app.models.orders import Order, OrderItem
from app.models.cart import CartItem
from app.models.payment import PaymentSession, Payment
from app.schemas.payment import *
from app.api.v1.orders import create_order_from_cart, create_order_from_buy_now

router = APIRouter(prefix="/api/v1", tags=["Payment"])


@router.post("/payment/initiate")
async def initiate_payment(req: InitiatePaymentRequest, db: Session = Depends(get_db)):
    try:
        transaction_id = str(uuid.uuid4())

        amount_in_paise = int(req.amount * 100)
        # 1️⃣ store session first
        session = PaymentSession(
            transaction_id=transaction_id,
            user_id=req.user_id,
            flow_type=req.flow_type,
            payload=req.payload ,
            amount=amount_in_paise,
        )
        db.add(session)
        db.commit()

        # 2️⃣ call phonepe

        payload = {
            "merchantId": MERCHANT_ID,
            "merchantTransactionId": transaction_id,
            "merchantUserId": "USER_123",
            "amount": amount_in_paise,  # paise
            "redirectUrl": "http://192.168.1.7:8080/payment-status",
            "redirectMode": "GET",
            "callbackUrl": "https://appropriative-carie-unusuriously.ngrok-free.dev/api/v1/payment/callback",
            "mobileNumber": "9999999999",
            "paymentInstrument": {
                "type": "PAY_PAGE"
            },
        }

        base64_payload, x_verify = generate_x_verify(payload)

        headers = {
            "Content-Type": "application/json",
            "X-VERIFY": x_verify,
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(
                PHONEPE_BASE_URL + PAY_ENDPOINT,
                json={"request": base64_payload},
                headers=headers,
            )

        data = response.json()

        if data.get("success"):
            pay_url = data["data"]["instrumentResponse"]["redirectInfo"]["url"]
            return {
                "transactionId": transaction_id,
                "paymentUrl": pay_url,
            }
        else:
            raise HTTPException(400, detail=data)

    except Exception as e:
        raise HTTPException(500, str(e))
    



@router.post("/payment/callback")
def payment_callback(response: dict, db: Session = Depends(get_db)):

    transaction_id = response.get("transactionId")

    session = db.query(PaymentSession).filter_by(
        transaction_id=transaction_id
    ).first()

    if not session:
        raise HTTPException(404, "Session not found")

    if session.status == "SUCCESS":
        return {"message": "Already processed"}

    # verify phonepe success here

    session.status = "SUCCESS"

    if session.flow_type == "CART":
        create_order_from_cart(session, db)

    elif session.flow_type == "BUY_NOW":
        create_order_from_buy_now(session, db)

    db.commit()
    return {"message": "Order created"}