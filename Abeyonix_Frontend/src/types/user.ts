export interface UserResponse {
  user_id: number;
  user_identity_id: string;

  user_name: string;
  email: string;

  first_name: string;
  last_name: string;

  phone?: string | null;
  alternative_phone?: string | null;

  role_id: number;
  role_name: string;

  profile_image_url?: string | null;

  is_verify: boolean;
  is_active: boolean;

  created_at: string;
  updated_at: string;
  last_login?: string | null;
}



export interface UpdateUserPayload {
  user_name?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  alternative_phone?: string;
  role_id?: number;
  is_active?: boolean;
  is_verify?: boolean;
  profile_image?: File;
}
