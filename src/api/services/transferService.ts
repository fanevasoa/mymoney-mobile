/**
 * Transfer Service
 *
 * Handles all transfer-related API calls:
 * - Get transfers
 * - Create transfer
 */

import apiClient from "../client";
import type {
  Transfer,
  TransfersParams,
  CreateTransferData,
  ApiResponse,
  Pagination,
} from "../../types";

interface TransfersResponse {
  transfers: Transfer[];
  pagination: Pagination;
}

/**
 * Get all transfers for the current user
 */
export const getTransfers = async (
  params: TransfersParams = {}
): Promise<ApiResponse<TransfersResponse>> => {
  return apiClient.get<
    ApiResponse<TransfersResponse>,
    ApiResponse<TransfersResponse>
  >("/transfers", { params });
};

/**
 * Get transfer by ID
 */
export const getTransferById = async (
  id: string
): Promise<ApiResponse<{ transfer: Transfer }>> => {
  return apiClient.get<
    ApiResponse<{ transfer: Transfer }>,
    ApiResponse<{ transfer: Transfer }>
  >(`/transfers/${id}`);
};

/**
 * Create a new transfer between accounts
 */
export const createTransfer = async (
  transferData: CreateTransferData
): Promise<ApiResponse<{ transfer: Transfer }>> => {
  return apiClient.post<
    ApiResponse<{ transfer: Transfer }>,
    ApiResponse<{ transfer: Transfer }>
  >("/transfers", transferData);
};

const transferService = {
  getTransfers,
  getTransferById,
  createTransfer,
} as const;

export default transferService;
