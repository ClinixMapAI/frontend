import axios, { AxiosError, type AxiosInstance } from "axios";

import { ApiError, type ApiErrorPayload } from "@/types/api";

const baseURL = import.meta.env.VITE_API_BASE_URL?.trim() || "http://localhost:8000";

export const api: AxiosInstance = axios.create({
  baseURL,
  timeout: 30_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorPayload>) => {
    const status = error.response?.status ?? 0;
    const payload = error.response?.data;
    const detail =
      (payload && typeof payload === "object" && "detail" in payload && typeof payload.detail === "string"
        ? payload.detail
        : undefined) ??
      error.message ??
      "Unexpected network error";

    return Promise.reject(new ApiError(detail, status, payload));
  },
);

export { baseURL as API_BASE_URL };
