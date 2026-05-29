export interface CompanySettingsResponse {
  id: number;

  company_name?: string;
  company_email?: string;
  company_phone?: string;

  address_line1?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;

  gst_number?: string;
  website?: string;

  logo_url?: string;
}

export interface CompanySettingsPayload {
  company_name: string;
  company_email?: string;
  company_phone?: string;

  address_line1?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;

  gst_number?: string;
  website?: string;

  logo?: File | null;
}
