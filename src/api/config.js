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

export const API_URL = "http://10.0.2.2:3000/api";

// Timeout for API requests (in milliseconds)
export const API_TIMEOUT = 30000;

// Retry configuration
export const RETRY_CONFIG = {
  retries: 3,
  retryDelay: 1000,
};

export default {
  API_URL,
  API_TIMEOUT,
  RETRY_CONFIG,
};
