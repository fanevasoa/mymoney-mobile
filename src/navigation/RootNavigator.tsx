/**
 * Root Navigator
 *
 * Handles authentication state and switches between Auth and Main navigators.
 */

import React from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";

import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import AuthNavigator from "./AuthNavigator";
import MainNavigator from "./MainNavigator";

export default function RootNavigator(): React.JSX.Element {
  const { isLoading, isAuthenticated } = useAuth();
  const { colors } = useTheme();

  if (isLoading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return isAuthenticated ? <MainNavigator /> : <AuthNavigator />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
