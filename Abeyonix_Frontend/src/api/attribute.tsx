import api from "./api";

export interface AttributePayload {
  name: string;
  unit?: string;
  data_type?: string;
}

export interface AttributeResponse {
  id: number;
  name: string;
  unit?: string;
  data_type?: string;
}

// CREATE Attribute
export const createAttribute = async (
  payload: AttributePayload
): Promise<AttributeResponse> => {
  try {
    const response = await api.post<AttributeResponse>(
      "/attributes/",
      payload
    );

    return response.data;
  } catch (error: any) {
    throw error?.response?.data?.detail || "Failed to create attribute";
  }
};


// GET ALL Attributes
export const getAttributes = async (): Promise<AttributeResponse[]> => {
  try {
    const response = await api.get<AttributeResponse[]>(
      "/attributes/"
    );

    return response.data;
  } catch (error: any) {
    throw error?.response?.data?.detail || "Failed to fetch attributes";
  }
};


// GET SINGLE Attribute
export const getAttributeById = async (
  id: number
): Promise<AttributeResponse> => {
  try {
    const response = await api.get<AttributeResponse>(
      `/attributes/${id}`
    );

    return response.data;
  } catch (error: any) {
    throw error?.response?.data?.detail || "Failed to fetch attribute";
  }
};


// UPDATE Attribute
export const updateAttribute = async (
  id: number,
  payload: Partial<AttributePayload>
): Promise<AttributeResponse> => {
  try {
    const response = await api.put<AttributeResponse>(
      `/attributes/${id}`,
      payload
    );

    return response.data;
  } catch (error: any) {
    throw error?.response?.data?.detail || "Failed to update attribute";
  }
};


// DELETE Attribute
export const deleteAttribute = async (
  id: number
): Promise<{ message: string }> => {
  try {
    const response = await api.delete<{ message: string }>(
      `/attributes/${id}`
    );

    return response.data;
  } catch (error: any) {
    throw error?.response?.data?.detail || "Failed to delete attribute";
  }
};

// --------------------------
//
// --------------------------


export interface CategoryAttributePayload {
  category_id: number;
  sub_category_id?: number;
  attribute_id: number;
}

export interface CategoryAttributeResponse {
  id: number;
  category_id: number;
  sub_category_id?: number;
  attribute_id: number;

  category_name?: string;
  sub_category_name?: string;
  attribute_name?: string;
}

// CREATE Category Attribute
export const createCategoryAttribute = async (
  payload: CategoryAttributePayload
): Promise<CategoryAttributeResponse> => {
  try {
    const response = await api.post<CategoryAttributeResponse>(
      "/category-attributes/",
      payload
    );

    return response.data;
  } catch (error: any) {
    throw error?.response?.data?.detail || "Failed to create category attribute";
  }
};


// GET ALL Category Attributes
export const getCategoryAttributes = async (
  params?: {
    category_id?: number;
    sub_category_id?: number;
  }
): Promise<CategoryAttributeResponse[]> => {
  try {
    const response = await api.get<CategoryAttributeResponse[]>(
      "/category-attributes/",
      {
        params: {
          ...(params?.category_id && { category_id: params.category_id }),
          ...(params?.sub_category_id && {
            sub_category_id: params.sub_category_id,
          }),
        },
      }
    );

    return response.data;
  } catch (error: any) {
    throw error?.response?.data?.detail || "Failed to fetch category attributes";
  }
};


// GET SINGLE Category Attribute
export const getCategoryAttributeById = async (
  id: number
): Promise<CategoryAttributeResponse> => {
  try {
    const response = await api.get<CategoryAttributeResponse>(
      `/category-attributes/${id}`
    );

    return response.data;
  } catch (error: any) {
    throw error?.response?.data?.detail || "Failed to fetch category attribute";
  }
};


// UPDATE Category Attribute
export const updateCategoryAttribute = async (
  id: number,
  payload: Partial<CategoryAttributePayload>
): Promise<CategoryAttributeResponse> => {
  try {
    const response = await api.put<CategoryAttributeResponse>(
      `/category-attributes/${id}`,
      payload
    );

    return response.data;
  } catch (error: any) {
    throw error?.response?.data?.detail || "Failed to update category attribute";
  }
};


// DELETE Category Attribute
export const deleteCategoryAttribute = async (
  id: number
): Promise<void> => {
  try {
    await api.delete(`/category-attributes/${id}`);
  } catch (error: any) {
    throw error?.response?.data?.detail || "Failed to delete category attribute";
  }
};