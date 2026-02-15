from pydantic import BaseModel
from typing import List, Optional
from decimal import Decimal
from datetime import datetime

class InitiatePaymentRequest(BaseModel):
    user_id: int
    amount: Decimal
    flow_type: str  # CART / BUY_NOW
    payload: dict
