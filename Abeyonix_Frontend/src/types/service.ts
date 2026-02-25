export interface ServiceCreate {
  name: string;
  email: string;
  mobile_number: string;
  city: string;
  service_type: string;
  message?: string;
}

export interface ServiceResponse {
  id: number;
  name: string;
  email: string;
  mobile_number: string;
  city: string;
  service_type: string;
  message?: string;
  created_at?: string;
}