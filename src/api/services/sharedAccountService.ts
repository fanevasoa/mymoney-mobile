/**
 * Shared Account Service
 *
 * Handles all shared account and budget campaign API calls.
 */

import apiClient from "../client";
import type {
  SharedAccount,
  SharedAccountMember,
  CreateSharedAccountData,
  UpdateSharedAccountData,
  AddMemberData,
  SharedAccountIncomeData,
  BudgetCampaign,
  BudgetItem,
  CreateBudgetCampaignData,
  CreateBudgetItemData,
  ApiResponse,
  Pagination,
  UpdateBudgetCampaignData,
  UpdateBudgetItemData,
  SharedAccountTransaction,
  CreateSharedAccountTransactionData,
  ApprovedBudgetItemForSelection,
} from "../../types";

// ============================================================================
// Shared Account CRUD
// ============================================================================

export const getSharedAccounts = async (): Promise<
  ApiResponse<{ sharedAccounts: SharedAccount[] }>
> => {
  return apiClient.get<ApiResponse<{ sharedAccounts: SharedAccount[] }>>(
    "/shared-accounts",
  );
};

export const getSharedAccountById = async (
  id: string,
): Promise<ApiResponse<{ sharedAccount: SharedAccount }>> => {
  return apiClient.get<ApiResponse<{ sharedAccount: SharedAccount }>>(
    `/shared-accounts/${id}`,
  );
};

export const createSharedAccount = async (
  data: CreateSharedAccountData,
): Promise<ApiResponse<{ sharedAccount: SharedAccount }>> => {
  return apiClient.post<ApiResponse<{ sharedAccount: SharedAccount }>>(
    "/shared-accounts",
    data,
  );
};

export const updateSharedAccount = async (
  id: string,
  data: UpdateSharedAccountData,
): Promise<ApiResponse<{ sharedAccount: SharedAccount }>> => {
  return apiClient.put<ApiResponse<{ sharedAccount: SharedAccount }>>(
    `/shared-accounts/${id}`,
    data,
  );
};

// ============================================================================
// Member Management
// ============================================================================

export const addMember = async (
  sharedAccountId: string,
  data: AddMemberData,
): Promise<ApiResponse<{ member: SharedAccountMember }>> => {
  return apiClient.post<ApiResponse<{ member: SharedAccountMember }>>(
    `/shared-accounts/${sharedAccountId}/members`,
    data,
  );
};

export const updateMemberRole = async (
  sharedAccountId: string,
  memberId: string,
  role: "manager" | "member",
): Promise<ApiResponse<{ member: SharedAccountMember }>> => {
  return apiClient.put<ApiResponse<{ member: SharedAccountMember }>>(
    `/shared-accounts/${sharedAccountId}/members/${memberId}`,
    { role },
  );
};

export const removeMember = async (
  sharedAccountId: string,
  memberId: string,
): Promise<ApiResponse<{ message: string }>> => {
  return apiClient.delete<ApiResponse<{ message: string }>>(
    `/shared-accounts/${sharedAccountId}/members/${memberId}`,
  );
};

// ============================================================================
// Income
// ============================================================================

export const addIncome = async (
  sharedAccountId: string,
  data: SharedAccountIncomeData,
): Promise<ApiResponse<{ sharedAccount: SharedAccount }>> => {
  return apiClient.post<ApiResponse<{ sharedAccount: SharedAccount }>>(
    `/shared-accounts/${sharedAccountId}/income`,
    data,
  );
};

// ============================================================================
// Budget Campaigns
// ============================================================================

interface BudgetCampaignsResponse {
  campaigns: BudgetCampaign[];
  pagination: Pagination;
}

export const getBudgetCampaigns = async (
  sharedAccountId: string,
  params: { page?: number; limit?: number; status?: string } = {},
): Promise<ApiResponse<BudgetCampaignsResponse>> => {
  return apiClient.get<ApiResponse<BudgetCampaignsResponse>>(
    `/shared-accounts/${sharedAccountId}/budget-campaigns`,
    { params },
  );
};

export const getBudgetCampaignById = async (
  sharedAccountId: string,
  campaignId: string,
): Promise<ApiResponse<{ campaign: BudgetCampaign }>> => {
  return apiClient.get<ApiResponse<{ campaign: BudgetCampaign }>>(
    `/shared-accounts/${sharedAccountId}/budget-campaigns/${campaignId}`,
  );
};

export const createBudgetCampaign = async (
  sharedAccountId: string,
  data: CreateBudgetCampaignData,
): Promise<ApiResponse<{ campaign: BudgetCampaign }>> => {
  return apiClient.post<ApiResponse<{ campaign: BudgetCampaign }>>(
    `/shared-accounts/${sharedAccountId}/budget-campaigns`,
    data,
  );
};

export const updateBudgetCampaign = async (
  sharedAccountId: string,
  campaignId: string,
  data: UpdateBudgetCampaignData,
): Promise<ApiResponse<{ campaign: BudgetCampaign }>> => {
  return apiClient.put<ApiResponse<{ campaign: BudgetCampaign }>>(
    `/shared-accounts/${sharedAccountId}/budget-campaigns/${campaignId}`,
    data,
  );
};

export const addBudgetItem = async (
  sharedAccountId: string,
  campaignId: string,
  data: CreateBudgetItemData,
): Promise<ApiResponse<{ item: BudgetItem }>> => {
  return apiClient.post<ApiResponse<{ item: BudgetItem }>>(
    `/shared-accounts/${sharedAccountId}/budget-campaigns/${campaignId}/items`,
    data,
  );
};

