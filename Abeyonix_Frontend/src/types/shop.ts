export interface ShopProductItem {
  id: number;
  name: string;
  slug: string;
  sku: string;

  category_id: number;
  category_name: string;

  sub_category_id?: number | null;
  sub_category_name?: string | null;

  brand?: string | null;

  price?: number | null;
  discount_price?: number | null;

  primary_image?: string | null;
}

export interface ShopProductScrollResponse {
  items: ShopProductItem[];
  last_id: number | null;
  has_more: boolean;
}

export interface GetShopProductsParams {
  category_id?: number;
  sub_category_id?: number;
  last_id?: number;
  limit?: number;
}

export interface ProductSearchItem {
  id: number;
  name: string;
  primary_image?: string;
  price: number;
}

export interface ProductSearchResponse {
  next_cursor?: number | null;
  items: ProductSearchItem[];
}
