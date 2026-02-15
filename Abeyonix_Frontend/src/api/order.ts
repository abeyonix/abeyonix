import api from "./api";
import { CheckoutPageResponse, InitiatePaymentRequest, InitiatePaymentResponse } from "@/types/order";


/**
 * Get checkout page data
 * - Cart flow → no product_id
 * - Buy now flow → product_id + quantity
 */
export const getCheckout = async (params: {
  user_id: number;
  product_id?: number;
  quantity?: number;
}): Promise<CheckoutPageResponse> => {
  const { data } = await api.get<CheckoutPageResponse>(
    "/orders/checkout-page",
    {
      params,
    }
  );

  return data;
};

// --------------------------------------------------------


export const initiatePayment = async (
  payload: InitiatePaymentRequest
): Promise<InitiatePaymentResponse> => {
  const { data } = await api.post<InitiatePaymentResponse>(
    "/orders/payment/initiate",
    payload
  );

  return data;
};