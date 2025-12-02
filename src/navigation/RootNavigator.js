/**
 * Root Navigator
 *
 * Main navigation structure that handles:
 * - Authentication flow (login/register screens)
 * - Main app flow (bottom tabs with screens)
 * - Loading state while checking auth
 */

import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { useAuth } from "../contexts/AuthContext";
import { colors } from "../theme";

// Navigators
import AuthNavigator from "./AuthNavigator";
import MainNavigator from "./MainNavigator";

const Stack = createNativeStackNavigator();

/**
 * Root Navigator Component
 * Conditionally renders Auth or Main navigator based on auth state
 */
export default function RootNavigator() {
  const { isLoading, isAuthenticated } = useAuth();

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        // User is signed in - show main app
        <Stack.Screen name="Main" component={MainNavigator} />
      ) : (
        // User is not signed in - show auth screens
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
});
