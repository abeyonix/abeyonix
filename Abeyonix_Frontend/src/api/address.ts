import api from "./api";
import {
  UserAddressCreate,
  UserAddressResponse,
  UserAddressUpdate,
  MessageResponse
} from "../types/address";




export const createUserAddress = async (
  userId: number,
  payload: UserAddressCreate
): Promise<UserAddressResponse> => {
  const { data } = await api.post<UserAddressResponse>(
    "/addresses",
    payload,
    {
      params: {
        user_id: userId,
      },
    }
  );

  return data;
};



export const getUserAddresses = async (
  userId: number
): Promise<UserAddressResponse[]> => {
  const { data } = await api.get<UserAddressResponse[]>(
    "/addresses",
    {
      params: {
        user_id: userId,
      },
    }
  );

  return data;
};



export const getUserAddressById = async (
  addressId: number,
  userId: number
): Promise<UserAddressResponse> => {
  const { data } = await api.get<UserAddressResponse>(
    `/addresses/${addressId}`,
    {
      params: {
        user_id: userId,
      },
    }
  );

  return data;
};



export const updateUserAddress = async (
  addressId: number,
  userId: number,
  payload: UserAddressUpdate
): Promise<UserAddressResponse> => {
  const { data } = await api.put<UserAddressResponse>(
    `/addresses/${addressId}`,
    payload,
    {
      params: {
        user_id: userId,
      },
    }
  );

  return data;
};



export const makeDefaultAddress = async (
  addressId: number,
  userId: number
): Promise<MessageResponse> => {
  const { data } = await api.patch<MessageResponse>(
    `/addresses/${addressId}/make-default`,
    null,
    {
      params: {
        user_id: userId,
      },
    }
  );

  return data;
};



export const deleteAddress = async (
  addressId: number,
  userId: number
): Promise<MessageResponse> => {
  const { data } = await api.delete<MessageResponse>(
    `/addresses/${addressId}`,
    {
      params: {
        user_id: userId,
      },
    }
  );

  return data;
};