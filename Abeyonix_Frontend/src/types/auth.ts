export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;

  user_id: number;
  user_identity_id: string;

  user_name: string;
  full_name: string;
  email: string;

  role: string;
}



export interface UserRegisterRequest {
  user_name: string;
  email: string;
  password: string;

  first_name: string;
  last_name: string;

  phone?: string;
}

export interface UserRegisterResponse {
  user_id: number;
  user_name: string;
  email: string;

  first_name: string;
  last_name: string;
  phone?: string | null;

  role_id: number;
  is_verify: boolean;
  is_active: boolean;

  created_at: string;
}



// ---------------------------------------------


export interface VerifyOTPRequest {
  email: string;
  otp: string;
}

export interface MessageResponse {
  message: string;
}



// ---------------------------------------------


export interface ResendOTPRequest {
  email: string;
}


export interface ResetPasswordRequest {
  email: string;
  new_password: string;
}