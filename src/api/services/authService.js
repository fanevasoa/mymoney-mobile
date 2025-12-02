/**
 * Authentication Service
 *
 * Handles all authentication-related API calls:
 * - User registration
 * - User login
 * - Get current user
 * - Change password
 */

import apiClient, { setToken, removeToken } from "../client";

/**
 * Register a new user
 * @param {Object} userData - { name, email, password }
 * @returns {Promise<Object>} - { user, token }
 */
export const register = async (userData) => {
  const response = await apiClient.post("/auth/register", userData);

  if (response.success && response.data.token) {
    // Store the token
    await setToken(response.data.token);
  }

  return response;
};

/**
 * Login user
 * @param {Object} credentials - { email, password }
 * @returns {Promise<Object>} - { user, token }
 */
export const login = async (credentials) => {
  const response = await apiClient.post("/auth/login", credentials);

  if (response.success && response.data.token) {
    // Store the token
    await setToken(response.data.token);
  }

  return response;
};

/**
 * Logout user (clear token)
 */
export const logout = async () => {
  await removeToken();
};

/**
 * Get current authenticated user
 * @returns {Promise<Object>} - { user }
 */
export const getCurrentUser = async () => {
  return apiClient.get("/auth/me");
};

/**
 * Change user password
 * @param {Object} passwords - { currentPassword, newPassword }
 * @returns {Promise<Object>}
 */
export const changePassword = async (passwords) => {
  return apiClient.put("/auth/password", passwords);
};

export default {
  register,
  login,
  logout,
  getCurrentUser,
  changePassword,
};
