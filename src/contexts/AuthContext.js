/**
 * Authentication Context
 *
 * Provides authentication state and methods throughout the app:
 * - User state (logged in/out)
 * - Login/logout functions
 * - Registration function
 * - Loading state
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { authService, getToken } from "../api";

// Create context
const AuthContext = createContext(null);

/**
 * Authentication Provider Component
 * Wraps the app to provide auth state and methods
 */
export function AuthProvider({ children }) {
  // State
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /**
   * Check if user is already authenticated on app load
   */
  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = await getToken();

      if (token) {
        // Token exists, verify it by fetching current user
        const response = await authService.getCurrentUser();
        if (response.success) {
          setUser(response.data.user);
          setIsAuthenticated(true);
        } else {
          // Invalid token, clear it
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
      // Clear auth state on error
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
   * Login user
   * @param {string} email
   * @param {string} password
   * @returns {Promise<Object>}
   */
  const login = async (email, password) => {
    try {
      const response = await authService.login({ email, password });

      if (response.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      }

      return response;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Register new user
   * @param {string} name
   * @param {string} email
   * @param {string} password
   * @returns {Promise<Object>}
   */
  const register = async (name, email, password) => {
    try {
      const response = await authService.register({ name, email, password });

      if (response.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      }

      return response;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Logout error:", error);
      // Clear state anyway
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  /**
   * Update user profile in state
   * @param {Object} userData
   */
  const updateUser = (userData) => {
    setUser((prev) => ({ ...prev, ...userData }));
  };

  // Context value
  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to use auth context
 * @returns {Object} Auth context value
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

export default AuthContext;
