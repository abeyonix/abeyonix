from pydantic import BaseModel
from typing import List, Optional
from decimal import Decimal
from datetime import datetime

class InitiatePaymentRequest(BaseModel):
    user_id: int
    amount: Decimal
    flow_type: str  # CART / BUY_NOW
    payload: dict



class InitiatePaymentRequest(BaseModel):
    user_id:    int
    address_id: int
    product_id: Optional[int] = None
    quantity:   Optional[int] = 1

class InitiatePaymentResponse(BaseModel):
    razorpay_order_id: str
    amount:            int        # in paise (₹1 = 100 paise)
    currency:          str
    key_id:            str        # sent to frontend to open Razorpay checkout

class VerifyPaymentRequest(BaseModel):
    razorpay_order_id:   str
    razorpay_payment_id: str
    razorpay_signature:  str