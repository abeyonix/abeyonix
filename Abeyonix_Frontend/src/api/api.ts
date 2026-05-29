import axios from "axios";
import { showLoader, hideLoader } from "@/lib/loaderBus";  

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

let activeRequests = 0;  

api.interceptors.request.use(
  (config) => {
    const stored = localStorage.getItem("auth");

    if (stored) {
      const parsed = JSON.parse(stored);
      const token = parsed?.token;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // Show loader
    activeRequests++;                                             // ← ADD
    showLoader(config.loaderMessage ?? "LOADING...");             // ← ADD

    return config;
  },
  (error) => {
    activeRequests = Math.max(0, activeRequests - 1);            // ← ADD
    if (activeRequests === 0) hideLoader();                       // ← ADD
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    activeRequests = Math.max(0, activeRequests - 1);            // ← ADD
    if (activeRequests === 0) hideLoader();                       // ← ADD
    return response;
  },
  (error) => {
    activeRequests = Math.max(0, activeRequests - 1);            // ← ADD
    if (activeRequests === 0) hideLoader();                       // ← ADD
    return Promise.reject(error);
  }
);

export default api;


declare module "axios" {
  interface InternalAxiosRequestConfig {
    loaderMessage?: string;
    skipLoader?: boolean;
  }
}
