/**
 * Google OAuth Configuration
 *
 * Client IDs for Google Sign-In across platforms.
 * Values are loaded from environment variables.
 */

export const GOOGLE_CONFIG = {
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "",
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? "",
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? "",
} as const;
