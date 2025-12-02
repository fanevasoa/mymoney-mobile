/**
 * Transaction Service
 *
 * Handles all transaction-related API calls:
 * - Get transactions
 * - Create transaction (earning/expense)
 * - Update transaction
 * - Delete transaction
 */

import apiClient from "../client";

/**
 * Get all transactions for the current user
 * @param {Object} params - { page, limit, accountId, type, startDate, endDate, category }
 * @returns {Promise<Object>} - { transactions, pagination }
 */
export const getTransactions = async (params = {}) => {
  return apiClient.get("/transactions", { params });
};

/**
 * Get transaction by ID
 * @param {string} id - Transaction ID
 * @returns {Promise<Object>} - { transaction }
 */
export const getTransactionById = async (id) => {
  return apiClient.get(`/transactions/${id}`);
};

/**
 * Create a new transaction
 * @param {Object} transactionData - { type, amount, accountId, description?, category? }
 * @returns {Promise<Object>} - { transaction }
 */
export const createTransaction = async (transactionData) => {
  return apiClient.post("/transactions", transactionData);
};

/**
 * Update a transaction
 * @param {string} id - Transaction ID
 * @param {Object} transactionData - { description?, category? }
 * @returns {Promise<Object>} - { transaction }
 */
export const updateTransaction = async (id, transactionData) => {
  return apiClient.put(`/transactions/${id}`, transactionData);
};

/**
 * Delete a transaction
 * @param {string} id - Transaction ID
 * @returns {Promise<Object>}
 */
export const deleteTransaction = async (id) => {
  return apiClient.delete(`/transactions/${id}`);
};

export default {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
