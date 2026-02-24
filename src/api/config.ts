/**
 * API Configuration
 *
 * Configures the base URL and other API-related settings.
 * Change API_URL to match your backend server address.
 */

// For local development:
// - iOS Simulator: use 'localhost'
// - Android Emulator: use '10.0.2.2' (Android's localhost alias)
// - Physical device: use your computer's local IP address
//
// Set EXPO_PUBLIC_API_URL in .env to override the default.

import { Platform } from "react-native";

const DEFAULT_API_URL = Platform.select({
  android: "http://10.0.2.2:3000/api",
  default: "http://localhost:3000/api",
});

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL;

// Timeout for API requests (in milliseconds)
export const API_TIMEOUT = 30000;

// Retry configuration
export interface RetryConfig {
  retries: number;
  retryDelay: number;
}

export const RETRY_CONFIG: RetryConfig = {
  retries: 3,
  retryDelay: 1000,
};

const config = {
  API_URL,
  API_TIMEOUT,
  RETRY_CONFIG,
} as const;

export default config;
