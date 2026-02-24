/**
 * API Config Tests
 */

jest.mock("react-native", () => ({
  Platform: {
    OS: "ios",
    select: (obj: Record<string, unknown>) => obj.default ?? obj.ios,
  },
}));

describe("API Config", () => {
  beforeEach(() => {
    jest.resetModules();
    delete process.env.EXPO_PUBLIC_API_URL;
  });

  it("should have a default API_URL", () => {
    const { API_URL } = require("../../src/api/config");
    expect(API_URL).toBeDefined();
    expect(typeof API_URL).toBe("string");
    expect(API_URL).toContain("/api");
  });

  it("should default to localhost for iOS/default", () => {
    const { API_URL } = require("../../src/api/config");
    expect(API_URL).toBe("http://localhost:3000/api");
  });

  it("should use EXPO_PUBLIC_API_URL env var when set", () => {
    process.env.EXPO_PUBLIC_API_URL = "https://custom-api.example.com/api";
    const { API_URL } = require("../../src/api/config");
    expect(API_URL).toBe("https://custom-api.example.com/api");
  });

  it("should have API_TIMEOUT set to 30000ms", () => {
    const { API_TIMEOUT } = require("../../src/api/config");
    expect(API_TIMEOUT).toBe(30000);
  });

  it("should have RETRY_CONFIG with retries and retryDelay", () => {
    const { RETRY_CONFIG } = require("../../src/api/config");
    expect(RETRY_CONFIG).toEqual({
      retries: 3,
      retryDelay: 1000,
    });
  });
});
