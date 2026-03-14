/**
 * Balance Visibility Context
 *
 * Manages the visibility of personal account balances.
 * Each section has its own independent toggle. Default: masked.
 */

import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  type ReactNode,
} from "react";

// ============================================================================
// Constants
// ============================================================================

const MASKED_BALANCE = "••••••";

// ============================================================================
// Types
// ============================================================================

interface BalanceVisibilityContextValue {
  /** Check if a specific section is currently revealed */
  isVisible: (key: string) => boolean;
  /** Toggle visibility for a specific section */
  toggle: (key: string) => void;
  /** The masked placeholder string */
  maskedBalance: string;
}

// ============================================================================
// Context Creation
// ============================================================================

const BalanceVisibilityContext =
  createContext<BalanceVisibilityContextValue | null>(null);

// ============================================================================
// Provider
// ============================================================================

interface BalanceVisibilityProviderProps {
  children: ReactNode;
}

export function BalanceVisibilityProvider({
  children,
}: BalanceVisibilityProviderProps): React.JSX.Element {
  // Set of keys that have been revealed (default: all masked)
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());

  const isVisible = useCallback(
    (key: string) => revealedKeys.has(key),
    [revealedKeys],
  );

  const toggle = useCallback((key: string) => {
    setRevealedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const value = useMemo<BalanceVisibilityContextValue>(
    () => ({
      isVisible,
      toggle,
      maskedBalance: MASKED_BALANCE,
    }),
    [isVisible, toggle],
  );

  return (
    <BalanceVisibilityContext.Provider value={value}>
      {children}
    </BalanceVisibilityContext.Provider>
  );
}

// ============================================================================
// Custom Hook
// ============================================================================

export function useBalanceVisibility(): BalanceVisibilityContextValue {
  const context = useContext(BalanceVisibilityContext);

  if (!context) {
    throw new Error(
      "useBalanceVisibility must be used within a BalanceVisibilityProvider",
    );
  }

  return context;
}

export default BalanceVisibilityContext;
