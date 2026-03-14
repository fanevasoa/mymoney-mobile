/**
 * Add Budget Item Screen
 *
 * Form to add a new expense item to a budget campaign.
 * Supports optional quantity and unit price (auto-calculates amount).
 */

import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";

import { sharedAccountService } from "../../api";
import { useTheme } from "../../contexts/ThemeContext";
import { useToast } from "../../contexts/ToastContext";
import { colors, spacing, borderRadius } from "../../theme";
import { formatCurrency } from "../../utils/helpers";
import type { SharedAccountScreensParamList } from "../../types";

type Props = NativeStackScreenProps<
  SharedAccountScreensParamList,
  "AddBudgetItem"
>;

export default function AddBudgetItemScreen({
  route,
  navigation,
}: Props): React.JSX.Element {
  const { colors: themeColors } = useTheme();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { sharedAccountId, campaignId } = route.params;

  const [name, setName] = useState("");
  const [useQuantity, setUseQuantity] = useState(true);
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Auto-calculate amount from quantity * unitPrice
  useEffect(() => {
    if (useQuantity && quantity && unitPrice) {
      const q = parseFloat(quantity);
      const p = parseFloat(unitPrice);
      if (!isNaN(q) && !isNaN(p) && q > 0 && p > 0) {
        setAmount((q * p).toFixed(2));
      }
    }
  }, [quantity, unitPrice, useQuantity]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError(t("sharedAccount.itemNameRequired"));
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setError(t("sharedAccount.validAmount"));
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const data: any = { name: name.trim() };

      if (useQuantity && quantity && unitPrice) {
        data.quantity = parseFloat(quantity);
        data.unitPrice = parseFloat(unitPrice);
      }
      data.amount = parsedAmount;

      const response = await sharedAccountService.addBudgetItem(
        sharedAccountId,
        campaignId,
        data,
      );

      if (response.success) {
        showToast(t("sharedAccount.itemAdded"));
        navigation.goBack();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("sharedAccount.failedAddItem"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setQuantity("");
    setUnitPrice("");
    setAmount("");
    setError("");
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

        <TextInput
          mode="outlined"
          label={t("sharedAccount.itemNameLabel")}
          placeholder={t("sharedAccount.itemNamePlaceholder")}
          value={name}
          onChangeText={setName}
          style={[styles.input, { backgroundColor: themeColors.surface }]}
          outlineColor={themeColors.border}
          activeOutlineColor={colors.primary}
          textColor={themeColors.textPrimary}
        />

        {/* Quantity toggle */}
        <View
          style={[
            styles.toggleSection,
            { backgroundColor: themeColors.surface },
          ]}
        >
          <View style={styles.toggleRow}>
            <Text
              style={[styles.toggleText, { color: themeColors.textPrimary }]}
            >
              {t("sharedAccount.useQuantity")}
            </Text>
            <Switch
              value={useQuantity}
              onValueChange={setUseQuantity}
              trackColor={{ true: colors.primary }}
            />
          </View>
        </View>

        {useQuantity && (
          <View style={styles.quantityRow}>
            <TextInput
              mode="outlined"
              label={t("sharedAccount.quantity")}
              placeholder="0"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="decimal-pad"
              style={[
                styles.halfInput,
                { backgroundColor: themeColors.surface },
              ]}
              outlineColor={themeColors.border}
              activeOutlineColor={colors.primary}
              textColor={themeColors.textPrimary}
            />
            <Text
              style={[styles.timesSign, { color: themeColors.textSecondary }]}
            >
              ×
            </Text>
            <TextInput
              mode="outlined"
              label={t("sharedAccount.unitPrice")}
              placeholder="0.00"
              value={unitPrice}
              onChangeText={setUnitPrice}
              keyboardType="decimal-pad"
              style={[
                styles.halfInput,
                { backgroundColor: themeColors.surface },
              ]}
              outlineColor={themeColors.border}
              activeOutlineColor={colors.primary}
              textColor={themeColors.textPrimary}
            />
          </View>
        )}

        <TextInput
          mode="outlined"
          label={
            useQuantity
              ? t("sharedAccount.amountAuto")
              : t("sharedAccount.amountRequired")
          }
          placeholder="0.00"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          editable={!useQuantity || !quantity || !unitPrice}
          style={[styles.input, { backgroundColor: themeColors.surface }]}
          outlineColor={themeColors.border}
          activeOutlineColor={colors.primary}
          textColor={themeColors.textPrimary}
        />

        {useQuantity && quantity && unitPrice && (
          <Text style={[styles.calcText, { color: themeColors.textSecondary }]}>
            {quantity} × {formatCurrency(parseFloat(unitPrice) || 0)} ={" "}
            {formatCurrency(parseFloat(amount) || 0)}
          </Text>
        )}

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={isLoading}
          disabled={isLoading}
          style={[styles.submitButton, { backgroundColor: colors.primary }]}
          contentStyle={styles.submitButtonContent}
        >
          {isLoading ? t("sharedAccount.adding") : t("sharedAccount.addItem")}
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
  input: {
    marginBottom: spacing.md,
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
  toggleText: {
    fontSize: 14,
    fontWeight: "500",
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  timesSign: {
    fontSize: 20,
    fontWeight: "600",
  },
  calcText: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: spacing.md,
    marginTop: -spacing.sm,
  },
  submitButton: {
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  submitButtonContent: {
    paddingVertical: spacing.xs,
  },
});
