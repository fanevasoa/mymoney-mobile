/**
 * Shared Account Income Screen
 *
 * Form to add income to a shared account.
 */

import React, { useState } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";

import { sharedAccountService } from "../../api";
import { useTheme } from "../../contexts/ThemeContext";
import { useToast } from "../../contexts/ToastContext";
import { colors, spacing, borderRadius } from "../../theme";
import type { SharedAccountScreensParamList } from "../../types";

type Props = NativeStackScreenProps<
  SharedAccountScreensParamList,
  "SharedAccountIncome"
>;

export default function SharedAccountIncomeScreen({
  route,
  navigation,
}: Props): React.JSX.Element {
  const { colors: themeColors } = useTheme();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { sharedAccountId } = route.params;

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError(t("sharedAccount.validAmount"));
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      const response = await sharedAccountService.addIncome(sharedAccountId, {
        amount: parseFloat(amount),
        description: description.trim() || null,
      });

      if (response.success) {
        showToast(t("sharedAccount.incomeAdded"));
        setTimeout(() => {
          navigation.navigate("SharedAccountDetail", { sharedAccountId });
        }, 300);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("sharedAccount.failedAddIncome"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.content}>
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

        <View
          style={[
            styles.amountCard,
            {
              backgroundColor: themeColors.surface,
              borderColor: colors.earning,
            },
          ]}
        >
          <Text style={[styles.amountLabel, { color: colors.earning }]}>
            {t("sharedAccount.incomeAmount")}
          </Text>
          <View style={styles.amountRow}>
            <Text style={[styles.currencySymbol, { color: colors.earning }]}>
              Ar
            </Text>
            <TextInput
              mode="flat"
              placeholder="0.00"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              style={[styles.amountInput, { color: themeColors.textPrimary }]}
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              textColor={themeColors.textPrimary}
            />
          </View>
        </View>

        <TextInput
          mode="outlined"
          label={t("sharedAccount.descriptionOptional")}
          placeholder={t("sharedAccount.incomeDescPlaceholder")}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          style={[styles.input, { backgroundColor: themeColors.surface }]}
          outlineColor={themeColors.border}
          activeOutlineColor={colors.primary}
          textColor={themeColors.textPrimary}
        />

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={isLoading}
          disabled={isLoading}
          style={[styles.submitButton, { backgroundColor: colors.earning }]}
          contentStyle={styles.submitButtonContent}
        >
          {isLoading ? t("sharedAccount.adding") : t("sharedAccount.addIncome")}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
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
  amountCard: {
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    alignItems: "center",
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  amountLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: spacing.md,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: "800",
    marginRight: spacing.sm,
  },
  amountInput: {
    backgroundColor: "transparent",
    fontSize: 44,
    fontWeight: "bold",
    textAlign: "center",
    minWidth: 150,
  },
  input: {
    marginBottom: spacing.lg,
  },
  submitButton: {
    borderRadius: borderRadius.md,
  },
  submitButtonContent: {
    paddingVertical: spacing.xs,
  },
});
