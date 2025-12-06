/**
 * API Client
 *
 * Configures Axios instance with interceptors for:
 * - Adding authentication token to requests
 * - Handling token expiration
 * - Standardizing error responses
 */

import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";
import * as SecureStore from "expo-secure-store";
import { API_URL, API_TIMEOUT } from "./config";
import type { ApiError } from "../types";

// Token storage key
const TOKEN_KEY = "auth_token";

// Create Axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Get stored authentication token
 */
export const getToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error("Error getting token:", error);
    return null;
  }
};

/**
 * Store authentication token
 */
export const setToken = async (token: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch (error) {
    console.error("Error storing token:", error);
  }
};

/**
 * Remove stored authentication token
 */
export const removeToken = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error("Error removing token:", error);
  }
};

// Request interceptor - add auth token to requests
apiClient.interceptors.request.use(
  async (
    config: InternalAxiosRequestConfig
  ): Promise<InternalAxiosRequestConfig> => {
    const token = await getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Return the response data directly
    return response.data;
  },
  async (error: AxiosError<{ message?: string; errors?: string[] }>) => {
    // Handle network errors
    if (!error.response) {
      const networkError: ApiError = {
        success: false,
        message: "Network error. Please check your connection.",
        isNetworkError: true,
      };
      return Promise.reject(networkError);
    }

    const { status, data } = error.response;

    // Handle 401 Unauthorized - token expired or invalid
    if (status === 401) {
      await removeToken();

      const authError: ApiError = {
        success: false,
        message: data?.message || "Session expired. Please login again.",
        isAuthError: true,
      };
      return Promise.reject(authError);
    }

    // Handle 403 Forbidden
    if (status === 403) {
      const forbiddenError: ApiError = {
        success: false,
        message:
          data?.message || "You do not have permission to perform this action.",
        isForbidden: true,
      };
      return Promise.reject(forbiddenError);
    }

    // Handle 404 Not Found
    if (status === 404) {
      const notFoundError: ApiError = {
        success: false,
        message: data?.message || "Resource not found.",
        isNotFound: true,
      };
      return Promise.reject(notFoundError);
    }

    // Handle validation errors (400)
    if (status === 400) {
      const validationError: ApiError = {
        success: false,
        message: data?.message || "Invalid request.",
        errors: data?.errors || [],
        isValidationError: true,
      };
      return Promise.reject(validationError);
    }

    // Handle conflict errors (409)
    if (status === 409) {
      const conflictError: ApiError = {
        success: false,
        message: data?.message || "Resource already exists.",
        isConflict: true,
      };
      return Promise.reject(conflictError);
    }

    // Handle server errors (500+)
    if (status >= 500) {
      const serverError: ApiError = {
        success: false,
        message: "Server error. Please try again later.",
        isServerError: true,
      };
      return Promise.reject(serverError);
    }

    // Default error
    const defaultError: ApiError = {
      success: false,
      message: data?.message || "An error occurred.",
      errors: data?.errors || [],
    };
    return Promise.reject(defaultError);
  }
);

export default apiClient;
