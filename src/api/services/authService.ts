/**
 * Authentication Service
 *
 * Handles all authentication-related API calls for the MyMoney application.
 * This service manages user sessions, token storage, and credential validation.
 */

import apiClient, { setToken, removeToken } from "../client";
import type {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  PasswordChangeData,
  ApiResponse,
  User,
} from "../../types";

/**
 * Registers a new user account
 *
 * Creates a new user and automatically stores the returned JWT token.
 * The user will be logged in immediately after successful registration.
 */
export const register = async (
  userData: RegisterData
): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>(
    "/auth/register",
    userData
  );

  if (response.success && response.data.token) {
    await setToken(response.data.token);
  }

  return response;
};

/**
 * Authenticates a user with email and password
 *
 * Validates credentials and returns a JWT token for subsequent API calls.
 * Token is automatically stored using expo-secure-store.
 */
export const login = async (
  credentials: LoginCredentials
): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>(
    "/auth/login",
    credentials
  );

  if (response.success && response.data.token) {
    await setToken(response.data.token);
  }

  return response;
};

/**
 * Logs out the current user
 *
 * Removes the stored JWT token from secure storage.
 */
export const logout = async (): Promise<void> => {
  await removeToken();
};

/**
 * Retrieves the current authenticated user's profile
 *
 * Uses the stored JWT token to fetch user information.
 */
export const getCurrentUser = async (): Promise<
  ApiResponse<{ user: User }>
> => {
  return apiClient.get<ApiResponse<{ user: User }>>("/auth/me");
};

/**
 * Authenticates a user with a Google OAuth ID token
 *
 * Sends the Google ID token to the backend for verification.
 * On success, stores the returned JWT token automatically.
 */
export const loginWithGoogle = async (
  idToken: string
): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>("/auth/google", {
    idToken,
  });

  if (response.success && response.data.token) {
    await setToken(response.data.token);
  }

  return response;
};

/**
 * Changes the user's password
 *
 * Requires the current password for verification before updating.
 */
export const changePassword = async (
  passwords: PasswordChangeData
): Promise<ApiResponse<{ message: string }>> => {
  return apiClient.put<ApiResponse<{ message: string }>>(
    "/auth/password",
    passwords
  );
};

const authService = {
  register,
  login,
  loginWithGoogle,
  logout,
  getCurrentUser,
  changePassword,
} as const;

export default authService;
