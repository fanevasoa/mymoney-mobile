/**
 * Transfer Screen
 *
 * Form to transfer money between accounts.
 */

import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from "react-native";
import { Text, TextInput, Button, Card, Divider } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { transferService } from "../../api";
import { useApp } from "../../contexts/AppContext";
import { colors, spacing, borderRadius } from "../../theme";
import { formatCurrency } from "../../utils/helpers";
import type { AddStackParamList, Account } from "../../types";

type Props = NativeStackScreenProps<AddStackParamList, "Transfer">;

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

export default function TransferScreen({ navigation }: Props): JSX.Element {
  const { accounts, fetchAccounts, refreshData } = useApp();

  const [fromAccountId, setFromAccountId] = useState<string | null>(null);
  const [toAccountId, setToAccountId] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [fee, setFee] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  useEffect(() => {
    if (accounts.length >= 2) {
      if (!fromAccountId) setFromAccountId(accounts[0].id);
      if (!toAccountId) setToAccountId(accounts[1].id);
    } else if (accounts.length === 1) {
      if (!fromAccountId) setFromAccountId(accounts[0].id);
    }
  }, [accounts, fromAccountId, toAccountId]);

  const getAccount = (id: string | null): Account | undefined =>
    accounts.find((acc) => acc.id === id);

  const handleSwapAccounts = (): void => {
    const temp = fromAccountId;
    setFromAccountId(toAccountId);
    setToAccountId(temp);
  };

  const totalDeduction = (parseFloat(amount) || 0) + (parseFloat(fee) || 0);

  const validateForm = (): boolean => {
    if (!fromAccountId) {
      setError("Please select a source account");
      return false;
    }
    if (!toAccountId) {
      setError("Please select a destination account");
      return false;
    }
    if (fromAccountId === toAccountId) {
      setError("Source and destination accounts must be different");
      return false;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid transfer amount");
      return false;
    }
    if (fee && parseFloat(fee) < 0) {
      setError("Fee cannot be negative");
      return false;
    }

    const fromAccount = getAccount(fromAccountId);
    if (
      fromAccount &&
      totalDeduction > parseFloat(String(fromAccount.balance))
    ) {
      setError(
        `Insufficient balance. Available: ${formatCurrency(
          fromAccount.balance
        )}`
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (): Promise<void> => {
    setError("");

    if (!validateForm()) return;

    try {
      setIsLoading(true);

      const transferData = {
        fromAccountId: fromAccountId!,
        toAccountId: toAccountId!,
        amount: parseFloat(amount),
        fee: fee ? parseFloat(fee) : 0,
        description: description.trim() || null,
      };

      const response = await transferService.createTransfer(transferData);

      if (response.success) {
        await refreshData();
        Alert.alert("Success", "Transfer completed successfully", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to complete transfer";
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

  const renderAccountSelector = (
    title: string,
    selectedId: string | null,
    onSelect: (id: string) => void,
    excludeId: string | null
  ): JSX.Element => (
    <View style={styles.accountSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {accounts
          .filter((acc) => acc.id !== excludeId)
          .map((account) => (
            <TouchableOpacity
              key={account.id}
              onPress={() => onSelect(account.id)}
            >
              <Card
                style={[
                  styles.accountCard,
                  selectedId === account.id && styles.accountCardSelected,
                ]}
              >
                <Card.Content style={styles.accountContent}>
                  <View
                    style={[
                      styles.accountIcon,
                      {
                        backgroundColor:
                          (account.accountType?.color || colors.primary) + "20",
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={getIconName(account.accountType?.icon)}
                      size={20}
                      color={account.accountType?.color || colors.primary}
                    />
                  </View>
                  <Text style={styles.accountName} numberOfLines={1}>
                    {account.name}
                  </Text>
                  <Text style={styles.accountBalance}>
                    {formatCurrency(account.balance)}
                  </Text>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))}
      </ScrollView>
    </View>
  );

  if (accounts.length < 2) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons
          name="swap-horizontal"
          size={64}
          color={colors.textSecondary}
        />
        <Text style={styles.emptyTitle}>Not enough accounts</Text>
        <Text style={styles.emptyText}>
          You need at least 2 accounts to make a transfer
        </Text>
        <Button
          mode="contained"
          onPress={() => navigation.goBack()}
          style={styles.emptyButton}
        >
          Go Back
        </Button>
      </View>
    );
  }

  const fromAccount = getAccount(fromAccountId);
  const toAccount = getAccount(toAccountId);

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

        {renderAccountSelector(
          "From Account",
          fromAccountId,
          setFromAccountId,
          toAccountId
        )}

        <View style={styles.swapContainer}>
          <TouchableOpacity
            style={styles.swapButton}
            onPress={handleSwapAccounts}
          >
            <MaterialCommunityIcons
              name="swap-vertical"
              size={24}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>

        {renderAccountSelector(
          "To Account",
          toAccountId,
          setToAccountId,
          fromAccountId
        )}

        <Divider style={styles.divider} />

        <Text style={styles.sectionTitle}>Transfer Amount</Text>
        <TextInput
          mode="outlined"
          placeholder="0.00"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          left={<TextInput.Affix text="$" />}
          style={styles.input}
          outlineColor={colors.border}
          activeOutlineColor={colors.primary}
        />

        <Text style={styles.sectionTitle}>Transfer Fee (optional)</Text>
        <TextInput
          mode="outlined"
          placeholder="0.00"
          value={fee}
          onChangeText={setFee}
          keyboardType="decimal-pad"
          left={<TextInput.Affix text="$" />}
          style={styles.input}
          outlineColor={colors.border}
          activeOutlineColor={colors.primary}
        />

        <Text style={styles.sectionTitle}>Description (optional)</Text>
        <TextInput
          mode="outlined"
          placeholder="Add a note..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={2}
          style={styles.input}
          outlineColor={colors.border}
          activeOutlineColor={colors.primary}
        />

        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text style={styles.summaryTitle}>Transfer Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>From:</Text>
              <Text style={styles.summaryValue}>
                {fromAccount?.name || "-"}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>To:</Text>
              <Text style={styles.summaryValue}>{toAccount?.name || "-"}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Amount:</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(parseFloat(amount) || 0)}
              </Text>
            </View>
            {parseFloat(fee) > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Fee:</Text>
                <Text style={styles.summaryValue}>
                  {formatCurrency(parseFloat(fee))}
                </Text>
              </View>
            )}
            <Divider style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTotalLabel}>Total Deduction:</Text>
              <Text style={styles.summaryTotalValue}>
                {formatCurrency(totalDeduction)}
              </Text>
            </View>
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={isLoading}
          disabled={isLoading}
          style={styles.submitButton}
          contentStyle={styles.submitButtonContent}
          icon="swap-horizontal"
        >
          {isLoading ? "Processing..." : "Transfer Money"}
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  emptyButton: {
    borderRadius: borderRadius.md,
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
  accountSection: {
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  accountCard: {
    width: 140,
    marginRight: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: "transparent",
  },
  accountCardSelected: {
    borderColor: colors.primary,
  },
  accountContent: {
    alignItems: "center",
    padding: spacing.sm,
  },
  accountIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  accountName: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.textPrimary,
    textAlign: "center",
  },
  accountBalance: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
    marginTop: 2,
  },
  swapContainer: {
    alignItems: "center",
    marginVertical: spacing.xs,
  },
  swapButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceVariant,
    justifyContent: "center",
    alignItems: "center",
  },
  divider: {
    marginVertical: spacing.md,
  },
  input: {
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  summaryCard: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceVariant,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: "500",
  },
  summaryDivider: {
    marginVertical: spacing.sm,
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  summaryTotalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.primary,
  },
  submitButton: {
    borderRadius: borderRadius.md,
    backgroundColor: colors.transfer,
  },
  submitButtonContent: {
    paddingVertical: spacing.xs,
  },
});
