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
  isFavorite?: boolean;
  accountTypeId: string;
  accountType?: AccountType;
  sharedAccountId?: string | null;
  sharedAccount?:
    | (Pick<SharedAccount, "id" | "name" | "balance"> & {
        description?: string | null;
        myRole?: "manager" | "member" | null;
        isFavorite?: boolean;
        memberCount?: number;
      })
    | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccountData {
  name: string;
  accountTypeId: string;
  balance?: number;
  description?: string | null;
  isSharedAccount?: boolean;
}

export interface UpdateAccountData {
  name?: string;
  description?: string | null;
  isActive?: boolean;
  isFavorite?: boolean;
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
  date: string;
  accountId: string;
  account?: Account;
  borrowing?: Borrowing | null;
  transferId?: string | null;
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
  date?: string;
  isBorrowed?: boolean;
  borrowerName?: string | null;
  dueDate?: string | null;
  isBorrowingResolution?: boolean;
  borrowingId?: string | null;
  resolutionAmount?: number | null;
}

export interface UpdateTransactionData {
  description?: string | null;
  category?: string | null;
  amount?: number;
  type?: TransactionType;
  date?: string;
  isLent?: boolean;
  isBorrowed?: boolean;
  borrowerName?: string | null;
  dueDate?: string | null;
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

export interface SharedAccountSummary {
  id: string;
  name: string;
  description?: string;
  balance: number;
  myRole: string;
  membersCount: number;
  isFavorite?: boolean;
}

export interface DashboardData {
  totalBalance: number;
  accountCount: number;
  accountTypesSummary: AccountTypeSummary[];
  accountsSummary: AccountSummary[];
  sharedAccountsSummary?: SharedAccountSummary[];
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

export interface WeekData {
  week: number;
  label: string;
  startDate: string;
  endDate: string;
  earnings: number;
  expenses: number;
  net: number;
}

export interface WeeklyBreakdown {
  year: number;
  month: number;
  monthName: string;
  weeks: WeekData[];
  totals: YearTotals;
}

export interface DayData {
  day: number;
  date: string;
  label: string;
  earnings: number;
  expenses: number;
  net: number;
}

export interface DailyBreakdown {
  year: number;
  month: number;
  monthName: string;
  days: DayData[];
  totals: YearTotals;
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
  month?: number;
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
  EditTransaction: { transactionId: string };
};

export type SharedAccountScreensParamList = {
  SharedAccountDetail: { sharedAccountId: string };
  AddSharedAccountMember: { sharedAccountId: string };
  SharedAccountIncome: { sharedAccountId: string };
  CreateBudgetCampaign: { sharedAccountId: string };
  BudgetCampaignDetail: { sharedAccountId: string; campaignId: string };
  EditBudgetCampaign: {
    sharedAccountId: string;
    campaignId: string;
    name: string;
    description?: string | null;
  };
  AddBudgetItem: { sharedAccountId: string; campaignId: string };
  EditBudgetItem: {
    sharedAccountId: string;
    campaignId: string;
    itemId: string;
    name: string;
    quantity?: number | null;
    unitPrice?: number | null;
    amount: number;
  };
};

export type AccountsStackParamList = {
  AccountsMain: undefined;
  AccountDetail: { accountId: string };
  AddAccount: undefined;
  AddAccountType: undefined;
  EditAccountType: { accountTypeId: string };
  EditTransaction: { transactionId: string };
  Borrowings: undefined;
  BorrowingDetail: { borrowingId: string };
} & SharedAccountScreensParamList;

export type AddStackParamList = {
  AddTransaction: {
    type?: string;
    accountId?: string;
    returnToAccount?: boolean;
  };
  EditTransaction: { transactionId: string };
  Transfer: { fromAccountId?: string } | undefined;
  Borrowings: undefined;
  BorrowingDetail: { borrowingId: string };
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
    password: string,
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

export type ThemeMode = "system" | "light" | "dark";

export interface ThemeContextValue {
  themeMode: ThemeMode;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  colors: import("../theme").Colors;
}

// ============================================================================
// Borrowing Types
// ============================================================================

export type BorrowingStatus = "unresolved" | "partially_resolved" | "resolved";

export interface BorrowingResolution {
  id: string;
  amount: number;
  borrowingId: string;
  transactionId: string;
  transaction?: Transaction;
  createdAt: string;
  updatedAt: string;
}

export type BorrowingDirection = "borrowed" | "lent";

export interface Borrowing {
  id: string;
  amount: number;
  remainingAmount: number;
  description?: string | null;
  borrowerName?: string | null;
  dueDate?: string | null;
  status: BorrowingStatus;
  direction: BorrowingDirection;
  transactionId: string;
  transaction?: Transaction;
  resolutions?: BorrowingResolution[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateBorrowingData {
  description?: string | null;
  borrowerName?: string | null;
  dueDate?: string | null;
}

export interface BorrowingsParams {
  page?: number;
  limit?: number;
  status?: BorrowingStatus;
  direction?: BorrowingDirection;
}

// ============================================================================
// Shared Account Types
// ============================================================================

export type SharedAccountMemberRole = "manager" | "member";

export interface SharedAccountMember {
  id: string;
  role: SharedAccountMemberRole;
  sharedAccountId: string;
  userId: string;
  user?: Pick<User, "id" | "name" | "email">;
  isFavorite?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SharedAccount {
  id: string;
  name: string;
  description?: string | null;
  balance: number;
  createdBy: string;
  creator?: Pick<User, "id" | "name" | "email">;
  members?: SharedAccountMember[];
  myRole?: SharedAccountMemberRole;
  isFavorite?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSharedAccountData {
  name: string;
  description?: string | null;
}

export interface UpdateSharedAccountData {
  name?: string;
  description?: string | null;
}

export interface AddMemberData {
  email: string;
  role?: SharedAccountMemberRole;
}

export interface SharedAccountIncomeData {
  amount: number;
  description?: string | null;
}

// ============================================================================
// Budget Campaign Types
// ============================================================================

export type BudgetCampaignStatus =
  | "draft"
  | "pending_approval"
  | "approved"
  | "rejected"
  | "applied";

export type BudgetItemStatus = "pending" | "approved" | "rejected";

export interface BudgetItem {
  id: string;
  name: string;
  quantity?: number | null;
  unitPrice?: number | null;
  amount: number;
  status: BudgetItemStatus;
  approvedBy?: string | null;
  approver?: Pick<User, "id" | "name"> | null;
  budgetCampaignId: string;
  createdBy: string;
  creator?: Pick<User, "id" | "name">;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetCampaign {
  id: string;
  name: string;
  description?: string | null;
  status: BudgetCampaignStatus;
  totalAmount: number;
  sharedAccountId: string;
  createdBy: string;
  creator?: Pick<User, "id" | "name" | "email">;
  approvedBy?: string | null;
  approver?: Pick<User, "id" | "name" | "email"> | null;
  approvedAt?: string | null;
  appliedAt?: string | null;
  items?: BudgetItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateBudgetCampaignData {
  name: string;
  description?: string | null;
}

export interface CreateBudgetItemData {
  name: string;
  quantity?: number | null;
  unitPrice?: number | null;
  amount?: number | null;
}

export interface UpdateBudgetCampaignData {
  name?: string;
  description?: string | null;
}

export interface UpdateBudgetItemData {
  name?: string;
  quantity?: number | null;
  unitPrice?: number | null;
  amount?: number | null;
}

// ============================================================================
// Shared Account Transaction Types
// ============================================================================

export type SharedAccountTransactionType = "income" | "expense";
export type SharedAccountTransactionStatus =
  | "pending"
  | "approved"
  | "rejected";

export interface SharedAccountTransaction {
  id: string;
  type: SharedAccountTransactionType;
  amount: number;
  description?: string | null;
  status: SharedAccountTransactionStatus;
  sharedAccountId: string;
  budgetItemId?: string | null;
  budgetItem?:
    | (Pick<BudgetItem, "id" | "name" | "amount"> & {
        budgetCampaign?: Pick<BudgetCampaign, "id" | "name">;
      })
    | null;
  sourceAccountId?: string | null;
  createdBy: string;
  creator?: Pick<User, "id" | "name" | "email">;
  approvedBy?: string | null;
  approver?: Pick<User, "id" | "name" | "email"> | null;
  approvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSharedAccountTransactionData {
  type: SharedAccountTransactionType;
  amount: number;
  description?: string | null;
  budgetItemId?: string | null;
  sourceAccountId?: string | null;
  destinationAccountId?: string | null;
}

export interface ApprovedBudgetItemForSelection {
  id: string;
  name: string;
  amount: number;
  quantity?: number | null;
  unitPrice?: number | null;
  campaignName: string;
  campaignId: string;
  creator?: Pick<User, "id" | "name">;
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
