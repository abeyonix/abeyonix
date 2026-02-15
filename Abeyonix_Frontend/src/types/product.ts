export interface ProductMedia {
  id: number;
  product_id: number;
  url: string;
  media_type: string;
  is_primary: boolean;
}

export interface ProductPricing {
  id: number;
  product_id: number;
  price: number;
  discount_price?: number | null;
  currency?: string;
}

export interface ProductInventory {
  id: number;
  product_id: number;
  quantity: number;
  reserved?: number;
}

export interface ProductAttribute {
  attribute_id: number;
  attribute_name: string;
  unit?: string | null;
  value: string;
}

export interface ProductDetailResponse {
  id: number;
  name: string;
  sku: string;
  slug: string;

  category_id: number;
  category_name: string;

  sub_category_id?: number | null;
  sub_category_name?: string | null;

  brand?: string | null;
  short_description?: string | null;
  long_description?: string | null;

  is_active: boolean;
  created_at: string;
  updated_at: string;

  pricing: ProductPricing | null;
  inventory: ProductInventory | null;
  attributes: ProductAttribute[];
  media: ProductMedia[];
}
