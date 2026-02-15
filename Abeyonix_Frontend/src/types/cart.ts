
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