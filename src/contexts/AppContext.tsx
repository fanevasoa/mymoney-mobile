/**
 * App Context
 *
 * Provides app-wide state management for:
 * - Accounts and account types
 * - Dashboard data
 * - Refresh triggers
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
  type ReactNode,
} from "react";
import { accountService, dashboardService } from "../api";
import { useAuth } from "./AuthContext";
import type {
  Account,
  AccountType,
  DashboardData,
  AppContextValue,
} from "../types";

// ============================================================================
// Context Creation
// ============================================================================

const AppContext = createContext<AppContextValue | null>(null);

// ============================================================================
// Provider Props
// ============================================================================

interface AppProviderProps {
  children: ReactNode;
}

// ============================================================================
// Provider Component
// ============================================================================

export function AppProvider({ children }: AppProviderProps): React.JSX.Element {
  // State
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [isLoadingAccounts, setIsLoadingAccounts] = useState<boolean>(false);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState<boolean>(false);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const { isAuthenticated } = useAuth();
  const prevIsAuthenticated = useRef(isAuthenticated);

  // Fetch data when authentication state changes to true, clear on logout
  useEffect(() => {
    if (isAuthenticated && !prevIsAuthenticated.current) {
      // Just became authenticated — load data
      Promise.all([fetchAccountTypes(), fetchAccounts(), fetchDashboard()]).catch(
        (err) => console.error("Error loading initial data:", err)
      );
    } else if (!isAuthenticated && prevIsAuthenticated.current) {
      // Just logged out — clear data
      clearData();
    }
    prevIsAuthenticated.current = isAuthenticated;
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Fetch all account types
   */
  const fetchAccountTypes = useCallback(async (): Promise<void> => {
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
  const fetchAccounts = useCallback(async (): Promise<void> => {
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
  const fetchDashboard = useCallback(async (): Promise<void> => {
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
  const refreshData = useCallback(async (): Promise<void> => {
    await Promise.all([fetchAccountTypes(), fetchAccounts(), fetchDashboard()]);
    setRefreshKey((prev) => prev + 1);
  }, [fetchAccountTypes, fetchAccounts, fetchDashboard]);

  /**
   * Add a new account to state
   */
  const addAccount = useCallback((account: Account): void => {
    setAccounts((prev) => [account, ...prev]);
  }, []);

  /**
   * Update an account in state
   */
  const updateAccount = useCallback((updatedAccount: Account): void => {
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === updatedAccount.id ? updatedAccount : acc))
    );
  }, []);

  /**
   * Remove an account from state
   */
  const removeAccount = useCallback((accountId: string): void => {
    setAccounts((prev) => prev.filter((acc) => acc.id !== accountId));
  }, []);

  /**
   * Clear all app data (on logout)
   */
  const clearData = useCallback((): void => {
    setAccounts([]);
    setAccountTypes([]);
    setDashboardData(null);
    setRefreshKey(0);
  }, []);

  // ============================================================================
  // Context Value
  // ============================================================================

  const value = useMemo<AppContextValue>(
    () => ({
      accounts,
      accountTypes,
      dashboardData,
      isLoadingAccounts,
      isLoadingDashboard,
      refreshKey,
      fetchAccountTypes,
      fetchAccounts,
      fetchDashboard,
      refreshData,
      addAccount,
      updateAccount,
      removeAccount,
      clearData,
    }),
    [
      accounts,
      accountTypes,
      dashboardData,
      isLoadingAccounts,
      isLoadingDashboard,
      refreshKey,
      fetchAccountTypes,
      fetchAccounts,
      fetchDashboard,
      refreshData,
      addAccount,
      updateAccount,
      removeAccount,
      clearData,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ============================================================================
// Custom Hook
// ============================================================================

export function useApp(): AppContextValue {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }

  return context;
}

export default AppContext;
