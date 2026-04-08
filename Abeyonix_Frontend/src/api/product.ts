import api from "./api";
import { ProductDetailResponse, ProductPayload, PaginatedProductResponse } from "../types/product";

export const getProductById = async (
  productId: number
): Promise<ProductDetailResponse> => {
  const { data } = await api.get<ProductDetailResponse>(
    `/products/${productId}`
  );

  return data;
};






export const createProduct = async (
  payload: ProductPayload
): Promise<{ message: string; product_id: number }> => {
  try {
    const formData = new FormData();

    // -------- Product --------
    formData.append("name", payload.name);
    formData.append("category_id", String(payload.category_id));

    if (payload.sub_category_id)
      formData.append("sub_category_id", String(payload.sub_category_id));

    if (payload.brand) formData.append("brand", payload.brand);
    if (payload.short_description)
      formData.append("short_description", payload.short_description);
    if (payload.long_description)
      formData.append("long_description", payload.long_description);

    // -------- Pricing --------
    formData.append("price", String(payload.price));
    if (payload.discount_price !== undefined)
      formData.append("discount_price", String(payload.discount_price));

    // -------- Inventory --------
    formData.append("quantity", String(payload.quantity));
    formData.append(
      "low_quantity_alert_at",
      String(payload.low_quantity_alert_at)
    );

    // -------- Attributes --------
    formData.append("attributes", JSON.stringify(payload.attributes));

    // -------- Media --------
    payload.images.forEach((img) => {
      formData.append("images", img);
    });

    formData.append(
      "primary_image_index",
      String(payload.primary_image_index || 0)
    );

    const response = await api.post(
      "/products/",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    throw error?.response?.data?.detail || "Failed to create product";
  }
};




export const getProducts = async (params?: {
  category_id?: number;
  sub_category_id?: number;
  search?: string;
  page?: number;
  page_size?: number;
}): Promise<PaginatedProductResponse> => {
  try {
    const response = await api.get<PaginatedProductResponse>(
      "/products/",
      {
        params: {
          ...params,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    throw error?.response?.data?.detail || "Failed to fetch products";
  }
};




export const updateProduct = async (
  id: number,
  payload: ProductPayload
): Promise<{ message: string; product_id: number }> => {
  try {
    const formData = new FormData();

    // -------- Product --------
    formData.append("name", payload.name);
    formData.append("sku", payload.sku || "");
    formData.append("category_id", String(payload.category_id));

    if (payload.sub_category_id)
      formData.append("sub_category_id", String(payload.sub_category_id));

    if (payload.brand) formData.append("brand", payload.brand);
    if (payload.short_description)
      formData.append("short_description", payload.short_description);
    if (payload.long_description)
      formData.append("long_description", payload.long_description);

    // -------- Pricing --------
    formData.append("price", String(payload.price));
    if (payload.discount_price !== undefined)
      formData.append("discount_price", String(payload.discount_price));

    // -------- Inventory --------
    formData.append("quantity", String(payload.quantity));
    formData.append(
      "low_quantity_alert_at",
      String(payload.low_quantity_alert_at)
    );

    // -------- Attributes --------
    formData.append("attributes", JSON.stringify(payload.attributes));

    // -------- Existing Media --------
    if (payload.existing_media_ids) {
      formData.append(
        "existing_media_ids",
        JSON.stringify(payload.existing_media_ids)
      );
    }

    // -------- New Images --------
    if (payload.images?.length) {
      payload.images.forEach((img) => {
        formData.append("images", img);
      });
    }

    formData.append(
      "primary_image_index",
      String(payload.primary_image_index || 0)
    );

    const response = await api.put(
      `/products/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    throw error?.response?.data?.detail || "Failed to update product";
  }
};



export const deleteProduct = async (
  productId: number
): Promise<{ message: string; product_id: number }> => {
  try {
    const response = await api.delete<{
      message: string;
      product_id: number;
    }>(`/products/${productId}`);

    return response.data;
  } catch (error: any) {
    throw error?.response?.data?.detail || "Failed to delete product";
  }
};



export const updateProductStatus = async (
  productId: number,
  is_active: boolean
): Promise<{
  message: string;
  product_id: number;
  is_active: boolean;
}> => {
  try {
    const response = await api.patch(
      `/products/${productId}/status`,
      null,
      {
        params: {
          is_active,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    throw (
      error?.response?.data?.detail ||
      "Failed to update product status"
    );
  }
};