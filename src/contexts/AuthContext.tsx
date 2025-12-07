/**
 * Authentication Context
 *
 * Provides centralized authentication state management for the MyMoney app.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { authService, getToken } from "../api";
import type { User, AuthResponse, AuthContextValue } from "../types";

// ============================================================================
// Context Creation
// ============================================================================

const AuthContext = createContext<AuthContextValue | null>(null);

// ============================================================================
// Provider Props
// ============================================================================

interface AuthProviderProps {
  children: ReactNode;
}

// ============================================================================
// Provider Component
// ============================================================================

export function AuthProvider({
  children,
}: AuthProviderProps): React.JSX.Element {
  // State
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // ============================================================================
  // Auth Methods
  // ============================================================================

  /**
   * Checks authentication status on app launch
   */
  const checkAuth = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      const token = await getToken();

      if (token) {
        const response = await authService.getCurrentUser();
        if (response.success) {
          setUser(response.data.user);
          setIsAuthenticated(true);
        } else {
          await authService.logout();
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  /**
   * Authenticates user with email and password
   */
  const login = useCallback(
    async (email: string, password: string): Promise<AuthResponse> => {
      const response = await authService.login({ email, password });

      if (response.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      }

      return response;
    },
    []
  );

  /**
   * Creates a new user account
   */
  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string
    ): Promise<AuthResponse> => {
      const response = await authService.register({ name, email, password });

      if (response.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      }

      return response;
    },
    []
  );

  /**
   * Logs out the current user
   */
  const logout = useCallback(async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  /**
   * Updates the user object in context state
   */
  const updateUser = useCallback((userData: Partial<User>): void => {
    setUser((prev) => (prev ? { ...prev, ...userData } : null));
  }, []);

  // ============================================================================
  // Context Value
  // ============================================================================

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated,
      login,
      register,
      logout,
      updateUser,
      checkAuth,
    }),
    [
      user,
      isLoading,
      isAuthenticated,
      login,
      register,
      logout,
      updateUser,
      checkAuth,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================================================
// Custom Hook
// ============================================================================

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

export default AuthContext;