export const updateBudgetItem = async (
  sharedAccountId: string,
  campaignId: string,
  itemId: string,
  data: UpdateBudgetItemData,
): Promise<ApiResponse<{ item: BudgetItem }>> => {
  return apiClient.put<ApiResponse<{ item: BudgetItem }>>(
    `/shared-accounts/${sharedAccountId}/budget-campaigns/${campaignId}/items/${itemId}`,
    data,
  );
};

export const approveBudgetItem = async (
  sharedAccountId: string,
  campaignId: string,
  itemId: string,
  status: "pending" | "approved" | "rejected",
): Promise<ApiResponse<{ item: BudgetItem }>> => {
  return apiClient.put<ApiResponse<{ item: BudgetItem }>>(
    `/shared-accounts/${sharedAccountId}/budget-campaigns/${campaignId}/items/${itemId}/approve`,
    { status },
  );
};

export const deleteBudgetItem = async (
  sharedAccountId: string,
  campaignId: string,
  itemId: string,
): Promise<ApiResponse<{ message: string }>> => {
  return apiClient.delete<ApiResponse<{ message: string }>>(
    `/shared-accounts/${sharedAccountId}/budget-campaigns/${campaignId}/items/${itemId}`,
  );
};

export const deleteBudgetCampaign = async (
  sharedAccountId: string,
  campaignId: string,
): Promise<ApiResponse<{ message: string }>> => {
  return apiClient.delete<ApiResponse<{ message: string }>>(
    `/shared-accounts/${sharedAccountId}/budget-campaigns/${campaignId}`,
  );
};

export const approveBudgetCampaign = async (
  sharedAccountId: string,
  campaignId: string,
  status: "approved" | "rejected",
): Promise<ApiResponse<{ campaign: BudgetCampaign }>> => {
  return apiClient.put<ApiResponse<{ campaign: BudgetCampaign }>>(
    `/shared-accounts/${sharedAccountId}/budget-campaigns/${campaignId}/approve`,
    { status },
  );
};

export const applyBudgetCampaign = async (
  sharedAccountId: string,
  campaignId: string,
): Promise<
  ApiResponse<{
    campaign: BudgetCampaign;
    totalExpense: number;
    newBalance: number;
  }>
> => {
  return apiClient.post<
    ApiResponse<{
      campaign: BudgetCampaign;
      totalExpense: number;
      newBalance: number;
    }>
  >(`/shared-accounts/${sharedAccountId}/budget-campaigns/${campaignId}/apply`);
};

// ============================================================================
// Shared Account Transactions
// ============================================================================

export const getSharedAccountTransactions = async (
  sharedAccountId: string,
  params?: { page?: number; limit?: number; status?: string; type?: string },
): Promise<
  ApiResponse<{
    transactions: SharedAccountTransaction[];
    pagination: Pagination;
  }>
> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", String(params.page));
  if (params?.limit) queryParams.append("limit", String(params.limit));
  if (params?.status) queryParams.append("status", params.status);
  if (params?.type) queryParams.append("type", params.type);
  const qs = queryParams.toString();
  return apiClient.get<
    ApiResponse<{
      transactions: SharedAccountTransaction[];
      pagination: Pagination;
    }>
  >(`/shared-accounts/${sharedAccountId}/transactions${qs ? `?${qs}` : ""}`);
};

export const createSharedAccountTransaction = async (
  sharedAccountId: string,
  data: CreateSharedAccountTransactionData,
): Promise<ApiResponse<{ transaction: SharedAccountTransaction }>> => {
  return apiClient.post<ApiResponse<{ transaction: SharedAccountTransaction }>>(
    `/shared-accounts/${sharedAccountId}/transactions`,
    data,
  );
};

export const approveSharedAccountTransaction = async (
  sharedAccountId: string,
  txId: string,
  status: "approved" | "rejected",
): Promise<ApiResponse<{ transaction: SharedAccountTransaction }>> => {
  return apiClient.put<ApiResponse<{ transaction: SharedAccountTransaction }>>(
    `/shared-accounts/${sharedAccountId}/transactions/${txId}/approve`,
    {
      status,
    },
  );
};

export const getApprovedBudgetItems = async (
  sharedAccountId: string,
): Promise<ApiResponse<{ budgetItems: ApprovedBudgetItemForSelection[] }>> => {
  return apiClient.get<
    ApiResponse<{ budgetItems: ApprovedBudgetItemForSelection[] }>
  >(`/shared-accounts/${sharedAccountId}/approved-budget-items`);
};

const sharedAccountService = {
  getSharedAccounts,
  getSharedAccountById,
  createSharedAccount,
  updateSharedAccount,
  addMember,
  updateMemberRole,
  removeMember,
  addIncome,
  getBudgetCampaigns,
  getBudgetCampaignById,
  createBudgetCampaign,
  updateBudgetCampaign,
  addBudgetItem,
  updateBudgetItem,
  approveBudgetItem,
  deleteBudgetItem,
  deleteBudgetCampaign,
  approveBudgetCampaign,
  applyBudgetCampaign,
  getSharedAccountTransactions,
  createSharedAccountTransaction,
  approveSharedAccountTransaction,
  getApprovedBudgetItems,
} as const;

export default sharedAccountService;
