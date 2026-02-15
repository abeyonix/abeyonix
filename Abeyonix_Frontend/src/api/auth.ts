import api from "./api";
import {
    LoginRequest,
    LoginResponse,
    UserRegisterRequest,
    UserRegisterResponse,
    VerifyOTPRequest,
    MessageResponse,
    ResendOTPRequest,
    ResetPasswordRequest
} from "../types/auth";




export const login = async (
    payload: LoginRequest
): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>(
        "/auth/login",
        payload
    );

    return data;
};



export const register = async (
    payload: UserRegisterRequest
): Promise<UserRegisterResponse> => {
    const { data } = await api.post<UserRegisterResponse>(
        "/auth/register",
        payload
    );

    return data;
};



export const verifyRegistrationOtp = async (
  payload: VerifyOTPRequest
): Promise<MessageResponse> => {
  const { data } = await api.post<MessageResponse>(
    "/auth/verify-otp",
    payload
  );

  return data;
};



export const resendRegistrationOtp = async (
  payload: ResendOTPRequest
): Promise<MessageResponse> => {
  const { data } = await api.post<MessageResponse>(
    "/auth/resend-otp",
    payload
  );

  return data;
};




export const sendForgotPasswordOtp = async (
  email: string
): Promise<MessageResponse> => {
  const { data } = await api.post<MessageResponse>(
    "/auth/forgot-password",
    null, // no body
    {
      params: { email },
    }
  );

  return data;
};



export const verifyForgotPasswordOtp = async (
  payload: VerifyOTPRequest
): Promise<MessageResponse> => {
  const { data } = await api.post<MessageResponse>(
    "auth/verify-forgot-password-otp",
    payload
  );

  return data;
};



export const resetPassword = async (
  payload: ResetPasswordRequest
): Promise<MessageResponse> => {
  const { data } = await api.post<MessageResponse>(
    "auth/reset-password",
    payload
  );

  return data;
};