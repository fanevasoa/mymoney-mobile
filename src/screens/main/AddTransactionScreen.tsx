/**
 * Add Transaction Screen
 *
 * Form to create a new transaction (earning or expense).
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
import {
  Text,
  TextInput,
  Button,
  Card,
  SegmentedButtons,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { transactionService } from "../../api";
import { useApp } from "../../contexts/AppContext";
import { colors, spacing, borderRadius } from "../../theme";
import { formatCurrency } from "../../utils/helpers";
import type { AddStackParamList, TransactionType, Account } from "../../types";

type Props = NativeStackScreenProps<AddStackParamList, "AddTransaction">;

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

const EXPENSE_CATEGORIES = [
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Bills & Utilities",
  "Healthcare",
  "Education",
  "Other",
];

const INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Investment",
  "Gift",
  "Refund",
  "Other",
];

export default function AddTransactionScreen({
  route,
  navigation,
}: Props): React.JSX.Element {
  const { accounts, fetchAccounts, refreshData } = useApp();

  const initialType = route.params?.type || "expense";
  const preselectedAccountId = route.params?.accountId;

  const [type, setType] = useState<TransactionType>(
    initialType as TransactionType
  );
  const [amount, setAmount] = useState<string>("");
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    preselectedAccountId || null
  );
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  useEffect(() => {
    if (accounts.length > 0 && !selectedAccountId) {
      setSelectedAccountId(accounts[0].id);
    }
  }, [accounts, selectedAccountId]);

  useEffect(() => {
    navigation.setOptions({
      title: type === "earning" ? "Add Income" : "Add Expense",
    });
  }, [type, navigation]);

  const categories =
    type === "earning" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const selectedAccount = accounts.find((acc) => acc.id === selectedAccountId);

  const validateForm = (): boolean => {
    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return false;
    }
    if (!selectedAccountId) {
      setError("Please select an account");
      return false;
    }
    if (type === "expense" && selectedAccount) {
      if (parseFloat(amount) > parseFloat(String(selectedAccount.balance))) {
        setError(
          `Insufficient balance. Available: ${formatCurrency(
            selectedAccount.balance
          )}`
        );
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (): Promise<void> => {
    setError("");

    if (!validateForm()) return;

    try {
      setIsLoading(true);

      const transactionData = {
        type,
        amount: parseFloat(amount),
        accountId: selectedAccountId!,
        description: description.trim() || null,
        category: category || null,
      };

      const response = await transactionService.createTransaction(
        transactionData
      );

      if (response.success) {
        await refreshData();
        Alert.alert(
          "Success",
          `${type === "earning" ? "Income" : "Expense"} added successfully`,
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create transaction";
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

        <SegmentedButtons
          value={type}
          onValueChange={(value) => setType(value as TransactionType)}
          buttons={[
            {
              value: "earning",
              label: "Income",
              icon: "arrow-down",
              checkedColor: colors.earning,
            },
            {
              value: "expense",
              label: "Expense",
              icon: "arrow-up",
              checkedColor: colors.expense,
            },
          ]}
          style={styles.segmentedButtons}
        />

        <Card
          style={[
            styles.amountCard,
            {
              borderColor: type === "earning" ? colors.earning : colors.expense,
            },
          ]}
        >
          <Card.Content style={styles.amountContent}>
            <Text style={styles.amountLabel}>
              {type === "earning" ? "Income Amount" : "Expense Amount"}
            </Text>
            <View style={styles.amountInputContainer}>
              <Text
                style={[
                  styles.currencySymbol,
                  {
                    color: type === "earning" ? colors.earning : colors.expense,
                  },
                ]}
              >
                Ar
              </Text>
              <TextInput
                mode="flat"
                placeholder="0.00"
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                style={styles.amountInput}
                underlineColor="transparent"
                activeUnderlineColor="transparent"
              />
            </View>
          </Card.Content>
        </Card>

        <Text style={styles.sectionTitle}>Select Account</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.accountsScroll}
        >
          {accounts.map((account) => (
            <TouchableOpacity
              key={account.id}
              onPress={() => setSelectedAccountId(account.id)}
            >
              <Card
                style={[
                  styles.accountCard,
                  selectedAccountId === account.id &&
                    styles.accountCardSelected,
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

        <Text style={styles.sectionTitle}>Category (optional)</Text>
        <View style={styles.categoriesGrid}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setCategory(category === cat ? "" : cat)}
            >
              <Card
                style={[
                  styles.categoryCard,
                  category === cat && styles.categoryCardSelected,
                ]}
              >
                <Card.Content style={styles.categoryContent}>
                  <Text
                    style={[
                      styles.categoryText,
                      category === cat && styles.categoryTextSelected,
                    ]}
                  >
                    {cat}
                  </Text>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Description (optional)</Text>
        <TextInput
          mode="outlined"
          placeholder="Add a note..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          style={styles.descriptionInput}
          outlineColor={colors.border}
          activeOutlineColor={colors.primary}
        />

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={isLoading}
          disabled={isLoading}
          style={[
            styles.submitButton,
            {
              backgroundColor:
                type === "earning" ? colors.earning : colors.expense,
            },
          ]}
          contentStyle={styles.submitButtonContent}
        >
          {isLoading
            ? "Adding..."
            : `Add ${type === "earning" ? "Income" : "Expense"}`}
        </Button>

        <TouchableOpacity
          style={styles.transferLink}
          onPress={() => navigation.navigate("Transfer")}
        >
          <MaterialCommunityIcons
            name="swap-horizontal"
            size={20}
            color={colors.primary}
          />
          <Text style={styles.transferLinkText}>Transfer between accounts</Text>
        </TouchableOpacity>
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
  segmentedButtons: {
    marginBottom: spacing.md,
  },
  amountCard: {
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
  },
  amountContent: {
    alignItems: "center",
    paddingVertical: spacing.lg,
  },
  amountLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  currencySymbol: {
    fontSize: 36,
    fontWeight: "bold",
    marginRight: spacing.xs,
  },
  amountInput: {
    backgroundColor: "transparent",
    fontSize: 48,
    fontWeight: "bold",
    textAlign: "center",
    minWidth: 150,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  accountsScroll: {
    marginBottom: spacing.lg,
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
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  categoryCard: {
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryCardSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryContent: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  categoryText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  categoryTextSelected: {
    color: colors.textInverse,
    fontWeight: "500",
  },
  descriptionInput: {
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
  },
  submitButton: {
    borderRadius: borderRadius.md,
  },
  submitButtonContent: {
    paddingVertical: spacing.xs,
  },
  transferLink: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.lg,
    padding: spacing.sm,
  },
  transferLinkText: {
    color: colors.primary,
    marginLeft: spacing.xs,
    fontWeight: "500",
  },
});
