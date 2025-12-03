/**
 * Authentication Service
 *
 * Handles all authentication-related API calls for the MyMoney application.
 * This service manages user sessions, token storage, and credential validation.
 *
 * API Endpoints:
 * - POST /auth/register - Create new user account
 * - POST /auth/login - Authenticate existing user
 * - GET /auth/me - Get current user profile
 * - PUT /auth/password - Change user password
 *
 * Token Management:
 * JWT tokens are automatically stored/removed using expo-secure-store
 * when login/register/logout operations are performed.
 *
 * @module api/services/authService
 * @requires ../client
 */

import apiClient, { setToken, removeToken } from "../client";

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Registers a new user account
 *
 * Creates a new user and automatically stores the returned JWT token.
 * The user will be logged in immediately after successful registration.
 *
 * @async
 * @function register
 * @param {Object} userData - User registration data
 * @param {string} userData.name - User's full name (2-50 characters)
 * @param {string} userData.email - User's email (must be unique)
 * @param {string} userData.password - User's password (min 6 characters)
 * @returns {Promise<Object>} Response with user object and JWT token
 *
 * @example
 * const response = await register({
 *   name: 'John Doe',
 *   email: 'john@example.com',
 *   password: 'secure123'
 * });
 * // response.data.user - User object
 * // response.data.token - JWT token (already stored)
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
 * Authenticates a user with email and password
 *
 * Validates credentials and returns a JWT token for subsequent API calls.
 * Token is automatically stored using expo-secure-store.
 *
 * @async
 * @function login
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.email - User's email address
 * @param {string} credentials.password - User's password
 * @returns {Promise<Object>} Response with user object and JWT token
 * @throws {Error} If credentials are invalid (401)
 *
 * @example
 * const response = await login({
 *   email: 'john@example.com',
 *   password: 'secure123'
 * });
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
 * Logs out the current user
 *
 * Removes the stored JWT token from secure storage.
 * After logout, the user must login again to access protected resources.
 *
 * @async
 * @function logout
 * @returns {Promise<void>}
 */
export const logout = async () => {
  await removeToken();
};

/**
 * Retrieves the current authenticated user's profile
 *
 * Uses the stored JWT token to fetch user information.
 * Requires valid authentication.
 *
 * @async
 * @function getCurrentUser
 * @returns {Promise<Object>} Response with user profile data
 * @throws {Error} If not authenticated (401)
 */
export const getCurrentUser = async () => {
  return apiClient.get("/auth/me");
};

/**
 * Changes the user's password
 *
 * Requires the current password for verification before updating.
 *
 * @async
 * @function changePassword
 * @param {Object} passwords - Password change data
 * @param {string} passwords.currentPassword - Current password for verification
 * @param {string} passwords.newPassword - New password (min 6 characters)
 * @returns {Promise<Object>} Response with success message
 * @throws {Error} If current password is incorrect (401)
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
