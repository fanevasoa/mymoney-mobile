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
  Switch,
} from "react-native";
import { Text, TextInput, Button, Card, RadioButton } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { accountService } from "../../api";
import { useTranslation } from "react-i18next";

import { useApp } from "../../contexts/AppContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useToast } from "../../contexts/ToastContext";
import { colors, spacing, borderRadius } from "../../theme";
import type { AccountsStackParamList, AccountType } from "../../types";

type Props = NativeStackScreenProps<AccountsStackParamList, "AddAccount">;

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

export default function AddAccountScreen({
  navigation,
}: Props): React.JSX.Element {
  const { accountTypes, fetchAccountTypes, addAccount } = useApp();
  const { colors: themeColors } = useTheme();
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [name, setName] = useState<string>("");
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isSharedAccount, setIsSharedAccount] = useState<boolean>(false);
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
        isSharedAccount,
      };

      const response = await accountService.createAccount(accountData);

      if (response.success) {
        addAccount(response.data.account);
        showToast(t("addAccount.accountCreated"));
        setTimeout(() => navigation.goBack(), 300);
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
      style={[styles.container, { backgroundColor: themeColors.background }]}
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

        <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
          {t("addAccount.accountType")}
        </Text>
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

        <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
          {t("addAccount.accountDetails")}
        </Text>
        <TextInput
          mode="outlined"
          label={t("addAccount.accountName")}
          placeholder={t("addAccount.accountNamePlaceholder")}
          value={name}
          onChangeText={setName}
          style={[styles.input, { backgroundColor: themeColors.surface }]}
          outlineColor={themeColors.border}
          activeOutlineColor={themeColors.primary}
          textColor={themeColors.textPrimary}
        />

        <TextInput
          mode="outlined"
          label={t("addAccount.initialBalance")}
          placeholder="0.00"
          value={balance}
          onChangeText={setBalance}
          keyboardType="decimal-pad"
          left={<TextInput.Affix text="Ar" />}
          style={[styles.input, { backgroundColor: themeColors.surface }]}
          outlineColor={themeColors.border}
          activeOutlineColor={themeColors.primary}
          textColor={themeColors.textPrimary}
        />

        <TextInput
          mode="outlined"
          label={t("addAccount.descriptionOptional")}
          placeholder={t("addAccount.descriptionPlaceholder")}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          style={[styles.input, { backgroundColor: themeColors.surface }]}
          outlineColor={themeColors.border}
          activeOutlineColor={themeColors.primary}
          textColor={themeColors.textPrimary}
        />

        <View
          style={[
            styles.toggleSection,
            { backgroundColor: themeColors.surface },
          ]}
        >
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <MaterialCommunityIcons
                name="account-group"
                size={22}
                color={
                  isSharedAccount ? colors.primary : themeColors.textSecondary
                }
              />
              <View style={styles.toggleText}>
                <Text
                  style={[
                    styles.toggleTitle,
                    { color: themeColors.textPrimary },
                  ]}
                >
                  Shared Account
                </Text>
                <Text
                  style={[
                    styles.toggleDesc,
                    { color: themeColors.textSecondary },
                  ]}
                >
                  Share this account with other users
                </Text>
              </View>
            </View>
            <Switch
              value={isSharedAccount}
              onValueChange={setIsSharedAccount}
              trackColor={{ true: colors.primary }}
            />
          </View>
        </View>

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={isLoading}
          disabled={isLoading}
          style={styles.submitButton}
          contentStyle={styles.submitButtonContent}
        >
          {isLoading ? t("addAccount.creating") : t("addAccount.createAccount")}
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
  toggleSection: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toggleInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  toggleText: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  toggleDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  submitButton: {
    marginTop: spacing.md,
    borderRadius: borderRadius.md,
  },
  submitButtonContent: {
    paddingVertical: spacing.xs,
  },
});
