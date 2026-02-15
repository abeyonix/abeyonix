import api from "./api";
import { ProductDetailResponse } from "../types/product";

export const getProductById = async (
  productId: number
): Promise<ProductDetailResponse> => {
  const { data } = await api.get<ProductDetailResponse>(
    `/products/${productId}`
  );

  return data;
};
