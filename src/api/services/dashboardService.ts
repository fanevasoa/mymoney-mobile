/**
 * Dashboard Service
 *
 * Handles dashboard and report API calls:
 * - Get dashboard summary
 * - Get recent transactions
 * - Get financial reports
 */

import apiClient from "../client";
import type {
  DashboardData,
  Transaction,
  FinancialSummary,
  MonthlyBreakdown,
  WeeklyBreakdown,
  DailyBreakdown,
  CategoryBreakdown,
  ReportParams,
  ApiResponse,
} from "../../types";

interface RecentTransactionsResponse {
  transactions: Transaction[];
}

interface SummaryResponse {
  summary: FinancialSummary;
  filters: ReportParams;
}

/**
 * Get dashboard summary
 */
export const getDashboardSummary = async (): Promise<
  ApiResponse<DashboardData>
> => {
  return apiClient.get<ApiResponse<DashboardData>>("/dashboard");
};

/**
 * Get recent transactions for dashboard
 */
export const getRecentTransactions = async (
  limit: number = 10,
): Promise<ApiResponse<RecentTransactionsResponse>> => {
  return apiClient.get<ApiResponse<RecentTransactionsResponse>>(
    "/dashboard/recent",
    { params: { limit } },
  );
};

/**
 * Get financial summary report
 */
export const getFinancialSummary = async (
  params: ReportParams = {},
): Promise<ApiResponse<SummaryResponse>> => {
  return apiClient.get<ApiResponse<SummaryResponse>>("/reports/summary", {
    params,
  });
};

/**
 * Get monthly breakdown for charts
 */
export const getMonthlyBreakdown = async (
  params: Pick<ReportParams, "year" | "accountId"> = {},
): Promise<ApiResponse<MonthlyBreakdown>> => {
  return apiClient.get<ApiResponse<MonthlyBreakdown>>("/reports/monthly", {
    params,
  });
};

/**
 * Get weekly breakdown for charts
 */
export const getWeeklyBreakdown = async (
  params: Pick<ReportParams, "year" | "month" | "accountId"> = {},
): Promise<ApiResponse<WeeklyBreakdown>> => {
  return apiClient.get<ApiResponse<WeeklyBreakdown>>("/reports/weekly", {
    params,
  });
};

/**
 * Get daily breakdown for charts
 */
export const getDailyBreakdown = async (
  params: Pick<ReportParams, "year" | "month" | "accountId"> = {},
): Promise<ApiResponse<DailyBreakdown>> => {
  return apiClient.get<ApiResponse<DailyBreakdown>>("/reports/daily", {
    params,
  });
};

/**
 * Get category breakdown
 */
export const getCategoryBreakdown = async (
  params: ReportParams = {},
): Promise<ApiResponse<CategoryBreakdown>> => {
  return apiClient.get<ApiResponse<CategoryBreakdown>>("/reports/category", {
    params,
  });
};

const dashboardService = {
  getDashboardSummary,
  getRecentTransactions,
  getFinancialSummary,
  getMonthlyBreakdown,
  getWeeklyBreakdown,
  getDailyBreakdown,
  getCategoryBreakdown,
} as const;

export default dashboardService;
