/**
 * App Context
 *
 * Provides app-wide state management for:
 * - Accounts and account types
 * - Dashboard data
 * - Refresh triggers
 */

import React, { createContext, useContext, useState, useCallback } from "react";
import { accountService, dashboardService } from "../api";
import { useAuth } from "./AuthContext";

// Create context
const AppContext = createContext(null);

/**
 * App Provider Component
 * Manages global app state
 */
export function AppProvider({ children }) {
  // State
  const [accounts, setAccounts] = useState([]);
  const [accountTypes, setAccountTypes] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const { isAuthenticated } = useAuth();

  /**
   * Fetch all account types
   */
  const fetchAccountTypes = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const response = await accountService.getAccountTypes();
      if (response.success) {
        setAccountTypes(response.data.accountTypes);
      }
    } catch (error) {
      console.error("Error fetching account types:", error);
    }
  }, [isAuthenticated]);

  /**
   * Fetch user accounts
   */
  const fetchAccounts = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setIsLoadingAccounts(true);
      const response = await accountService.getAccounts({ limit: 100 });
      if (response.success) {
        setAccounts(response.data.accounts);
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
    } finally {
      setIsLoadingAccounts(false);
    }
  }, [isAuthenticated]);

  /**
   * Fetch dashboard summary
   */
  const fetchDashboard = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setIsLoadingDashboard(true);
      const response = await dashboardService.getDashboardSummary();
      if (response.success) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard:", error);
    } finally {
      setIsLoadingDashboard(false);
    }
  }, [isAuthenticated]);

  /**
   * Refresh all data
   */
  const refreshData = useCallback(async () => {
    await Promise.all([fetchAccountTypes(), fetchAccounts(), fetchDashboard()]);
    setRefreshKey((prev) => prev + 1);
  }, [fetchAccountTypes, fetchAccounts, fetchDashboard]);

  /**
   * Add a new account to state
   * @param {Object} account
   */
  const addAccount = (account) => {
    setAccounts((prev) => [account, ...prev]);
  };

  /**
   * Update an account in state
   * @param {Object} updatedAccount
   */
  const updateAccount = (updatedAccount) => {
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === updatedAccount.id ? updatedAccount : acc))
    );
  };

  /**
   * Remove an account from state
   * @param {string} accountId
   */
  const removeAccount = (accountId) => {
    setAccounts((prev) => prev.filter((acc) => acc.id !== accountId));
  };

  /**
   * Clear all app data (on logout)
   */
  const clearData = useCallback(() => {
    setAccounts([]);
    setAccountTypes([]);
    setDashboardData(null);
    setRefreshKey(0);
  }, []);

  // Context value
  const value = {
    // State
    accounts,
    accountTypes,
    dashboardData,
    isLoadingAccounts,
    isLoadingDashboard,
    refreshKey,

    // Actions
    fetchAccountTypes,
    fetchAccounts,
    fetchDashboard,
    refreshData,
    addAccount,
    updateAccount,
    removeAccount,
    clearData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/**
 * Custom hook to use app context
 * @returns {Object} App context value
 */
export function useApp() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }

  return context;
}

export default AppContext;
