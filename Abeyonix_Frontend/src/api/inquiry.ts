import api from "./api";

export interface InquiryPayload {
  name: string;
  email: string;
  telephone?: string;
  message: string;
}

export interface InquiryResponse {
  id: number;
  name: string;
  email: string;
  telephone?: string;
  message: string;
  status: string;
  created_at: string;
}


export interface InquiryListResponse {
  total_records: number;
  page: number;
  page_size: number;
  total_pages: number;
  records: InquiryResponse[];
}



export const createInquiry = async (
  payload: InquiryPayload
): Promise<InquiryResponse> => {
  try {
    const { data } = await api.post<InquiryResponse>(
      "/inquiry/",
      payload
    );

    return data;
  } catch (error: any) {
    throw (
      error?.response?.data?.detail ||
      "Failed to submit inquiry"
    );
  }
};



export const getInquiries = async (params?: {
  page?: number;
  page_size?: number;
}): Promise<InquiryListResponse> => {
  try {
    const { data } = await api.get<InquiryListResponse>(
      "/inquiry/",
      {
        params: {
          page: params?.page || 1,
          page_size: params?.page_size || 10,
        },
      }
    );

    return data;
  } catch (error: any) {
    throw (
      error?.response?.data?.detail ||
      "Failed to fetch inquiries"
    );
  }
};