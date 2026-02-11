import axios from "axios";
import { useStore } from "@/store/store";
import { ENV } from "./get-env";
import type { CustomError } from "@/types";

const baseURL = ENV.VITE_API_BASE_URL;

const options = {
  baseURL,
  withCredentials: true,
  timeout: 10000,
};

export const API = axios.create(options);

API.interceptors.request.use((config) => {
  const accessToken = useStore.getState().accessToken;
  if (accessToken) {
    config.headers["Authorization"] = `Bearer ${accessToken}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { data, status } = error.response;
    if (data === "Unauthorized" && status === 401) {
      try {
        const store = useStore.getState();
        store.clearUser();
        store.clearAccessToken();
        store.clearExpiresAt();
        window.location.href = ENV.VITE_APP_ORIGIN;
      } catch (error) {
        console.error("Error handling unauthorized response:", error);
      }
    }
    console.log("Data:", data);
    const customError: CustomError = {
      ...error,
      message: data?.message || "An error occurred",
      errorCode: data?.errorCode || "UNKNOWN_ERROR",
    };
    return Promise.reject(customError);
  },
);

export const PublicAPI = axios.create(options);

PublicAPI.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { data } = error.response;
    const customError: CustomError = {
      ...error,
      message: data?.message,
      errorCode: data?.errorCode || "UNKNOWN_ERROR",
    };
    return Promise.reject(customError);
  },
);
