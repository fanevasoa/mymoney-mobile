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
  params: AccountsParams = {},
): Promise<ApiResponse<AccountsResponse>> => {
  return apiClient.get<ApiResponse<AccountsResponse>>("/accounts", { params });
};

/**
 * Get account by ID
 */
export const getAccountById = async (
  id: string,
): Promise<ApiResponse<{ account: Account }>> => {
  return apiClient.get<ApiResponse<{ account: Account }>>(`/accounts/${id}`);
};

/**
 * Create a new account
 */
export const createAccount = async (
  accountData: CreateAccountData,
): Promise<ApiResponse<{ account: Account }>> => {
  return apiClient.post<ApiResponse<{ account: Account }>>(
    "/accounts",
    accountData,
  );
};

/**
 * Update an account
 */
export const updateAccount = async (
  id: string,
  accountData: UpdateAccountData,
): Promise<ApiResponse<{ account: Account }>> => {
  return apiClient.put<ApiResponse<{ account: Account }>>(
    `/accounts/${id}`,
    accountData,
  );
};

/**
 * Toggle account favorite status
 */
export const toggleFavorite = async (
  id: string,
): Promise<ApiResponse<{ account: Account }>> => {
  return apiClient.patch<ApiResponse<{ account: Account }>>(
    `/accounts/${id}/favorite`,
  );
};

/**
 * Delete an account
 */
export const deleteAccount = async (
  id: string,
): Promise<ApiResponse<{ message: string }>> => {
  return apiClient.delete<ApiResponse<{ message: string }>>(`/accounts/${id}`);
};

/**
 * Get all account types
 */
export const getAccountTypes = async (): Promise<
  ApiResponse<AccountTypesResponse>
> => {
  return apiClient.get<ApiResponse<AccountTypesResponse>>("/account-types");
};

/**
 * Create a new account type
 */
export const createAccountType = async (data: {
  name: string;
  icon: string;
  color: string;
  description?: string;
}): Promise<ApiResponse<{ accountType: AccountType }>> => {
  return apiClient.post<ApiResponse<{ accountType: AccountType }>>(
    "/account-types",
    data,
  );
};

/**
 * Update an account type
 */
export const updateAccountType = async (
  id: string,
  data: { name?: string; icon?: string; color?: string; description?: string },
): Promise<ApiResponse<{ accountType: AccountType }>> => {
  return apiClient.put<ApiResponse<{ accountType: AccountType }>>(
    `/account-types/${id}`,
    data,
  );
};

/**
 * Delete an account type
 */
export const deleteAccountType = async (
  id: string,
): Promise<ApiResponse<{ message: string }>> => {
  return apiClient.delete<ApiResponse<{ message: string }>>(
    `/account-types/${id}`,
  );
};

const accountService = {
  getAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  toggleFavorite,
  deleteAccount,
  getAccountTypes,
  createAccountType,
  updateAccountType,
  deleteAccountType,
} as const;

export default accountService;
