/**
 * Type Definitions
 *
 * Shared TypeScript types for the MyMoney mobile application.
 */

import type { NavigatorScreenParams } from "@react-navigation/native";

// ============================================================================
// User & Authentication Types
// ============================================================================

export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  googleId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
  message?: string;
}

// ============================================================================
// Account Types
// ============================================================================

export interface AccountType {
  id: string;
  name: string;
  icon: "bank" | "phone" | "cash";
  color: string;
  description?: string;
}

export interface Account {
  id: string;
  name: string;
  balance: number;
  description?: string | null;
  isActive: boolean;
  accountTypeId: string;
  accountType?: AccountType;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccountData {
  name: string;
  accountTypeId: string;
  balance?: number;
  description?: string | null;
}

export interface UpdateAccountData {
  name?: string;
  description?: string | null;
  isActive?: boolean;
}

export interface AccountsParams {
  page?: number;
  limit?: number;
  accountTypeId?: string;
  isActive?: boolean;
}

// ============================================================================
// Transaction Types
// ============================================================================

export type TransactionType = "earning" | "expense" | "transfer_fee";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description?: string | null;
  category?: string | null;
  accountId: string;
  account?: Account;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionData {
  type: TransactionType;
  amount: number;
  accountId: string;
  description?: string | null;
  category?: string | null;
}

export interface UpdateTransactionData {
  description?: string | null;
  category?: string | null;
}

export interface TransactionsParams {
  page?: number;
  limit?: number;
  accountId?: string;
  type?: TransactionType;
  startDate?: string;
  endDate?: string;
  category?: string;
}

// ============================================================================
// Transfer Types
// ============================================================================

export interface Transfer {
  id: string;
  amount: number;
  fee: number;
  description?: string | null;
  fromAccountId: string;
  toAccountId: string;
  fromAccount?: Account;
  toAccount?: Account;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransferData {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  fee?: number;
  description?: string | null;
}

export interface TransfersParams {
  page?: number;
  limit?: number;
  accountId?: string;
}

// ============================================================================
// Dashboard & Report Types
// ============================================================================

export interface AccountTypeSummary {
  id: string;
  name: string;
  icon: string;
  color: string;
  balance: number;
  accountCount: number;
}

export interface AccountSummary {
  id: string;
  name: string;
  balance: number;
  accountType?: AccountType;
}

export interface TodaySummary {
  earnings: number;
  expenses: number;
  net: number;
}

export interface DashboardData {
  totalBalance: number;
  accountCount: number;
  accountTypesSummary: AccountTypeSummary[];
  accountsSummary: AccountSummary[];
  today: TodaySummary;
}

export interface MonthData {
  month: number;
  monthName: string;
  earnings: number;
  expenses: number;
  net: number;
}

export interface YearTotals {
  earnings: number;
  expenses: number;
  net: number;
}

export interface MonthlyBreakdown {
  year: number;
  months: MonthData[];
  yearTotals: YearTotals;
}

export interface CategoryData {
  category: string;
  total: number;
  count: number;
  percentage: number;
}

export interface CategoryBreakdown {
  type: TransactionType;
  categories: CategoryData[];
  grandTotal: number;
}

export interface FinancialSummary {
  earnings: {
    total: number;
    count: number;
  };
  totalExpenses: number;
  expenseCount: number;
  netIncome: number;
  transferFees: number;
}

export interface ReportParams {
  startDate?: string;
  endDate?: string;
  accountId?: string;
  year?: number;
  type?: TransactionType;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    pagination: Pagination;
  };
  message?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: string[];
  isNetworkError?: boolean;
  isAuthError?: boolean;
  isForbidden?: boolean;
  isNotFound?: boolean;
  isValidationError?: boolean;
  isConflict?: boolean;
  isServerError?: boolean;
}

// ============================================================================
// Navigation Types
// ============================================================================

export type RootStackParamList = {
  Main: undefined;
  Auth: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type DashboardStackParamList = {
  DashboardMain: undefined;
  Transactions: { accountId?: string };
  AccountDetail: { accountId: string };
};

export type AccountsStackParamList = {
  AccountsMain: undefined;
  AccountDetail: { accountId: string };
  AddAccount: undefined;
};

export type AddStackParamList = {
  AddTransaction: { type?: string; accountId?: string };
  Transfer: undefined;
};

export type ReportsStackParamList = {
  ReportsMain: undefined;
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
};

export type MainTabParamList = {
  Dashboard: NavigatorScreenParams<DashboardStackParamList>;
  Accounts: NavigatorScreenParams<AccountsStackParamList>;
  Add: NavigatorScreenParams<AddStackParamList>;
  Reports: NavigatorScreenParams<ReportsStackParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
};

// ============================================================================
// Component Props Types
// ============================================================================

export interface LoadingSpinnerProps {
  size?: "small" | "large";
  color?: string;
  message?: string;
  fullScreen?: boolean;
}

export interface EmptyStateProps {
  icon?: string;
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export interface TransactionCardProps {
  transaction: Transaction;
  onPress?: () => void;
  showAccount?: boolean;
}

export interface AccountCardProps {
  account: Account;
  onPress?: () => void;
  compact?: boolean;
  selected?: boolean;
}

// ============================================================================
// Context Types
// ============================================================================

export interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  checkAuth: () => Promise<void>;
}

export interface AppContextValue {
  accounts: Account[];
  accountTypes: AccountType[];
  dashboardData: DashboardData | null;
  isLoadingAccounts: boolean;
  isLoadingDashboard: boolean;
  refreshKey: number;
  fetchAccountTypes: () => Promise<void>;
  fetchAccounts: () => Promise<void>;
  fetchDashboard: () => Promise<void>;
  refreshData: () => Promise<void>;
  addAccount: (account: Account) => void;
  updateAccount: (account: Account) => void;
  removeAccount: (accountId: string) => void;
  clearData: () => void;
}

// ============================================================================
// Utility Types
// ============================================================================

export interface DateFormatOptions {
  year?: "numeric" | "2-digit";
  month?: "numeric" | "2-digit" | "long" | "short" | "narrow";
  day?: "numeric" | "2-digit";
  weekday?: "long" | "short" | "narrow";
  hour?: "numeric" | "2-digit";
  minute?: "numeric" | "2-digit";
  second?: "numeric" | "2-digit";
}

export type IconName =
  | "bank"
  | "cellphone"
  | "cash"
  | "wallet"
  | "arrow-down-circle"
  | "arrow-up-circle"
  | "swap-horizontal-circle"
  | "circle";

// ============================================================================
// Hook Types
// ============================================================================

export interface UseApiResult<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  execute: (...args: unknown[]) => Promise<T>;
  reset: () => void;
}
