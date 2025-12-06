/**
 * Add Account Screen
 *
 * Form to create a new financial account.
 */

import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Text, TextInput, Button, Card, RadioButton } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { accountService } from "../../api";
import { useApp } from "../../contexts/AppContext";
import { colors, spacing, borderRadius } from "../../theme";
import type { AccountsStackParamList, AccountType } from "../../types";

type Props = NativeStackScreenProps<AccountsStackParamList, "AddAccount">;

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

export default function AddAccountScreen({ navigation }: Props): JSX.Element {
  const { accountTypes, fetchAccountTypes, addAccount } = useApp();

  const [name, setName] = useState<string>("");
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchAccountTypes();
  }, [fetchAccountTypes]);

  useEffect(() => {
    if (accountTypes.length > 0 && !selectedTypeId) {
      setSelectedTypeId(accountTypes[0].id);
    }
  }, [accountTypes, selectedTypeId]);

  const validateForm = (): boolean => {
    if (!name.trim()) {
      setError("Account name is required");
      return false;
    }
    if (name.trim().length < 2) {
      setError("Account name must be at least 2 characters");
      return false;
    }
    if (!selectedTypeId) {
      setError("Please select an account type");
      return false;
    }
    if (balance && isNaN(parseFloat(balance))) {
      setError("Initial balance must be a valid number");
      return false;
    }
    if (balance && parseFloat(balance) < 0) {
      setError("Initial balance cannot be negative");
      return false;
    }
    return true;
  };

  const handleSubmit = async (): Promise<void> => {
    setError("");

    if (!validateForm()) return;

    try {
      setIsLoading(true);

      const accountData = {
        name: name.trim(),
        accountTypeId: selectedTypeId!,
        balance: balance ? parseFloat(balance) : 0,
        description: description.trim() || null,
      };

      const response = await accountService.createAccount(accountData);

      if (response.success) {
        addAccount(response.data.account);
        Alert.alert("Success", "Account created successfully", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create account";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const getIconName = (icon: string | undefined): IconName => {
    switch (icon) {
      case "bank":
        return "bank";
      case "phone":
        return "cellphone";
      case "cash":
        return "cash";
      default:
        return "wallet";
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

        <Text style={styles.sectionTitle}>Account Type</Text>
        <View style={styles.typeGrid}>
          {accountTypes.map((type) => (
            <Card
              key={type.id}
              style={[
                styles.typeCard,
                selectedTypeId === type.id && styles.typeCardSelected,
                {
                  borderColor:
                    selectedTypeId === type.id ? type.color : colors.border,
                },
              ]}
              onPress={() => setSelectedTypeId(type.id)}
            >
              <Card.Content style={styles.typeContent}>
                <View
                  style={[
                    styles.typeIcon,
                    { backgroundColor: type.color + "20" },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={getIconName(type.icon)}
                    size={32}
                    color={type.color}
                  />
                </View>
                <Text
                  style={[
                    styles.typeName,
                    selectedTypeId === type.id && { color: type.color },
                  ]}
                >
                  {type.name}
                </Text>
                <RadioButton
                  value={type.id}
                  status={selectedTypeId === type.id ? "checked" : "unchecked"}
                  onPress={() => setSelectedTypeId(type.id)}
                  color={type.color}
                />
              </Card.Content>
            </Card>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Account Details</Text>
        <TextInput
          mode="outlined"
          label="Account Name"
          placeholder="e.g., Main Savings Account"
          value={name}
          onChangeText={setName}
          style={styles.input}
          outlineColor={colors.border}
          activeOutlineColor={colors.primary}
        />

        <TextInput
          mode="outlined"
          label="Initial Balance (optional)"
          placeholder="0.00"
          value={balance}
          onChangeText={setBalance}
          keyboardType="decimal-pad"
          left={<TextInput.Affix text="$" />}
          style={styles.input}
          outlineColor={colors.border}
          activeOutlineColor={colors.primary}
        />

        <TextInput
          mode="outlined"
          label="Description (optional)"
          placeholder="Add a note about this account"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          style={styles.input}
          outlineColor={colors.border}
          activeOutlineColor={colors.primary}
        />

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={isLoading}
          disabled={isLoading}
          style={styles.submitButton}
          contentStyle={styles.submitButtonContent}
        >
          {isLoading ? "Creating..." : "Create Account"}
        </Button>
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
    padding: spacing.md,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  typeCard: {
    flex: 1,
    minWidth: "30%",
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
  },
  typeCardSelected: {
    borderWidth: 2,
  },
  typeContent: {
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  typeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  typeName: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  input: {
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  submitButton: {
    marginTop: spacing.md,
    borderRadius: borderRadius.md,
  },
  submitButtonContent: {
    paddingVertical: spacing.xs,
  },
});
