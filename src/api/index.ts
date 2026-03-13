/**
 * API Services Index
 *
 * Exports all API services for easy importing throughout the app.
 */

export {
  default as apiClient,
  getToken,
  setToken,
  removeToken,
} from "./client";
export { default as authService } from "./services/authService";
export { default as accountService } from "./services/accountService";
export { default as transactionService } from "./services/transactionService";
export { default as transferService } from "./services/transferService";
export { default as dashboardService } from "./services/dashboardService";
export { default as borrowingService } from "./services/borrowingService";
export { default as sharedAccountService } from "./services/sharedAccountService";

// Re-export config
export { API_URL, API_TIMEOUT, RETRY_CONFIG } from "./config";
