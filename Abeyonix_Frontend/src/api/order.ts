import api from "./api";
import { 
  CheckoutPageResponse, 
  InitiatePaymentRequest, 
  InitiatePaymentResponse, 
  PlaceOrderRequest, 
  PlaceOrderResponse ,
  UserOrderListResponse 
} from "@/types/order";


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
export const placeOrder = async (
  payload: PlaceOrderRequest
): Promise<PlaceOrderResponse> => {
  try {
    const response = await api.post<PlaceOrderResponse>("/orders/place-order", payload)

    return response.data
  } catch (error: any) {
    throw error?.response?.data?.detail || "Failed to place order"
  }
}



export const getUserOrders = async (
  userId: number
): Promise<UserOrderListResponse> => {
  try {
    const response = await api.get<UserOrderListResponse>(
      `/orders/user/${userId}`
    )

    return response.data
  } catch (error: any) {
    throw error?.response?.data?.detail || "Failed to fetch user orders"
  }
}



export const getAdminOrders = async (params?: {
  page?: number;
  page_size?: number;
  search?: string;
}): Promise<any> => {
  try {
    const response = await api.get(
      "/orders/admin/",
      {
        params: {
          page: params?.page || 1,
          page_size: params?.page_size || 10,
          ...(params?.search && { search: params.search }),
        },
      }
    );

    return response.data;
  } catch (error: any) {
    throw error?.response?.data?.detail || "Failed to fetch admin orders";
  }
};




export const updateOrderTracking = async (payload: {
  order_id: number;
  status: string;
  description?: string;
  location?: string;
}): Promise<any> => {
  try {
    const response = await api.post(
      "/orders/update-tracking",
      payload
    );

    return response.data;
  } catch (error: any) {
    throw (
      error?.response?.data?.detail ||
      "Failed to update order tracking"
    );
  }
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