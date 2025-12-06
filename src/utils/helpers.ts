/**
 * Helper Utilities
 *
 * Common utility functions used throughout the app.
 */

import type { DateFormatOptions } from "../types";

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_LOCALE = "mg-MG";
const DEFAULT_DATE_LOCALE = "en-US";
const DEFAULT_CURRENCY = "MGA";
const DEFAULT_DECIMALS = 2;
const DEFAULT_DEBOUNCE_WAIT = 300;
const DEFAULT_TRUNCATE_LENGTH = 50;

const COLOR_PALETTE: readonly string[] = [
  "#6366F1",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
  "#F97316",
  "#06B6D4",
  "#84CC16",
] as const;

const TIME_UNITS = {
  MINUTE_MS: 60_000,
  MINUTES_IN_HOUR: 60,
  HOURS_IN_DAY: 24,
  DAYS_IN_WEEK: 7,
} as const;

const DEFAULT_DATE_OPTIONS: DateFormatOptions = {
  year: "numeric",
  month: "short",
  day: "numeric",
};

// ============================================================================
// Types
// ============================================================================

type DateInput = string | Date | number;

type DebouncedFunction<T extends (...args: unknown[]) => unknown> = (
  ...args: Parameters<T>
) => void;

interface ApiErrorLike {
  message?: string;
  response?: {
    data?: {
      message?: string;
    };
  };
}

// ============================================================================
// Currency & Number Formatting
// ============================================================================

/**
 * Format a number as currency
 */
export function formatCurrency(
  amount: number | null | undefined,
  currency: string = DEFAULT_CURRENCY,
  decimals: number = DEFAULT_DECIMALS
): string {
  const safeAmount = Number(amount) || 0;
  const safeDecimals = Math.max(0, Math.floor(decimals));

  try {
    return new Intl.NumberFormat(DEFAULT_LOCALE, {
      style: "currency",
      currency,
      minimumFractionDigits: safeDecimals,
      maximumFractionDigits: safeDecimals,
    }).format(safeAmount);
  } catch {
    return `${currency} ${safeAmount.toFixed(safeDecimals)}`;
  }
}

// ============================================================================
// Date Formatting
// ============================================================================

function parseDate(input: DateInput): Date {
  if (input instanceof Date) {
    return input;
  }
  return new Date(input);
}

function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Format a date string with customizable options
 */
export function formatDate(
  dateInput: DateInput,
  options: DateFormatOptions = {}
): string {
  const date = parseDate(dateInput);

  if (!isValidDate(date)) {
    return "Invalid Date";
  }

  const mergedOptions: DateFormatOptions = {
    ...DEFAULT_DATE_OPTIONS,
    ...options,
  };

  try {
    return date.toLocaleDateString(DEFAULT_DATE_LOCALE, mergedOptions);
  } catch {
    return date.toISOString().split("T")[0];
  }
}

/**
 * Format a date as relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(dateInput: DateInput): string {
  const date = parseDate(dateInput);

  if (!isValidDate(date)) {
    return "Invalid Date";
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  if (diffMs < 0) {
    return formatDate(dateInput);
  }

  const diffMins = Math.floor(diffMs / TIME_UNITS.MINUTE_MS);
  const diffHours = Math.floor(diffMins / TIME_UNITS.MINUTES_IN_HOUR);
  const diffDays = Math.floor(diffHours / TIME_UNITS.HOURS_IN_DAY);

  if (diffMins < 1) {
    return "Just now";
  }

  if (diffMins < TIME_UNITS.MINUTES_IN_HOUR) {
    return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
  }

  if (diffHours < TIME_UNITS.HOURS_IN_DAY) {
    return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  }

  if (diffDays < TIME_UNITS.DAYS_IN_WEEK) {
    return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  }

  return formatDate(dateInput);
}

// ============================================================================
// String Utilities
// ============================================================================

/**
 * Truncate text to a maximum length with ellipsis
 */
export function truncateText(
  text: string | null | undefined,
  maxLength: number = DEFAULT_TRUNCATE_LENGTH
): string {
  if (!text) {
    return "";
  }

  const safeMaxLength = Math.max(0, Math.floor(maxLength));

  if (text.length <= safeMaxLength) {
    return text;
  }

  return `${text.substring(0, safeMaxLength)}...`;
}

/**
 * Get initials from a name (up to 2 characters)
 */
export function getInitials(name: string | null | undefined): string {
  if (!name?.trim()) {
    return "?";
  }

  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "?";
  }

  if (parts.length >= 2) {
    const firstInitial = parts[0][0] ?? "";
    const lastInitial = parts[parts.length - 1][0] ?? "";
    return `${firstInitial}${lastInitial}`.toUpperCase();
  }

  return name.substring(0, 2).toUpperCase();
}

// ============================================================================
// Validation
// ============================================================================

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/**
 * Validate email format
 */
export function isValidEmail(email: string | null | undefined): boolean {
  if (!email || typeof email !== "string") {
    return false;
  }

  return EMAIL_REGEX.test(email.trim());
}

// ============================================================================
// Function Utilities
// ============================================================================

/**
 * Creates a debounced version of a function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number = DEFAULT_DEBOUNCE_WAIT
): DebouncedFunction<T> & { cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debouncedFn = (...args: Parameters<T>): void => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, wait);
  };

  debouncedFn.cancel = (): void => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debouncedFn;
}

// ============================================================================
// Color Utilities
// ============================================================================

/**
 * Get a color from the predefined palette by index
 */
export function getColorByIndex(index: number): string {
  const safeIndex = Math.abs(Math.floor(index));
  return COLOR_PALETTE[safeIndex % COLOR_PALETTE.length];
}

/**
 * Get the full color palette
 */
export function getColorPalette(): string[] {
  return [...COLOR_PALETTE];
}

// ============================================================================
// Error Handling
// ============================================================================

const DEFAULT_ERROR_MESSAGE = "An unexpected error occurred";

/**
 * Parse API error response and extract a user-friendly message
 */
export function parseApiError(error: unknown): string {
  if (!error) {
    return DEFAULT_ERROR_MESSAGE;
  }

  if (typeof error === "string") {
    return error || DEFAULT_ERROR_MESSAGE;
  }

  if (error instanceof Error) {
    return error.message || DEFAULT_ERROR_MESSAGE;
  }

  const apiError = error as ApiErrorLike;

  if (apiError.response?.data?.message) {
    return apiError.response.data.message;
  }

  if (apiError.message) {
    return apiError.message;
  }

  return DEFAULT_ERROR_MESSAGE;
}

// ============================================================================
// Exports
// ============================================================================

const helpers = {
  formatCurrency,
  formatDate,
  formatRelativeTime,
  truncateText,
  getInitials,
  isValidEmail,
  debounce,
  getColorByIndex,
  getColorPalette,
  parseApiError,
} as const;

export default helpers;
