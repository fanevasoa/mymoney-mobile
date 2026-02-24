/**
 * Google Authentication Hook
 *
 * Handles the Google OAuth flow using expo-auth-session.
 * Returns a function to trigger the sign-in prompt and loading state.
 */

import { useEffect, useState, useCallback } from "react";
import { Alert } from "react-native";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";

import { useAuth } from "../contexts/AuthContext";
import { GOOGLE_CONFIG } from "../config/google";

WebBrowser.maybeCompleteAuthSession();

interface UseGoogleAuthResult {
  promptGoogleSignIn: () => void;
  isLoading: boolean;
  isReady: boolean;
}

export default function useGoogleAuth(): UseGoogleAuthResult {
  const { loginWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: GOOGLE_CONFIG.webClientId,
    iosClientId: GOOGLE_CONFIG.iosClientId,
    androidClientId: GOOGLE_CONFIG.androidClientId,
  });

  useEffect(() => {
    if (!response) return;

    if (response.type === "success") {
      const { id_token } = response.params;

      if (id_token) {
        setIsLoading(true);
        loginWithGoogle(id_token)
          .catch((error: unknown) => {
            const message =
              error instanceof Error
                ? error.message
                : "Google sign-in failed. Please try again.";
            Alert.alert("Sign In Failed", message);
          })
          .finally(() => {
            setIsLoading(false);
          });
      }
    } else if (response.type === "error") {
      Alert.alert(
        "Sign In Error",
        response.error?.message ?? "An error occurred during Google sign-in."
      );
    }
  }, [response, loginWithGoogle]);

  const promptGoogleSignIn = useCallback((): void => {
    if (request) {
      promptAsync();
    }
  }, [request, promptAsync]);

  return {
    promptGoogleSignIn,
    isLoading,
    isReady: !!request,
  };
}
