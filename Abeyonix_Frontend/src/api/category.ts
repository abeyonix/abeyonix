import api from "./api";

// ---------------- TYPES ---------------- //

export interface CategoryResponse {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image_path?: string;
  is_active: boolean;
  parent_id?: number;
}

export interface CategoryPayload {
  name: string;
  description?: string;
  is_active?: boolean;
  parent_id?: number;
  image?: File | null;
}

// ---------------- CREATE ---------------- //

export const createCategory = async (
  payload: CategoryPayload
): Promise<CategoryResponse> => {
  try {
    const formData = new FormData();

    formData.append("name", payload.name);
    if (payload.description) formData.append("description", payload.description);
    if (payload.is_active !== undefined)
      formData.append("is_active", String(payload.is_active));
    if (payload.parent_id)
      formData.append("parent_id", String(payload.parent_id));
    if (payload.image) formData.append("image", payload.image);

    const response = await api.post<CategoryResponse>(
      "/categories/",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    throw error?.response?.data?.detail || "Failed to create category";
  }
};

// ---------------- GET ALL ---------------- //

export const getCategories = async (): Promise<CategoryResponse[]> => {
  try {
    const response = await api.get<CategoryResponse[]>("/categories/");
    return response.data;
  } catch (error: any) {
    throw error?.response?.data?.detail || "Failed to fetch categories";
  }
};

// ---------------- GET BY ID ---------------- //

export const getCategoryById = async (
  id: number
): Promise<CategoryResponse> => {
  try {
    const response = await api.get<CategoryResponse>(`/categories/${id}`);
    return response.data;
  } catch (error: any) {
    throw error?.response?.data?.detail || "Failed to fetch category";
  }
};

// ---------------- UPDATE ---------------- //

export const updateCategory = async (
  id: number,
  payload: Partial<CategoryPayload>
): Promise<CategoryResponse> => {
  try {
    const formData = new FormData();

    if (payload.name) formData.append("name", payload.name);
    if (payload.description)
      formData.append("description", payload.description);
    if (payload.is_active !== undefined)
      formData.append("is_active", String(payload.is_active));
    if (payload.parent_id)
      formData.append("parent_id", String(payload.parent_id));
    if (payload.image) formData.append("image", payload.image);

    const response = await api.put<CategoryResponse>(
      `/categories/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    throw error?.response?.data?.detail || "Failed to update category";
  }
};

// ---------------- DELETE ---------------- //

export const deleteCategory = async (id: number): Promise<string> => {
  try {
    const response = await api.delete<{ message: string }>(
      `/categories/${id}`
    );

    return response.data.message;
  } catch (error: any) {
    throw error?.response?.data?.detail || "Failed to delete category";
  }
};