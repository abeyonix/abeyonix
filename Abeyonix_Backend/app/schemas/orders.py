from pydantic import BaseModel
from typing import List, Optional
from decimal import Decimal
from datetime import datetime


class CheckoutPageRequest(BaseModel):
    user_id: int
    product_id: Optional[int] = None  # present only for Buy Now
    quantity: Optional[int] = 1

class CheckoutProduct(BaseModel):
    product_id: int
    product_name: str
    sku: str
    unit_price: Decimal
    quantity: int
    total_price: Decimal
    primary_image: Optional[str]

    class Config:
        from_attributes = True

class CheckoutAddress(BaseModel):
    address_id: int
    address_line1: str
    address_line2: Optional[str]
    city: str
    state_province: str
    postal_code: str
    country: str
    is_default:bool

    class Config:
        from_attributes = True


class CheckoutUserInfo(BaseModel):
    user_id: int
    first_name: str
    last_name: str
    email: str
    phone: str

    class Config:
        from_attributes = True

class CheckoutPageResponse(BaseModel):
    user: CheckoutUserInfo
    address: List[CheckoutAddress]
    products: List[CheckoutProduct]

    subtotal: Decimal
    tax: Decimal
    shipping: Decimal
    total_amount: Decimal

# -------------------------------------------------------


class PlaceOrderRequest(BaseModel):
    user_id: int
    address_id: int

    # Buy Now flow
    product_id: Optional[int] = None
    quantity: Optional[int] = 1


class PlaceOrderResponse(BaseModel):
    order_id: int
    order_number: str
    total_amount: Decimal
    order_status: str


class OrderItemResponse(BaseModel):
    product_id: int
    product_name: str
    sku: str
    unit_price: Decimal
    quantity: int
    total_price: Decimal

    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    order_id: int
    order_number: str
    total_amount: Decimal
    items: List[OrderItemResponse]

    class Config:
        from_attributes = True




class OrderItemDetails(BaseModel):
    product_id: int
    product_name: str
    sku: str
    unit_price: Decimal
    quantity: int
    total_price: Decimal
    primary_image: Optional[str]

    class Config:
        from_attributes = True


class OrderDetailsResponse(BaseModel):
    order_id: int
    order_number: str
    order_status: str
    payment_status: str
    subtotal_amount: Decimal
    tax_amount: Decimal
    shipping_amount: Decimal
    discount_amount: Decimal
    total_amount: Decimal
    created_at: datetime

    items: List[OrderItemDetails]

    class Config:
        from_attributes = True




class UserOrderItemInfo(BaseModel):
    product_id: int
    product_name: str
    sku: str
    quantity: int
    unit_price: Decimal
    total_price: Decimal
    primary_image: Optional[str]

    class Config:
        from_attributes = True


class OrderTrackingInfo(BaseModel):
    status: str
    description: Optional[str]
    location: Optional[str]
    updated_at: datetime

    class Config:
        from_attributes = True


class UserOrderWithItems(BaseModel):
    order_id: int
    order_number: str
    order_status: str
    payment_status: str
    total_amount: Decimal
    created_at: datetime
    items: List[UserOrderItemInfo]
    tracking: List[OrderTrackingInfo]


class UserOrderListResponse(BaseModel):
    total_orders: int
    orders: List[UserOrderWithItems]

class AdminOrderListResponse(BaseModel):
    total_orders: int
    page: int
    page_size: int

    total_count: int  # all records count (for pagination)

    widgets: dict

    orders: List[UserOrderWithItems]



class UpdateOrderTrackingRequest(BaseModel):
    order_id: int
    status: str
    description: Optional[str] = None
    location: Optional[str] = None