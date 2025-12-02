/**
 * Transfer Service
 *
 * Handles all transfer-related API calls:
 * - Get transfers
 * - Create transfer
 */

import apiClient from "../client";

/**
 * Get all transfers for the current user
 * @param {Object} params - { page, limit, accountId }
 * @returns {Promise<Object>} - { transfers, pagination }
 */
export const getTransfers = async (params = {}) => {
  return apiClient.get("/transfers", { params });
};

/**
 * Get transfer by ID
 * @param {string} id - Transfer ID
 * @returns {Promise<Object>} - { transfer }
 */
export const getTransferById = async (id) => {
  return apiClient.get(`/transfers/${id}`);
};

/**
 * Create a new transfer between accounts
 * @param {Object} transferData - { fromAccountId, toAccountId, amount, fee?, description? }
 * @returns {Promise<Object>} - { transfer }
 */
export const createTransfer = async (transferData) => {
  return apiClient.post("/transfers", transferData);
};

export default {
  getTransfers,
  getTransferById,
  createTransfer,
};
