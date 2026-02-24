/**
 * API Services Tests
 *
 * Tests for authService, accountService, and transactionService.
 * The apiClient is mocked so no real HTTP requests are made.
 */

import * as SecureStore from "expo-secure-store";

// Mock the API client module
jest.mock("../../src/api/client", () => {
  const mockClient = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  };
  return {
    __esModule: true,
    default: mockClient,
    getToken: jest.fn().mockResolvedValue(null),
    setToken: jest.fn().mockResolvedValue(undefined),
    removeToken: jest.fn().mockResolvedValue(undefined),
  };
});

// Import after mocks are set up
import apiClient, { setToken } from "../../src/api/client";
import authService from "../../src/api/services/authService";
import accountService from "../../src/api/services/accountService";
import transactionService from "../../src/api/services/transactionService";

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;
const mockSetToken = setToken as jest.MockedFunction<typeof setToken>;

// ============================================================================
// authService
// ============================================================================

describe("authService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("login", () => {
    it("should call POST /auth/login with credentials", async () => {
      const mockResponse = {
        success: true,
        data: {
          user: { id: "1", name: "Test", email: "test@test.com" },
          token: "jwt-token-123",
        },
      };
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      const result = await authService.login({
        email: "test@test.com",
        password: "password123",
      });

      expect(mockApiClient.post).toHaveBeenCalledWith("/auth/login", {
        email: "test@test.com",
        password: "password123",
      });
      expect(result).toEqual(mockResponse);
    });

    it("should store token on successful login", async () => {
      const mockResponse = {
        success: true,
        data: {
          user: { id: "1", name: "Test", email: "test@test.com" },
          token: "jwt-token-123",
        },
      };
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      await authService.login({
        email: "test@test.com",
        password: "password123",
      });

      expect(mockSetToken).toHaveBeenCalledWith("jwt-token-123");
    });

    it("should not store token on failed login", async () => {
      const mockResponse = {
        success: false,
        data: { user: null, token: null },
      };
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      await authService.login({
        email: "test@test.com",
        password: "wrong",
      });

      expect(mockSetToken).not.toHaveBeenCalled();
    });
  });

  describe("register", () => {
    it("should call POST /auth/register with user data", async () => {
      const mockResponse = {
        success: true,
        data: {
          user: { id: "1", name: "New User", email: "new@test.com" },
          token: "new-jwt-token",
        },
      };
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      const result = await authService.register({
        name: "New User",
        email: "new@test.com",
        password: "password123",
      });

      expect(mockApiClient.post).toHaveBeenCalledWith("/auth/register", {
        name: "New User",
        email: "new@test.com",
        password: "password123",
      });
      expect(result).toEqual(mockResponse);
    });

    it("should store token on successful registration", async () => {
      const mockResponse = {
        success: true,
        data: {
          user: { id: "1", name: "New User", email: "new@test.com" },
          token: "new-jwt-token",
        },
      };
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      await authService.register({
        name: "New User",
        email: "new@test.com",
        password: "password123",
      });

      expect(mockSetToken).toHaveBeenCalledWith("new-jwt-token");
    });
  });

  describe("logout", () => {
    it("should call removeToken", async () => {
      const { removeToken } = require("../../src/api/client");

      await authService.logout();

      expect(removeToken).toHaveBeenCalled();
    });
  });

  describe("getCurrentUser", () => {
    it("should call GET /auth/me", async () => {
      const mockResponse = {
        success: true,
        data: {
          user: { id: "1", name: "Test", email: "test@test.com" },
        },
      };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await authService.getCurrentUser();

      expect(mockApiClient.get).toHaveBeenCalledWith("/auth/me");
      expect(result).toEqual(mockResponse);
    });
  });

  describe("changePassword", () => {
    it("should call PUT /auth/password with password data", async () => {
      const mockResponse = {
        success: true,
        data: { message: "Password updated" },
      };
      mockApiClient.put.mockResolvedValueOnce(mockResponse);

      const result = await authService.changePassword({
        currentPassword: "old-pass",
        newPassword: "new-pass",
      });

      expect(mockApiClient.put).toHaveBeenCalledWith("/auth/password", {
        currentPassword: "old-pass",
        newPassword: "new-pass",
      });
      expect(result).toEqual(mockResponse);
    });
  });
});

// ============================================================================
// accountService
// ============================================================================

