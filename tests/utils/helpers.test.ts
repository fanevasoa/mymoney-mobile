/**
 * Helper Utilities Tests
 */

import {
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
} from "../../src/utils/helpers";

// ============================================================================
// formatCurrency
// ============================================================================

describe("formatCurrency", () => {
  it("should format a positive number as currency", () => {
    const result = formatCurrency(1000);
    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
  });

  it("should handle null amount", () => {
    const result = formatCurrency(null);
    expect(result).toBeDefined();
    // null coerces to 0
    expect(result).toContain("0");
  });

  it("should handle undefined amount", () => {
    const result = formatCurrency(undefined);
    expect(result).toBeDefined();
  });

  it("should handle zero amount", () => {
    const result = formatCurrency(0);
    expect(result).toBeDefined();
    expect(result).toContain("0");
  });

  it("should handle negative amounts", () => {
    const result = formatCurrency(-500);
    expect(result).toBeDefined();
  });

  it("should use custom currency when provided", () => {
    const result = formatCurrency(100, "USD");
    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
  });

  it("should respect custom decimal places", () => {
    const result = formatCurrency(100.567, "MGA", 0);
    expect(result).not.toContain("567");
  });
});

// ============================================================================
// formatDate
// ============================================================================

describe("formatDate", () => {
  it("should format a valid date string", () => {
    const result = formatDate("2024-01-15");
    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
    expect(result).not.toBe("Invalid Date");
  });

  it("should format a Date object", () => {
    const result = formatDate(new Date(2024, 0, 15));
    expect(result).toBeDefined();
    expect(result).not.toBe("Invalid Date");
  });

  it("should format a timestamp number", () => {
    const result = formatDate(1705276800000);
    expect(result).toBeDefined();
    expect(result).not.toBe("Invalid Date");
  });

  it("should return 'Invalid Date' for invalid input", () => {
    const result = formatDate("not-a-date");
    expect(result).toBe("Invalid Date");
  });

  it("should apply custom format options", () => {
    const result = formatDate("2024-01-15", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    expect(result).toBeDefined();
    expect(result).toContain("2024");
  });
});

// ============================================================================
// formatRelativeTime
// ============================================================================

describe("formatRelativeTime", () => {
  it("should return 'Just now' for very recent dates", () => {
    const now = new Date();
    const result = formatRelativeTime(now);
    expect(result).toBe("Just now");
  });

  it("should return minutes ago for recent dates", () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const result = formatRelativeTime(fiveMinutesAgo);
    expect(result).toBe("5 minutes ago");
  });

  it("should return hours ago for same-day dates", () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const result = formatRelativeTime(twoHoursAgo);
    expect(result).toBe("2 hours ago");
  });

  it("should return singular form for 1 minute", () => {
    const oneMinuteAgo = new Date(Date.now() - 1 * 60 * 1000);
    const result = formatRelativeTime(oneMinuteAgo);
    expect(result).toBe("1 minute ago");
  });

  it("should return singular form for 1 hour", () => {
    const oneHourAgo = new Date(Date.now() - 1 * 60 * 60 * 1000);
    const result = formatRelativeTime(oneHourAgo);
    expect(result).toBe("1 hour ago");
  });

  it("should return days ago for recent past dates", () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const result = formatRelativeTime(threeDaysAgo);
    expect(result).toBe("3 days ago");
  });

  it("should return formatted date for dates older than a week", () => {
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const result = formatRelativeTime(twoWeeksAgo);
    expect(result).not.toContain("ago");
    expect(result).not.toBe("Invalid Date");
  });

  it("should return 'Invalid Date' for invalid input", () => {
    const result = formatRelativeTime("not-a-date");
    expect(result).toBe("Invalid Date");
  });

  it("should return formatted date for future dates", () => {
    const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const result = formatRelativeTime(futureDate);
    // Future dates fall through to formatDate
    expect(result).not.toContain("ago");
    expect(result).not.toBe("Invalid Date");
  });
});

// ============================================================================
// truncateText
// ============================================================================

describe("truncateText", () => {
  it("should return the original text if within max length", () => {
    expect(truncateText("Hello", 10)).toBe("Hello");
  });

  it("should truncate text exceeding max length", () => {
    expect(truncateText("Hello World", 5)).toBe("Hello...");
  });

  it("should return empty string for null", () => {
    expect(truncateText(null)).toBe("");
  });

  it("should return empty string for undefined", () => {
    expect(truncateText(undefined)).toBe("");
  });

  it("should return empty string for empty string", () => {
    expect(truncateText("")).toBe("");
  });

  it("should use default max length of 50", () => {
    const longText = "a".repeat(60);
    const result = truncateText(longText);
    expect(result).toBe("a".repeat(50) + "...");
  });
});

