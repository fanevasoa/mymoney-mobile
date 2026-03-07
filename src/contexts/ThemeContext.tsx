/**
 * Theme Context
 *
 * Manages light/dark mode with system preference as default.
 * Persists user preference to AsyncStorage.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  type ReactNode,
} from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { colors, darkColors } from "../theme";
import type { ThemeMode, ThemeContextValue } from "../types";

// ============================================================================
// Constants
// ============================================================================

const THEME_STORAGE_KEY = "@mymoney_theme_mode";

// ============================================================================
// Context Creation
// ============================================================================

const ThemeContext = createContext<ThemeContextValue | null>(null);

// ============================================================================
// Provider Props
// ============================================================================

interface ThemeProviderProps {
  children: ReactNode;
}

// ============================================================================
// Provider Component
// ============================================================================

export function ThemeProvider({ children }: ThemeProviderProps): React.JSX.Element {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load persisted theme preference
  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((stored) => {
        if (stored === "light" || stored === "dark" || stored === "system") {
          setThemeModeState(stored);
        }
      })
      .catch(() => {
        // Ignore storage errors, default to system
      })
      .finally(() => setIsLoaded(true));
  }, []);

  const setThemeMode = useCallback(async (mode: ThemeMode): Promise<void> => {
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {
      // Ignore storage errors
    }
  }, []);

  const isDark = useMemo(() => {
    if (themeMode === "system") {
      return systemColorScheme === "dark";
    }
    return themeMode === "dark";
  }, [themeMode, systemColorScheme]);

  const currentColors = useMemo(() => {
    return isDark ? darkColors : colors;
  }, [isDark]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      themeMode,
      isDark,
      setThemeMode,
      colors: currentColors,
    }),
    [themeMode, isDark, setThemeMode, currentColors]
  );

  // Don't render until we've loaded the persisted preference
  if (!isLoaded) {
    return <>{null}</>;
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// ============================================================================
// Custom Hook
// ============================================================================

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}

export default ThemeContext;