describe("accountService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAccounts", () => {
    it("should call GET /accounts with default params", async () => {
      const mockResponse = {
        success: true,
        data: {
          accounts: [],
          pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
        },
      };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await accountService.getAccounts();

      expect(mockApiClient.get).toHaveBeenCalledWith("/accounts", {
        params: {},
      });
      expect(result).toEqual(mockResponse);
    });

    it("should pass query params when provided", async () => {
      const mockResponse = {
        success: true,
        data: { accounts: [], pagination: {} },
      };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      await accountService.getAccounts({ page: 2, limit: 5, isActive: true });

      expect(mockApiClient.get).toHaveBeenCalledWith("/accounts", {
        params: { page: 2, limit: 5, isActive: true },
      });
    });
  });

  describe("getAccountById", () => {
    it("should call GET /accounts/:id", async () => {
      const mockResponse = {
        success: true,
        data: { account: { id: "abc", name: "Savings" } },
      };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await accountService.getAccountById("abc");

      expect(mockApiClient.get).toHaveBeenCalledWith("/accounts/abc");
      expect(result).toEqual(mockResponse);
    });
  });

  describe("createAccount", () => {
    it("should call POST /accounts with account data", async () => {
      const accountData = {
        name: "New Account",
        accountTypeId: "type-1",
        balance: 1000,
      };
      const mockResponse = {
        success: true,
        data: { account: { id: "new-1", ...accountData } },
      };
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      const result = await accountService.createAccount(accountData);

      expect(mockApiClient.post).toHaveBeenCalledWith("/accounts", accountData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe("updateAccount", () => {
    it("should call PUT /accounts/:id with update data", async () => {
      const updateData = { name: "Updated Account" };
      const mockResponse = {
        success: true,
        data: { account: { id: "abc", name: "Updated Account" } },
      };
      mockApiClient.put.mockResolvedValueOnce(mockResponse);

      const result = await accountService.updateAccount("abc", updateData);

      expect(mockApiClient.put).toHaveBeenCalledWith(
        "/accounts/abc",
        updateData
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("deleteAccount", () => {
    it("should call DELETE /accounts/:id", async () => {
      const mockResponse = {
        success: true,
        data: { message: "Account deleted" },
      };
      mockApiClient.delete.mockResolvedValueOnce(mockResponse);

      const result = await accountService.deleteAccount("abc");

      expect(mockApiClient.delete).toHaveBeenCalledWith("/accounts/abc");
      expect(result).toEqual(mockResponse);
    });
  });

  describe("getAccountTypes", () => {
    it("should call GET /account-types", async () => {
      const mockResponse = {
        success: true,
        data: { accountTypes: [{ id: "1", name: "Bank" }] },
      };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await accountService.getAccountTypes();

      expect(mockApiClient.get).toHaveBeenCalledWith("/account-types");
      expect(result).toEqual(mockResponse);
    });
  });
});

// ============================================================================
// transactionService
// ============================================================================

describe("transactionService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getTransactions", () => {
    it("should call GET /transactions with default params", async () => {
      const mockResponse = {
        success: true,
        data: {
          transactions: [],
          pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
        },
      };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await transactionService.getTransactions();

      expect(mockApiClient.get).toHaveBeenCalledWith("/transactions", {
        params: {},
      });
      expect(result).toEqual(mockResponse);
    });

    it("should pass query params when provided", async () => {
      const mockResponse = {
        success: true,
        data: { transactions: [], pagination: {} },
      };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      await transactionService.getTransactions({
        accountId: "acc-1",
        type: "expense",
        page: 1,
      });

      expect(mockApiClient.get).toHaveBeenCalledWith("/transactions", {
        params: { accountId: "acc-1", type: "expense", page: 1 },
      });
    });
  });

  describe("getTransactionById", () => {
    it("should call GET /transactions/:id", async () => {
      const mockResponse = {
        success: true,
        data: { transaction: { id: "txn-1", amount: 100 } },
      };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await transactionService.getTransactionById("txn-1");

      expect(mockApiClient.get).toHaveBeenCalledWith("/transactions/txn-1");
      expect(result).toEqual(mockResponse);
    });
  });

  describe("createTransaction", () => {
    it("should call POST /transactions with transaction data", async () => {
      const transactionData = {
        type: "expense" as const,
        amount: 50,
        accountId: "acc-1",
        description: "Coffee",
        category: "Food",
      };
      const mockResponse = {
        success: true,
        data: { transaction: { id: "txn-new", ...transactionData } },
      };
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      const result =
        await transactionService.createTransaction(transactionData);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        "/transactions",
        transactionData
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("updateTransaction", () => {
    it("should call PUT /transactions/:id with update data", async () => {
      const updateData = { description: "Updated description" };
      const mockResponse = {
        success: true,
        data: {
          transaction: { id: "txn-1", description: "Updated description" },
        },
      };
      mockApiClient.put.mockResolvedValueOnce(mockResponse);

      const result = await transactionService.updateTransaction(
        "txn-1",
        updateData
      );

      expect(mockApiClient.put).toHaveBeenCalledWith(
        "/transactions/txn-1",
        updateData
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("deleteTransaction", () => {
    it("should call DELETE /transactions/:id", async () => {
      const mockResponse = {
        success: true,
        data: { message: "Transaction deleted" },
      };
      mockApiClient.delete.mockResolvedValueOnce(mockResponse);

      const result = await transactionService.deleteTransaction("txn-1");

      expect(mockApiClient.delete).toHaveBeenCalledWith("/transactions/txn-1");
      expect(result).toEqual(mockResponse);
    });
  });
});
