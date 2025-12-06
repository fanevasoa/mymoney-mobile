/**
 * useApi Hook
 *
 * Custom hook for handling API calls with loading and error states.
 */

import { useState, useCallback } from "react";

interface UseApiResult<T, Args extends unknown[]> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  execute: (...args: Args) => Promise<T>;
  reset: () => void;
}

/**
 * Hook for making API calls with automatic state management
 */
export default function useApi<T, Args extends unknown[] = unknown[]>(
  apiFunction: (...args: Args) => Promise<T>
): UseApiResult<T, Args> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /**
   * Execute the API call
   */
  const execute = useCallback(
    async (...args: Args): Promise<T> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await apiFunction(...args);
        setData(response);

        return response;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
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
  const reset = useCallback((): void => {
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
