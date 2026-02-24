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
import type {
  Account,
  AccountType,
  AccountsParams,
  CreateAccountData,
  UpdateAccountData,
  ApiResponse,
  Pagination,
} from "../../types";

interface AccountsResponse {
  accounts: Account[];
  pagination: Pagination;
}

interface AccountTypesResponse {
  accountTypes: AccountType[];
}

/**
 * Get all accounts for the current user
 */
export const getAccounts = async (
  params: AccountsParams = {}
): Promise<ApiResponse<AccountsResponse>> => {
  return apiClient.get<ApiResponse<AccountsResponse>>("/accounts", { params });
};

/**
 * Get account by ID
 */
export const getAccountById = async (
  id: string
): Promise<ApiResponse<{ account: Account }>> => {
  return apiClient.get<ApiResponse<{ account: Account }>>(`/accounts/${id}`);
};

/**
 * Create a new account
 */
export const createAccount = async (
  accountData: CreateAccountData
): Promise<ApiResponse<{ account: Account }>> => {
  return apiClient.post<ApiResponse<{ account: Account }>>(
    "/accounts",
    accountData
  );
};

/**
 * Update an account
 */
export const updateAccount = async (
  id: string,
  accountData: UpdateAccountData
): Promise<ApiResponse<{ account: Account }>> => {
  return apiClient.put<ApiResponse<{ account: Account }>>(
    `/accounts/${id}`,
    accountData
  );
};

/**
 * Delete an account
 */
export const deleteAccount = async (
  id: string
): Promise<ApiResponse<{ message: string }>> => {
  return apiClient.delete<ApiResponse<{ message: string }>>(
    `/accounts/${id}`
  );
};

/**
 * Get all account types
 */
export const getAccountTypes = async (): Promise<
  ApiResponse<AccountTypesResponse>
> => {
  return apiClient.get<ApiResponse<AccountTypesResponse>>("/account-types");
};

const accountService = {
  getAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount,
  getAccountTypes,
} as const;

export default accountService;
