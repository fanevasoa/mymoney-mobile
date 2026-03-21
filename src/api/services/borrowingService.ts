/**
 * Borrowing Service
 *
 * Handles all borrowing-related API calls:
 * - Get borrowings
 * - Get unresolved borrowings
 * - Get borrowing by ID
 * - Update borrowing
 */

import apiClient from "../client";
import type {
  Borrowing,
  BorrowingsParams,
  UpdateBorrowingData,
  ApiResponse,
  Pagination,
} from "../../types";

interface BorrowingsResponse {
  borrowings: Borrowing[];
  pagination: Pagination;
}

/**
 * Get all borrowings for the current user
 */
export const getBorrowings = async (
  params: BorrowingsParams = {},
): Promise<ApiResponse<BorrowingsResponse>> => {
  return apiClient.get<ApiResponse<BorrowingsResponse>>("/borrowings", {
    params,
  });
};

/**
 * Get unresolved borrowings
 */
export const getUnresolvedBorrowings = async (
  params: { page?: number; limit?: number; direction?: string } = {},
): Promise<ApiResponse<BorrowingsResponse>> => {
  return apiClient.get<ApiResponse<BorrowingsResponse>>(
    "/borrowings/unresolved",
    { params },
  );
};

/**
 * Get borrowing by ID
 */
export const getBorrowingById = async (
  id: string,
): Promise<ApiResponse<{ borrowing: Borrowing }>> => {
  return apiClient.get<ApiResponse<{ borrowing: Borrowing }>>(
    `/borrowings/${id}`,
  );
};

/**
 * Update a borrowing
 */
export const updateBorrowing = async (
  id: string,
  data: UpdateBorrowingData,
): Promise<ApiResponse<{ borrowing: Borrowing }>> => {
  return apiClient.put<ApiResponse<{ borrowing: Borrowing }>>(
    `/borrowings/${id}`,
    data,
  );
};

const borrowingService = {
  getBorrowings,
  getUnresolvedBorrowings,
  getBorrowingById,
  updateBorrowing,
} as const;

export default borrowingService;
