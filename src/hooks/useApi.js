/**
 * useApi Hook
 *
 * Custom hook for handling API calls with loading and error states.
 */

import { useState, useCallback } from "react";

/**
 * Hook for making API calls with automatic state management
 * @param {Function} apiFunction - The API function to call
 * @returns {Object} { data, error, isLoading, execute, reset }
 */
export default function useApi(apiFunction) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Execute the API call
   * @param {...any} args - Arguments to pass to the API function
   * @returns {Promise<any>} API response
   */
  const execute = useCallback(
    async (...args) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await apiFunction(...args);
        setData(response);

        return response;
      } catch (err) {
        const errorMessage = err.message || "An error occurred";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [apiFunction]
  );

  /**
   * Reset the hook state
   */
  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    data,
    error,
    isLoading,
    execute,
    reset,
  };
}
