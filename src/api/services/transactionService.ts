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
import type {
  Transaction,
  TransactionsParams,
  CreateTransactionData,
  UpdateTransactionData,
  ApiResponse,
  Pagination,
} from "../../types";

interface TransactionsResponse {
  transactions: Transaction[];
  pagination: Pagination;
}

/**
 * Get all transactions for the current user
 */
export const getTransactions = async (
  params: TransactionsParams = {}
): Promise<ApiResponse<TransactionsResponse>> => {
  return apiClient.get<
    ApiResponse<TransactionsResponse>,
    ApiResponse<TransactionsResponse>
  >("/transactions", { params });
};

/**
 * Get transaction by ID
 */
export const getTransactionById = async (
  id: string
): Promise<ApiResponse<{ transaction: Transaction }>> => {
  return apiClient.get<
    ApiResponse<{ transaction: Transaction }>,
    ApiResponse<{ transaction: Transaction }>
  >(`/transactions/${id}`);
};

/**
 * Create a new transaction
 */
export const createTransaction = async (
  transactionData: CreateTransactionData
): Promise<ApiResponse<{ transaction: Transaction }>> => {
  return apiClient.post<
    ApiResponse<{ transaction: Transaction }>,
    ApiResponse<{ transaction: Transaction }>
  >("/transactions", transactionData);
};

/**
 * Update a transaction
 */
export const updateTransaction = async (
  id: string,
  transactionData: UpdateTransactionData
): Promise<ApiResponse<{ transaction: Transaction }>> => {
  return apiClient.put<
    ApiResponse<{ transaction: Transaction }>,
    ApiResponse<{ transaction: Transaction }>
  >(`/transactions/${id}`, transactionData);
};

/**
 * Delete a transaction
 */
export const deleteTransaction = async (
  id: string
): Promise<ApiResponse<{ message: string }>> => {
  return apiClient.delete<
    ApiResponse<{ message: string }>,
    ApiResponse<{ message: string }>
  >(`/transactions/${id}`);
};

const transactionService = {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} as const;

export default transactionService;
