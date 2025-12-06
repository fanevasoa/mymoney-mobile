/**
 * Theme Configuration
 *
 * Defines the visual theme for the app including colors, typography, and spacing.
 * Uses React Native Paper's theming system with custom extensions.
 */

import { MD3LightTheme, MD3DarkTheme, type MD3Theme } from "react-native-paper";

// ============================================================================
// Color Palette
// ============================================================================

export const colors = {
  // Primary colors
  primary: "#6366F1",
  primaryLight: "#818CF8",
  primaryDark: "#4F46E5",

  // Secondary colors
  secondary: "#10B981",
  secondaryLight: "#34D399",
  secondaryDark: "#059669",

  // Accent colors
  accent: "#F59E0B",

  // Semantic colors
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#3B82F6",

  // Neutral colors
  background: "#F9FAFB",
  surface: "#FFFFFF",
  surfaceVariant: "#F3F4F6",

  // Text colors
  textPrimary: "#111827",
  textSecondary: "#6B7280",
  textDisabled: "#9CA3AF",
  textInverse: "#FFFFFF",

  // Border colors
  border: "#E5E7EB",
  borderLight: "#F3F4F6",

  // Transaction colors
  earning: "#10B981",
  expense: "#EF4444",
  transfer: "#3B82F6",

  // Account type colors
  bank: "#3B82F6",
  mobileMoney: "#10B981",
  cash: "#F59E0B",
} as const;

export type Colors = {
  [K in keyof typeof colors]: string;
};

// ============================================================================
// Spacing Scale
// ============================================================================

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export type Spacing = typeof spacing;

// ============================================================================
// Border Radius Scale
// ============================================================================

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export type BorderRadius = typeof borderRadius;

// ============================================================================
// Font Sizes
// ============================================================================

export const fontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 24,
  xxxl: 32,
} as const;

export type FontSize = typeof fontSize;

// ============================================================================
// Custom Theme Extensions
// ============================================================================

interface CustomThemeExtensions {
  colors: Colors;
  spacing: Spacing;
  borderRadius: BorderRadius;
  fontSize: FontSize;
}

export interface AppTheme extends MD3Theme {
  custom: CustomThemeExtensions;
}

// ============================================================================
// Light Theme
// ============================================================================

export const theme: AppTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    primaryContainer: colors.primaryLight,
    secondary: colors.secondary,
    secondaryContainer: colors.secondaryLight,
    background: colors.background,
    surface: colors.surface,
    surfaceVariant: colors.surfaceVariant,
    error: colors.error,
    onPrimary: colors.textInverse,
    onSecondary: colors.textInverse,
    onBackground: colors.textPrimary,
    onSurface: colors.textPrimary,
    outline: colors.border,
  },
  custom: {
    colors,
    spacing,
    borderRadius,
    fontSize,
  },
};

// ============================================================================
// Dark Theme (for future use)
// ============================================================================

const darkColors = {
  ...colors,
  background: "#111827",
  surface: "#1F2937",
  surfaceVariant: "#374151",
  textPrimary: "#F9FAFB",
  textSecondary: "#9CA3AF",
  border: "#374151",
};

export const darkTheme: AppTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.primaryLight,
    primaryContainer: colors.primaryDark,
    secondary: colors.secondaryLight,
    secondaryContainer: colors.secondaryDark,
    background: darkColors.background,
    surface: darkColors.surface,
    surfaceVariant: darkColors.surfaceVariant,
    error: colors.error,
  },
  custom: {
    colors: darkColors,
    spacing,
    borderRadius,
    fontSize,
  },
};

export default theme;
