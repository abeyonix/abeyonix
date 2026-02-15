export interface UserAddressBase {
  address_type: string;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  is_default?: boolean;
}

export interface UserAddressCreate extends UserAddressBase {}

export interface UserAddressResponse extends UserAddressBase {
  address_id: number;
}


export interface UserAddressUpdate {
  address_type?: string;
  address_line1?: string;
  address_line2?: string | null;
  city?: string;
  state_province?: string;
  postal_code?: string;
  country?: string;
  is_default?: boolean;
}


export interface MessageResponse {
  message: string;
}