/**
 * Authentication Context
 *
 * Provides centralized authentication state management for the MyMoney app.
 * This context handles all authentication-related operations and state,
 * making auth data accessible to any component in the app tree.
 *
 * Features:
 * - **Persistent Authentication**: Checks for stored JWT token on app launch
 * - **Login/Logout**: Handles user authentication and session management
 * - **Registration**: Creates new user accounts
 * - **Auto Token Refresh**: Validates token on app resume
 * - **Loading States**: Provides loading indicators during auth operations
 *
 * Usage:
 * ```jsx
 * // Wrap your app with AuthProvider
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 *
 * // Access auth state in components
 * const { user, login, logout, isAuthenticated } = useAuth();
 * ```
 *
 * @module contexts/AuthContext
 * @requires react
 * @requires ../api
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { authService, getToken } from "../api";

// ============================================
// CONTEXT CREATION
// ============================================

/**
 * Authentication Context
 *
 * @type {React.Context<AuthContextValue|null>}
 */
const AuthContext = createContext(null);

// ============================================
// PROVIDER COMPONENT
// ============================================

/**
 * Authentication Provider Component
 *
 * Wraps the application to provide authentication state and methods
 * to all child components via React Context.
 *
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to wrap
 * @returns {JSX.Element} Provider component with auth context value
 *
 * @example
 * // In App.js
 * import { AuthProvider } from './contexts/AuthContext';
 *
 * function App() {
 *   return (
 *     <AuthProvider>
 *       <Navigation />
 *     </AuthProvider>
 *   );
 * }
 */
export function AuthProvider({ children }) {
  // ============================================
  // STATE
  // ============================================

  /** @type {Object|null} Current authenticated user object */
  const [user, setUser] = useState(null);

  /** @type {boolean} True while checking auth status on app load */
  const [isLoading, setIsLoading] = useState(true);

  /** @type {boolean} True if user is authenticated */
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ============================================
  // AUTH METHODS
  // ============================================

  /**
   * Checks authentication status on app launch
   *
   * Looks for stored JWT token and validates it by fetching the current user.
   * If token is invalid or expired, clears auth state and logs user out.
   *
   * @async
   * @function checkAuth
   * @returns {Promise<void>}
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
   * Authenticates user with email and password
   *
   * Calls the login API and updates context state on success.
   * JWT token is automatically stored by the auth service.
   *
   * @async
   * @function login
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise<Object>} API response with user data and token
   * @throws {Error} If credentials are invalid or API call fails
   *
   * @example
   * try {
   *   await login('user@example.com', 'password123');
   *   // User is now authenticated, navigation will update automatically
   * } catch (error) {
   *   console.error('Login failed:', error.message);
   * }
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
   * Creates a new user account
   *
   * Registers the user and automatically logs them in on success.
   * JWT token is stored for immediate authentication.
   *
   * @async
   * @function register
   * @param {string} name - User's full name
   * @param {string} email - User's email address (must be unique)
   * @param {string} password - User's password (min 6 characters)
   * @returns {Promise<Object>} API response with user data and token
   * @throws {Error} If email is taken or validation fails
   *
   * @example
   * try {
   *   await register('John Doe', 'john@example.com', 'secure123');
   *   // User is registered and logged in
   * } catch (error) {
   *   console.error('Registration failed:', error.message);
   * }
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
   * Logs out the current user
   *
   * Clears the stored JWT token and resets authentication state.
   * Always clears state even if the API call fails to ensure
   * the user can start fresh.
   *
   * @async
   * @function logout
   * @returns {Promise<void>}
   */
  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Logout error:", error);
      // Clear state anyway to allow re-login
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  /**
   * Updates the user object in context state
   *
   * Used to reflect profile changes without re-fetching from API.
   * Merges provided data with existing user object.
   *
   * @function updateUser
   * @param {Object} userData - Partial user data to merge
   *
   * @example
   * updateUser({ name: 'New Name' });
   */
  const updateUser = (userData) => {
    setUser((prev) => ({ ...prev, ...userData }));
  };

  // ============================================
  // CONTEXT VALUE
  // ============================================

  /**
   * @typedef {Object} AuthContextValue
   * @property {Object|null} user - Current user object or null if not authenticated
   * @property {boolean} isLoading - True while checking authentication status
   * @property {boolean} isAuthenticated - True if user is logged in
   * @property {Function} login - Login function
   * @property {Function} register - Registration function
   * @property {Function} logout - Logout function
   * @property {Function} updateUser - Update user profile in state
   * @property {Function} checkAuth - Re-check authentication status
   */
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

// ============================================
// CUSTOM HOOK
// ============================================

/**
 * Custom hook to access authentication context
 *
 * Provides access to the current user, authentication status,
 * and auth-related functions (login, logout, register).
 *
 * Must be used within an AuthProvider component.
 *
 * @function useAuth
 * @returns {AuthContextValue} Authentication context value
 * @throws {Error} If used outside of AuthProvider
 *
 * @example
 * function ProfileScreen() {
 *   const { user, logout, isAuthenticated } = useAuth();
 *
 *   if (!isAuthenticated) {
 *     return <LoginPrompt />;
 *   }
 *
 *   return (
 *     <View>
 *       <Text>Welcome, {user.name}!</Text>
 *       <Button onPress={logout}>Logout</Button>
 *     </View>
 *   );
 * }
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

export default AuthContext;
