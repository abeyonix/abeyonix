export interface CheckoutProduct {
  product_id: number;
  product_name: string;
  sku: string;
  unit_price: string;     // Decimal → safest as string
  quantity: number;
  total_price: string;    // Decimal → safest as string
  primary_image?: string;
}

export interface CheckoutAddress {
  address_id: number;
  address_line1: string;
  address_line2?: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

export interface CheckoutUserInfo {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

export interface CheckoutPageResponse {
  user: CheckoutUserInfo;
  address: CheckoutAddress[];
  products: CheckoutProduct[];
  subtotal: string;       // Decimal
  tax: string;            // Decimal
  shipping: string;       // Decimal
  total_amount: string;   // Decimal
}


// ----------------------------------------


export interface InitiatePaymentRequest {
  user_id: number;
  amount: string; // Decimal → send as string
  flow_type: "CART" | "BUY_NOW";
  payload: Record<string, any>;
}

export interface InitiatePaymentResponse {
  transactionId: string;
  paymentUrl: string;
}