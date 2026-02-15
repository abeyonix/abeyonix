import api from "./api";
import {
  GetShopProductsParams,
  ShopProductScrollResponse,
  ProductSearchResponse
} from "../types/shop";

export const getCategoryTree = async () => {
  const response = await api.get("/category-tree");
  return response.data;
};



export const getShopProducts = async (
  params: GetShopProductsParams = {}
): Promise<ShopProductScrollResponse> => {
  const { data } = await api.get<ShopProductScrollResponse>(
    "/shop/products",
    {
      params: {
        limit: 12, // default
        ...params,
      },
    }
  );

  return data;
};


/**
 * Search products with cursor-based pagination
 * GET /api/v1/product/search
 */
export const searchProducts = async (params: {
  search?: string;
  cursor?: number;
  limit?: number;
}): Promise<ProductSearchResponse> => {
  const { data } = await api.get<ProductSearchResponse>(
    "/product/search",
    { params }
  );

  return data;
};