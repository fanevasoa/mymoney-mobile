/**
 * API Client
 *
 * Configures Axios instance with interceptors for:
 * - Adding authentication token to requests
 * - Handling token expiration
 * - Standardizing error responses
 */

import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { API_URL, API_TIMEOUT } from "./config";

// Create Axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Token storage key
const TOKEN_KEY = "auth_token";

/**
 * Get stored authentication token
 * @returns {Promise<string|null>}
 */
export const getToken = async () => {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error("Error getting token:", error);
    return null;
  }
};

/**
 * Store authentication token
 * @param {string} token
 */
export const setToken = async (token) => {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch (error) {
    console.error("Error storing token:", error);
  }
};

/**
 * Remove stored authentication token
 */
export const removeToken = async () => {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error("Error removing token:", error);
  }
};

// Request interceptor - add auth token to requests
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => {
    // Return the response data directly
    return response.data;
  },
  async (error) => {
    // Handle network errors
    if (!error.response) {
      return Promise.reject({
        success: false,
        message: "Network error. Please check your connection.",
        isNetworkError: true,
      });
    }

    const { status, data } = error.response;

    // Handle 401 Unauthorized - token expired or invalid
    if (status === 401) {
      // Clear stored token
      await removeToken();

      return Promise.reject({
        success: false,
        message: data?.message || "Session expired. Please login again.",
        isAuthError: true,
      });
    }

    // Handle 403 Forbidden
    if (status === 403) {
      return Promise.reject({
        success: false,
        message:
          data?.message || "You do not have permission to perform this action.",
        isForbidden: true,
      });
    }

    // Handle 404 Not Found
    if (status === 404) {
      return Promise.reject({
        success: false,
        message: data?.message || "Resource not found.",
        isNotFound: true,
      });
    }

    // Handle validation errors (400)
    if (status === 400) {
      return Promise.reject({
        success: false,
        message: data?.message || "Invalid request.",
        errors: data?.errors || [],
        isValidationError: true,
      });
    }

    // Handle conflict errors (409)
    if (status === 409) {
      return Promise.reject({
        success: false,
        message: data?.message || "Resource already exists.",
        isConflict: true,
      });
    }

    // Handle server errors (500+)
    if (status >= 500) {
      return Promise.reject({
        success: false,
        message: "Server error. Please try again later.",
        isServerError: true,
      });
    }

    // Default error
    return Promise.reject({
      success: false,
      message: data?.message || "An error occurred.",
      errors: data?.errors || [],
    });
  }
);

export default apiClient;