// ============================================================================
// getInitials
// ============================================================================

describe("getInitials", () => {
  it("should return two initials for a full name", () => {
    expect(getInitials("John Doe")).toBe("JD");
  });

  it("should return first two characters for a single name", () => {
    expect(getInitials("John")).toBe("JO");
  });

  it("should return '?' for null", () => {
    expect(getInitials(null)).toBe("?");
  });

  it("should return '?' for undefined", () => {
    expect(getInitials(undefined)).toBe("?");
  });

  it("should return '?' for empty string", () => {
    expect(getInitials("")).toBe("?");
  });

  it("should return '?' for whitespace-only string", () => {
    expect(getInitials("   ")).toBe("?");
  });

  it("should handle names with multiple parts", () => {
    expect(getInitials("John Michael Doe")).toBe("JD");
  });

  it("should uppercase the initials", () => {
    expect(getInitials("john doe")).toBe("JD");
  });
});

// ============================================================================
// isValidEmail
// ============================================================================

describe("isValidEmail", () => {
  it("should return true for a valid email", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
  });

  it("should return true for email with subdomain", () => {
    expect(isValidEmail("user@sub.example.com")).toBe(true);
  });

  it("should return false for null", () => {
    expect(isValidEmail(null)).toBe(false);
  });

  it("should return false for undefined", () => {
    expect(isValidEmail(undefined)).toBe(false);
  });

  it("should return false for empty string", () => {
    expect(isValidEmail("")).toBe(false);
  });

  it("should return false for string without @", () => {
    expect(isValidEmail("userexample.com")).toBe(false);
  });

  it("should return false for string without domain", () => {
    expect(isValidEmail("user@")).toBe(false);
  });

  it("should return true for email with plus sign", () => {
    expect(isValidEmail("user+tag@example.com")).toBe(true);
  });
});

// ============================================================================
// debounce
// ============================================================================

describe("debounce", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should delay function execution", () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 200);

    debounced();
    expect(fn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("should only execute once for multiple rapid calls", () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 200);

    debounced();
    debounced();
    debounced();

    jest.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("should cancel pending execution", () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 200);

    debounced();
    debounced.cancel();

    jest.advanceTimersByTime(200);
    expect(fn).not.toHaveBeenCalled();
  });

  it("should use default wait time of 300ms", () => {
    const fn = jest.fn();
    const debounced = debounce(fn);

    debounced();
    jest.advanceTimersByTime(299);
    expect(fn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

// ============================================================================
// getColorByIndex / getColorPalette
// ============================================================================

describe("getColorByIndex", () => {
  it("should return a color string", () => {
    const color = getColorByIndex(0);
    expect(color).toBeDefined();
    expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it("should wrap around for large indices", () => {
    const palette = getColorPalette();
    const color = getColorByIndex(palette.length);
    expect(color).toBe(palette[0]);
  });

  it("should handle negative indices", () => {
    const color = getColorByIndex(-3);
    expect(color).toBeDefined();
    expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });
});

describe("getColorPalette", () => {
  it("should return an array of colors", () => {
    const palette = getColorPalette();
    expect(Array.isArray(palette)).toBe(true);
    expect(palette.length).toBeGreaterThan(0);
  });

  it("should return a copy (not the original)", () => {
    const palette1 = getColorPalette();
    const palette2 = getColorPalette();
    expect(palette1).not.toBe(palette2);
    expect(palette1).toEqual(palette2);
  });
});

// ============================================================================
// parseApiError
// ============================================================================

describe("parseApiError", () => {
  it("should return default message for null/undefined", () => {
    expect(parseApiError(null)).toBe("An unexpected error occurred");
    expect(parseApiError(undefined)).toBe("An unexpected error occurred");
  });

  it("should return the string directly if error is a string", () => {
    expect(parseApiError("Something went wrong")).toBe("Something went wrong");
  });

  it("should extract message from Error instance", () => {
    expect(parseApiError(new Error("Test error"))).toBe("Test error");
  });

  it("should extract message from API error response", () => {
    const apiError = {
      response: {
        data: {
          message: "Unauthorized",
        },
      },
    };
    expect(parseApiError(apiError)).toBe("Unauthorized");
  });

  it("should extract top-level message from error object", () => {
    const error = { message: "Bad request" };
    expect(parseApiError(error)).toBe("Bad request");
  });

  it("should return default message for unknown error shapes", () => {
    expect(parseApiError(42)).toBe("An unexpected error occurred");
    expect(parseApiError({})).toBe("An unexpected error occurred");
  });
});
