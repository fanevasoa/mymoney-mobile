/**
 * Login Screen
 *
 * Entry point for user authentication.
 */

import React, { useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { useTranslation } from "react-i18next";

import { useAuth } from "../../contexts/AuthContext";
import { useGoogleAuth } from "../../hooks";
import { useTheme } from "../../contexts/ThemeContext";
import { colors, spacing, borderRadius } from "../../theme";
import type { AuthStackParamList } from "../../types";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props): React.JSX.Element {
  // State
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const { login } = useAuth();
  const {
    promptGoogleSignIn,
    isLoading: isGoogleLoading,
    isReady: isGoogleReady,
  } = useGoogleAuth();
  const { colors: themeColors } = useTheme();
  const { t } = useTranslation();

  /**
   * Validates the login form inputs
   */
  const validateForm = (): boolean => {
    if (!email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email");
      return false;
    }
    if (!password) {
      setError("Password is required");
      return false;
    }
    return true;
  };

  /**
   * Handles the login form submission
   */
  const handleLogin = async (): Promise<void> => {
    setError("");

    if (!validateForm()) return;

    try {
      setIsLoading(true);
      await login(email.trim().toLowerCase(), password);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Login failed. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={require("../../../assets/icon.png")}
            style={styles.logo}
          />
          <Text style={styles.title}>Money</Text>
          <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
            {t("auth.loginSubtitle")}
          </Text>
        </View>

        {/* Form */}
        <View style={[styles.form, { backgroundColor: themeColors.surface }]}>
          <Text style={[styles.formTitle, { color: themeColors.textPrimary }]}>
            {t("auth.login")}
          </Text>

          {/* Error message */}
          {error ? (
            <View style={styles.errorContainer}>
              <MaterialCommunityIcons
                name="alert-circle"
                size={20}
                color={colors.error}
              />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Email input */}
          <TextInput
            mode="outlined"
            label={t("auth.email")}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            left={<TextInput.Icon icon="email" />}
            style={[styles.input, { backgroundColor: themeColors.surface }]}
            outlineColor={themeColors.border}
            activeOutlineColor={themeColors.primary}
            textColor={themeColors.textPrimary}
          />

          {/* Password input */}
          <TextInput
            mode="outlined"
            label={t("auth.password")}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon
                icon={showPassword ? "eye-off" : "eye"}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
            style={[styles.input, { backgroundColor: themeColors.surface }]}
            outlineColor={themeColors.border}
            activeOutlineColor={themeColors.primary}
            textColor={themeColors.textPrimary}
          />

          {/* Login button */}
          <Button
            mode="contained"
            onPress={handleLogin}
            loading={isLoading}
            disabled={isLoading}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            {isLoading ? t("auth.loggingIn") : t("auth.loginButton")}
          </Button>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t("common.or")}</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google sign-in button */}
          <Button
            mode="outlined"
            onPress={promptGoogleSignIn}
            loading={isGoogleLoading}
            disabled={!isGoogleReady || isGoogleLoading}
            icon="google"
            style={styles.googleButton}
            contentStyle={styles.buttonContent}
          >
            {isGoogleLoading ? t("auth.loggingIn") : "Sign in with Google"}
          </Button>

          {/* Register link */}
          <View style={styles.footer}>
            <Text
              style={[styles.footerText, { color: themeColors.textSecondary }]}
            >
              {t("auth.noAccount")}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={styles.linkText}> {t("auth.signUp")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: spacing.lg,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  logo: {
    width: 64,
    height: 64,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.primary,
    marginTop: spacing.md,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  form: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  errorText: {
    color: colors.error,
    marginLeft: spacing.xs,
    flex: 1,
  },
  input: {
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  button: {
    marginTop: spacing.md,
    borderRadius: borderRadius.md,
  },
  buttonContent: {
    paddingVertical: spacing.xs,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    color: colors.textSecondary,
    marginHorizontal: spacing.sm,
    fontSize: 14,
  },
  googleButton: {
    borderRadius: borderRadius.md,
    borderColor: colors.border,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.lg,
  },
  footerText: {
    color: colors.textSecondary,
  },
  linkText: {
    color: colors.primary,
    fontWeight: "600",
  },
});
