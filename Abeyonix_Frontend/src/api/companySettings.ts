import api from "./api";

import { CompanySettingsResponse, CompanySettingsPayload } from "../types/companySettings";



// =====================================================
// CREATE
// =====================================================

export const createCompanySettings = async (
  payload: CompanySettingsPayload
): Promise<CompanySettingsResponse> => {
  try {
    const formData = new FormData();

    formData.append("company_name", payload.company_name);

    if (payload.company_email)
      formData.append("company_email", payload.company_email);

    if (payload.company_phone)
      formData.append("company_phone", payload.company_phone);

    if (payload.address_line1)
      formData.append("address_line1", payload.address_line1);

    if (payload.city)
      formData.append("city", payload.city);

    if (payload.state)
      formData.append("state", payload.state);

    if (payload.postal_code)
      formData.append("postal_code", payload.postal_code);

    if (payload.country)
      formData.append("country", payload.country);

    if (payload.gst_number)
      formData.append("gst_number", payload.gst_number);

    if (payload.website)
      formData.append("website", payload.website);

    if (payload.logo) formData.append("logo", payload.logo);

    const response = await api.post<CompanySettingsResponse>(
      "/company-settings/",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    throw (
      error?.response?.data?.detail ||
      "Failed to create company settings"
    );
  }
};

// =====================================================
// GET ALL
// =====================================================

export const getCompanySettings = async (): Promise<
  CompanySettingsResponse[]
> => {
  try {
    const response = await api.get<CompanySettingsResponse[]>(
      "/company-settings/"
    );

    return response.data;
  } catch (error: any) {
    throw (
      error?.response?.data?.detail ||
      "Failed to fetch company settings"
    );
  }
};

// =====================================================
// GET BY ID
// =====================================================

export const getCompanySettingsById = async (
  id: number
): Promise<CompanySettingsResponse> => {
  try {
    const response = await api.get<CompanySettingsResponse>(
      `/company-settings/${id}`
    );

    return response.data;
  } catch (error: any) {
    throw (
      error?.response?.data?.detail ||
      "Failed to fetch company settings"
    );
  }
};

// =====================================================
// UPDATE
// =====================================================

export const updateCompanySettings = async (
  id: number,
  payload: Partial<CompanySettingsPayload>
): Promise<CompanySettingsResponse> => {
  try {
    const formData = new FormData();

    if (payload.company_name)
      formData.append("company_name", payload.company_name);

    if (payload.company_email)
      formData.append("company_email", payload.company_email);

    if (payload.company_phone)
      formData.append("company_phone", payload.company_phone);

    if (payload.address_line1)
      formData.append("address_line1", payload.address_line1);

    if (payload.city)
      formData.append("city", payload.city);

    if (payload.state)
      formData.append("state", payload.state);

    if (payload.postal_code)
      formData.append("postal_code", payload.postal_code);

    if (payload.country)
      formData.append("country", payload.country);

    if (payload.gst_number)
      formData.append("gst_number", payload.gst_number);

    if (payload.website)
      formData.append("website", payload.website);

    if (payload.logo)
      formData.append("logo", payload.logo);

    const response = await api.put<CompanySettingsResponse>(
      `/company-settings/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    throw (
      error?.response?.data?.detail ||
      "Failed to update company settings"
    );
  }
};

// =====================================================
// DELETE
// =====================================================

export const deleteCompanySettings = async (
  id: number
): Promise<string> => {
  try {
    const response = await api.delete<{ message: string }>(
      `/company-settings/${id}`
    );

    return response.data.message;
  } catch (error: any) {
    throw (
      error?.response?.data?.detail ||
      "Failed to delete company settings"
    );
  }
};