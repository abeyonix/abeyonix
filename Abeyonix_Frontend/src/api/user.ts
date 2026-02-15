import api from "./api";
import { UserResponse, UpdateUserPayload } from "../types/user";

export const getUserById = async (
  userId: number
): Promise<UserResponse> => {
  const { data } = await api.get<UserResponse>(
    `/users/${userId}`
  );

  return data;
};


export const updateUser = async (
  userId: number,
  payload: UpdateUserPayload
): Promise<UserResponse> => {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (key === "profile_image" && value instanceof File) {
        formData.append(key, value);
      } else {
        formData.append(key, String(value));
      }
    }
  });

  const { data } = await api.put<UserResponse>(
    `/users/${userId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data;
};
