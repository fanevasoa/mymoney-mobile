/**
 * Login Screen
 *
 * Entry point for user authentication. Provides a form for users to enter
 * their email and password credentials to access the application.
 *
 * Features:
 * - Email and password input fields with validation
 * - Password visibility toggle
 * - Loading state during authentication
 * - Error display for failed login attempts
 * - Navigation to registration screen
 *
 * @module screens/auth/LoginScreen
 * @requires react
 * @requires react-native
 * @requires react-native-paper
 * @requires @expo/vector-icons
 * @requires ../../contexts/AuthContext
 * @requires ../../theme
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
import { Text, TextInput, Button, HelperText } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useAuth } from "../../contexts/AuthContext";
import { colors, spacing, borderRadius } from "../../theme";

/**
 * LoginScreen Component
 *
 * Renders the login form and handles user authentication.
 * Upon successful login, user is automatically redirected to the main app
 * via the AuthContext state change.
 *
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.navigation - React Navigation navigation object
 * @returns {JSX.Element} The login screen UI
 *
 * @example
 * // Used in AuthNavigator
 * <Stack.Screen name="Login" component={LoginScreen} />
 */
export default function LoginScreen({ navigation }) {
  // ============================================
  // STATE MANAGEMENT
  // ============================================

  /** @type {[string, Function]} Email input state */
  const [email, setEmail] = useState("");

  /** @type {[string, Function]} Password input state */
  const [password, setPassword] = useState("");

  /** @type {[boolean, Function]} Password visibility toggle state */
  const [showPassword, setShowPassword] = useState(false);

  /** @type {[boolean, Function]} Loading indicator state */
  const [isLoading, setIsLoading] = useState(false);

  /** @type {[string, Function]} Error message state */
  const [error, setError] = useState("");

  // Get login function from AuthContext
  const { login } = useAuth();

  // ============================================
  // FORM HANDLERS
  // ============================================

  /**
   * Validates the login form inputs
   *
   * Checks that:
   * - Email is not empty
   * - Email contains @ symbol
   * - Password is not empty
   *
   * @function validateForm
   * @returns {boolean} True if form is valid, false otherwise
   */
  const validateForm = () => {
    if (!email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!email.includes("@")) {
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
   *
   * Validates inputs, calls the authentication API, and handles
   * success/error states. On successful login, the AuthContext
   * updates and triggers navigation to the main app.
   *
   * @async
   * @function handleLogin
   * @returns {Promise<void>}
   */
  const handleLogin = async () => {
    setError("");

    if (!validateForm()) return;

    try {
      setIsLoading(true);
      await login(email.trim().toLowerCase(), password);
      // Navigation will happen automatically via AuthContext
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
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
            style={{
              width: 64,
              height: 64,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.5,
              shadowRadius: 8,
              elevation: 8,
            }}
          />
          <Text style={styles.title}>Money</Text>
          <Text style={styles.subtitle}>Manage your finances with ease</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.formTitle}>Welcome Back</Text>

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
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            left={<TextInput.Icon icon="email" />}
            style={styles.input}
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
          />

          {/* Password input */}
          <TextInput
            mode="outlined"
            label="Password"
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
            style={styles.input}
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
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
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>

          {/* Register link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={styles.linkText}> Sign Up</Text>
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
