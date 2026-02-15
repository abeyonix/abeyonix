import api from "./api";

/* -------------------- Types -------------------- */


export interface CartProductInfo {
  product_id: number;
  name: string;
  slug: string;
  category_name?: string;
  sub_category_name?: string;
  primary_image?: string;
  stock_quantity?: number;
}

export interface CartItemResponse {
  id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  is_active: boolean;
  product: CartProductInfo;
}

export interface CartListResponse {
  total_items: number;
  items: CartItemResponse[];
}

export interface CartItemCreate {
  user_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  session_id?: string;
}

// export interface CartItemResponse {
//   id: number;
//   user_id: number;
//   product_id: number;
//   quantity: number;
//   unit_price: number;
//   total_price: number;
//   is_active: boolean;
//   session_id?: string;
//   created_at?: string;
//   updated_at?: string;
// }

export interface CartItemUpdate {
  quantity?: number;
  is_active?: boolean;
}

export interface MessageResponse {
  message: string;
}

/* -------------------- API -------------------- */

export const getCartItems = async (
  userId: number
): Promise<CartListResponse> => {
  const { data } = await api.get<CartListResponse>(
    `/cart/${userId}`
  );

  return data;
};


export const addCartItem = async (
  payload: CartItemCreate
): Promise<CartItemResponse> => {
  const { data } = await api.post<CartItemResponse>(
    "/cart",
    payload
  );

  return data;
};


export const updateCartItem = async (
  cartItemId: number,
  payload: CartItemUpdate
): Promise<MessageResponse> => {
  const { data } = await api.put<MessageResponse>(
    `/cart/${cartItemId}`,
    payload
  );

  return data;
};


export const deleteCartItem = async (
  cartItemId: number
): Promise<MessageResponse> => {
  const { data } = await api.delete<MessageResponse>(
    `/cart/${cartItemId}`
  );

  return data;
};



export const clearCart = async (
  userId: number
): Promise<MessageResponse> => {
  const { data } = await api.delete<MessageResponse>(
    `/cart/clear/${userId}`
  );

  return data;
};