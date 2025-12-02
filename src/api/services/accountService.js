/**
 * Account Service
 *
 * Handles all account-related API calls:
 * - Get user accounts
 * - Create account
 * - Update account
 * - Delete account
 * - Get account types
 */

import apiClient from "../client";

/**
 * Get all accounts for the current user
 * @param {Object} params - { page, limit, accountTypeId, isActive }
 * @returns {Promise<Object>} - { accounts, pagination }
 */
export const getAccounts = async (params = {}) => {
  return apiClient.get("/accounts", { params });
};

/**
 * Get account by ID
 * @param {string} id - Account ID
 * @returns {Promise<Object>} - { account }
 */
export const getAccountById = async (id) => {
  return apiClient.get(`/accounts/${id}`);
};

/**
 * Create a new account
 * @param {Object} accountData - { name, accountTypeId, balance?, description? }
 * @returns {Promise<Object>} - { account }
 */
export const createAccount = async (accountData) => {
  return apiClient.post("/accounts", accountData);
};

/**
 * Update an account
 * @param {string} id - Account ID
 * @param {Object} accountData - { name?, description?, isActive? }
 * @returns {Promise<Object>} - { account }
 */
export const updateAccount = async (id, accountData) => {
  return apiClient.put(`/accounts/${id}`, accountData);
};

/**
 * Delete an account
 * @param {string} id - Account ID
 * @returns {Promise<Object>}
 */
export const deleteAccount = async (id) => {
  return apiClient.delete(`/accounts/${id}`);
};

/**
 * Get all account types
 * @returns {Promise<Object>} - { accountTypes }
 */
export const getAccountTypes = async () => {
  return apiClient.get("/account-types");
};

export default {
  getAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount,
  getAccountTypes,
};
