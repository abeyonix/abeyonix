import api from "./api";

export interface SubCategoryPayload {
  name: string;
  category_id: number;
  description?: string;
  is_active?: boolean;
  image?: File;
}

export interface SubCategoryResponse {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image_path?: string;
  is_active: boolean;
  category_id: number;
  category_name?: string;
}


// CREATE SubCategory
export const createSubCategory = async (
  payload: SubCategoryPayload
): Promise<SubCategoryResponse> => {
  try {
    const formData = new FormData();

    formData.append("name", payload.name);
    formData.append("category_id", String(payload.category_id));

    if (payload.description)
      formData.append("description", payload.description);

    if (payload.is_active !== undefined)
      formData.append("is_active", String(payload.is_active));

    if (payload.image)
      formData.append("image", payload.image);

    const response = await api.post<SubCategoryResponse>(
      "/sub-categories/",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    throw error?.response?.data?.detail || "Failed to create sub category";
  }
};



// GET ALL SubCategories
export const getSubCategories = async (): Promise<SubCategoryResponse[]> => {
  try {
    const response = await api.get<SubCategoryResponse[]>(
      "/sub-categories/"
    );

    return response.data;
  } catch (error: any) {
    throw error?.response?.data?.detail || "Failed to fetch sub categories";
  }
};


// GET SINGLE SubCategory
export const getSubCategoryById = async (
  id: number
): Promise<SubCategoryResponse> => {
  try {
    const response = await api.get<SubCategoryResponse>(
      `/sub-categories/${id}`
    );

    return response.data;
  } catch (error: any) {
    throw error?.response?.data?.detail || "Failed to fetch sub category";
  }
};



// UPDATE SubCategory
export const updateSubCategory = async (
  id: number,
  payload: Partial<SubCategoryPayload>
): Promise<SubCategoryResponse> => {
  try {
    const formData = new FormData();

    if (payload.name)
      formData.append("name", payload.name);

    if (payload.category_id)
      formData.append("category_id", String(payload.category_id));

    if (payload.description)
      formData.append("description", payload.description);

    if (payload.is_active !== undefined)
      formData.append("is_active", String(payload.is_active));

    if (payload.image)
      formData.append("image", payload.image);

    const response = await api.put<SubCategoryResponse>(
      `/sub-categories/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    throw error?.response?.data?.detail || "Failed to update sub category";
  }
};


// DELETE SubCategory
export const deleteSubCategory = async (
  id: number
): Promise<{ message: string }> => {
  try {
    const response = await api.delete<{ message: string }>(
      `/sub-categories/${id}`
    );

    return response.data;
  } catch (error: any) {
    throw error?.response?.data?.detail || "Failed to delete sub category";
  }
};