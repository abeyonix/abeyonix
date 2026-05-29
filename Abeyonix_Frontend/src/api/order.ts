import api from "./api";
import { 
  CheckoutPageResponse, 
  InitiatePaymentRequest, 
  InitiatePaymentResponse, 
  OrderDetailsResponse, 
  PlaceOrderRequest, 
  PlaceOrderResponse,
  UserOrderListResponse ,
  VerifyPaymentRequest
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
// Place order (after successful payment)
// --------------------------------------------------------
// export const placeOrder = async (
//   payload: PlaceOrderRequest
// ): Promise<PlaceOrderResponse> => {
//   try {
//     const response = await api.post<PlaceOrderResponse>("/orders/place-order", payload)

//     return response.data
//   } catch (error: any) {
//     throw error?.response?.data?.detail || "Failed to place order"
//   }
// }

// =====================================================
// GET USER ORDERS (For Order History page)
// =====================================================



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


// =====================================================
// GET ORDER DETAILS (for both user and admin)
// =====================================================

export const getOrderDetails = async (
  orderIdentifier: string | number
): Promise<OrderDetailsResponse> => {
  try {
    const response = await api.get<OrderDetailsResponse>(
      `/orders/${orderIdentifier}`
    )

    return response.data
  } catch (error: any) {
    throw (
      error?.response?.data?.detail ||
      "Failed to fetch order details"
    )
  }
}

// =====================================================
// GET ADMIN ORDERS (with pagination and search)
// =====================================================



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


// =====================================================
// UPDATE ORDER TRACKING (Admin)
// =====================================================  



export const updateOrderTracking = async (payload: {
  order_id: number;
  status: string;
  description?: string;
  location?: string;

  tracking_id?: string;
  carrier_name?: string;
  tracking_url?: string;
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
// Initiate Razorpay payment
// --------------------------------------------------------


export const initiatePayment = async (
  payload: InitiatePaymentRequest
): Promise<InitiatePaymentResponse> => {
  try {
    const response = await api.post<InitiatePaymentResponse>(
      "/initiate-payment",
      payload
    );
    return response.data;
  } catch (error: any) {
    throw error?.response?.data?.detail || "Failed to initiate payment";
  }
};

export const verifyPayment = async (
  payload: VerifyPaymentRequest
): Promise<PlaceOrderResponse> => {
  try {
    const response = await api.post<PlaceOrderResponse>(
      "/orders/verify-payment",
      payload
    );
    return response.data;
  } catch (error: any) {
    throw error?.response?.data?.detail || "Payment verification failed";
  }
};


// --------------------------------------------------------
// Cancel Order (User)
// --------------------------------------------------------

export const cancelOrder = async (
  orderId: number
): Promise<any> => {
  try {
    const response = await api.post(
      `/orders/cancel-order/${orderId}`
    );

    return response.data;
  } catch (error: any) {
    throw (
      error?.response?.data?.detail ||
      "Failed to cancel order"
    );
  }
};