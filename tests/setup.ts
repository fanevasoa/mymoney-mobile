/**
 * Jest Test Setup
 *
 * Mocks and global configuration for the test environment.
 */

// Mock expo-secure-store
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

// Mock react-native Platform (used as a fallback for tests that don't mock it themselves)
jest.mock("react-native", () => ({
  Platform: {
    OS: "ios",
    select: jest.fn((obj: Record<string, unknown>) => obj.default ?? obj.ios),
  },
}));

// Silence console warnings and errors in test output
const originalWarn = console.warn;
const originalError = console.error;

beforeAll(() => {
  console.warn = (...args: unknown[]) => {
    const message = typeof args[0] === "string" ? args[0] : "";
    if (
      message.includes("ReactNative") ||
      message.includes("Animated") ||
      message.includes("NativeModule")
    ) {
      return;
    }
    originalWarn(...args);
  };

  console.error = (...args: unknown[]) => {
    const message = typeof args[0] === "string" ? args[0] : "";
    if (
      message.includes("ReactNative") ||
      message.includes("NativeModule") ||
      message.includes("Warning:")
    ) {
      return;
    }
    originalError(...args);
  };
});

afterAll(() => {
  console.warn = originalWarn;
  console.error = originalError;
});
