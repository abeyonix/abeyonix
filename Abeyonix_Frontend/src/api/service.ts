import api from "./api";
import { ServiceCreate, ServiceResponse } from "@/types/service";


/**
 * ✅ Create new service request
 * POST /api/v1/services
 */
export const createService = async (
  payload: ServiceCreate
): Promise<ServiceResponse> => {
  const { data } = await api.post<ServiceResponse>(
    "/services",
    payload
  );

  return data;
};

/**
 * ✅ Get all services
 * GET /api/v1/services
 */
export const getServices = async (): Promise<ServiceResponse[]> => {
  const { data } = await api.get<ServiceResponse[]>(
    "/services"
  );

  return data;
};

/**
 * ✅ Get single service by ID
 * GET /api/v1/services/{service_id}
 */
export const getServiceById = async (
  serviceId: number
): Promise<ServiceResponse> => {
  const { data } = await api.get<ServiceResponse>(
    `/services/${serviceId}`
  );

  return data;
};