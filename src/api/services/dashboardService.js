/**
 * Dashboard Service
 *
 * Handles dashboard and report API calls:
 * - Get dashboard summary
 * - Get recent transactions
 * - Get financial reports
 */

import apiClient from "../client";

/**
 * Get dashboard summary
 * @returns {Promise<Object>} - { totalBalance, accountCount, accountTypesSummary, accountsSummary, today }
 */
export const getDashboardSummary = async () => {
  return apiClient.get("/dashboard");
};

/**
 * Get recent transactions for dashboard
 * @param {number} limit - Number of transactions to fetch
 * @returns {Promise<Object>} - { transactions }
 */
export const getRecentTransactions = async (limit = 10) => {
  return apiClient.get("/dashboard/recent", { params: { limit } });
};

/**
 * Get financial summary report
 * @param {Object} params - { startDate?, endDate?, accountId? }
 * @returns {Promise<Object>} - { summary, filters }
 */
export const getFinancialSummary = async (params = {}) => {
  return apiClient.get("/reports/summary", { params });
};

/**
 * Get monthly breakdown for charts
 * @param {Object} params - { year?, accountId? }
 * @returns {Promise<Object>} - { year, months, yearTotals }
 */
export const getMonthlyBreakdown = async (params = {}) => {
  return apiClient.get("/reports/monthly", { params });
};

/**
 * Get category breakdown
 * @param {Object} params - { startDate?, endDate?, accountId?, type? }
 * @returns {Promise<Object>} - { type, categories, grandTotal }
 */
export const getCategoryBreakdown = async (params = {}) => {
  return apiClient.get("/reports/category", { params });
};

export default {
  getDashboardSummary,
  getRecentTransactions,
  getFinancialSummary,
  getMonthlyBreakdown,
  getCategoryBreakdown,
};
