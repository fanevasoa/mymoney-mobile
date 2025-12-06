/**
 * Account Detail Screen
 *
 * Shows detailed information about a specific account.
 */

import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from "react-native";
import {
  Text,
  Card,
  Button,
  IconButton,
  Menu,
  Divider,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";

import { accountService, transactionService } from "../../api";
import { useApp } from "../../contexts/AppContext";
import { colors, spacing, borderRadius } from "../../theme";
import { formatCurrency, formatDate } from "../../utils/helpers";
import type {
  AccountsStackParamList,
  MainTabParamList,
  Account,
  Transaction,
  TransactionType,
} from "../../types";

type Props = CompositeScreenProps<
  NativeStackScreenProps<AccountsStackParamList, "AccountDetail">,
  BottomTabScreenProps<MainTabParamList>
>;

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

export default function AccountDetailScreen({
  route,
  navigation,
}: Props): JSX.Element {
  const { accountId } = route.params;
  const { removeAccount, updateAccount: updateAccountInState } = useApp();

  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [menuVisible, setMenuVisible] = useState<boolean>(false);

  const loadData = useCallback(async (): Promise<void> => {
    try {
      const [accountRes, transactionsRes] = await Promise.all([
        accountService.getAccountById(accountId),
        transactionService.getTransactions({ accountId, limit: 20 }),
      ]);

      if (accountRes.success) {
        setAccount(accountRes.data.account);
      }
      if (transactionsRes.success) {
        setTransactions(transactionsRes.data.transactions);
      }
    } catch (error) {
      console.error("Error loading account:", error);
      Alert.alert("Error", "Failed to load account details");
    } finally {
      setIsLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async (): Promise<void> => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const handleDelete = (): void => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete this account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await accountService.deleteAccount(accountId);
              removeAccount(accountId);
              navigation.goBack();
            } catch (error) {
              const message =
                error instanceof Error
                  ? error.message
                  : "Failed to delete account";
              Alert.alert("Error", message);
            }
          },
        },
      ]
    );
  };

  const handleToggleActive = async (): Promise<void> => {
    if (!account) return;
    try {
      const response = await accountService.updateAccount(accountId, {
        isActive: !account.isActive,
      });
      if (response.success) {
        setAccount(response.data.account);
        updateAccountInState(response.data.account);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update account";
      Alert.alert("Error", message);
    }
    setMenuVisible(false);
  };

  const getTransactionIcon = (
    type: TransactionType
  ): { name: IconName; color: string } => {
    switch (type) {
      case "earning":
        return { name: "arrow-down-circle", color: colors.earning };
      case "expense":
        return { name: "arrow-up-circle", color: colors.expense };
      case "transfer_fee":
        return { name: "swap-horizontal-circle", color: colors.transfer };
      default:
        return { name: "circle", color: colors.textSecondary };
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

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <IconButton
              icon="dots-vertical"
              iconColor={colors.textInverse}
              onPress={() => setMenuVisible(true)}
            />
          }
        >
          <Menu.Item
            onPress={handleToggleActive}
            title={account?.isActive ? "Mark as Inactive" : "Mark as Active"}
            leadingIcon={account?.isActive ? "eye-off" : "eye"}
          />
          <Divider />
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              handleDelete();
            }}
            title="Delete Account"
            leadingIcon="delete"
            titleStyle={{ color: colors.error }}
          />
        </Menu>
      ),
    });
  }, [navigation, menuVisible, account?.isActive]);

  if (isLoading || !account) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
      }
    >
      {/* Account Header Card */}
      <Card
        style={[
          styles.headerCard,
          { backgroundColor: account.accountType?.color || colors.primary },
        ]}
      >
        <Card.Content style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <MaterialCommunityIcons
              name={getIconName(account.accountType?.icon)}
              size={40}
              color={colors.textInverse}
            />
          </View>
          <Text style={styles.accountName}>{account.name}</Text>
          <Text style={styles.accountType}>{account.accountType?.name}</Text>
          <Text style={styles.balance}>{formatCurrency(account.balance)}</Text>
          {!account.isActive && (
            <View style={styles.inactiveBadge}>
              <Text style={styles.inactiveBadgeText}>Inactive</Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Button
          mode="contained"
          icon="plus"
          onPress={() =>
            navigation.navigate("Add", {
              screen: "AddTransaction",
              params: { accountId: account.id, type: "earning" },
            } as never)
          }
          style={[styles.actionButton, { backgroundColor: colors.earning }]}
        >
          Income
        </Button>
        <Button
          mode="contained"
          icon="minus"
          onPress={() =>
            navigation.navigate("Add", {
              screen: "AddTransaction",
              params: { accountId: account.id, type: "expense" },
            } as never)
          }
          style={[styles.actionButton, { backgroundColor: colors.expense }]}
        >
          Expense
        </Button>
      </View>

      {/* Account Info */}
      {account.description && (
        <Card style={styles.infoCard}>
          <Card.Content>
            <Text style={styles.infoLabel}>Description</Text>
            <Text style={styles.infoValue}>{account.description}</Text>
          </Card.Content>
        </Card>
      )}

      {/* Transactions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        {transactions.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text style={styles.emptyText}>No transactions yet</Text>
            </Card.Content>
          </Card>
        ) : (
          transactions.map((transaction) => {
            const icon = getTransactionIcon(transaction.type);
            return (
              <Card key={transaction.id} style={styles.transactionCard}>
                <Card.Content style={styles.transactionContent}>
                  <View style={styles.transactionLeft}>
                    <MaterialCommunityIcons
                      name={icon.name}
                      size={32}
                      color={icon.color}
                    />
                    <View style={styles.transactionInfo}>
                      <Text
                        style={styles.transactionDescription}
                        numberOfLines={1}
                      >
                        {transaction.description || transaction.type}
                      </Text>
                      <Text style={styles.transactionMeta}>
                        {formatDate(transaction.createdAt)}
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.transactionAmount,
                      {
                        color:
                          transaction.type === "earning"
                            ? colors.earning
                            : colors.expense,
                      },
                    ]}
                  >
                    {transaction.type === "earning" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </Text>
                </Card.Content>
              </Card>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerCard: {
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  headerContent: {
    alignItems: "center",
    paddingVertical: spacing.lg,
  },
  headerIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  accountName: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.textInverse,
    marginTop: spacing.sm,
  },
  accountType: {
    fontSize: 14,
    color: colors.textInverse,
    opacity: 0.8,
    marginTop: spacing.xs,
  },
  balance: {
    fontSize: 36,
    fontWeight: "bold",
    color: colors.textInverse,
    marginTop: spacing.md,
  },
  inactiveBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginTop: spacing.sm,
  },
  inactiveBadgeText: {
    color: colors.textInverse,
    fontSize: 12,
    fontWeight: "500",
  },
  quickActions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  actionButton: {
    flex: 1,
    borderRadius: borderRadius.md,
  },
  infoCard: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  infoValue: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  transactionCard: {
    marginBottom: spacing.sm,
    borderRadius: borderRadius.md,
  },
  transactionContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  transactionInfo: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  transactionMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "600",
  },
  emptyCard: {
    borderRadius: borderRadius.md,
  },
  emptyText: {
    textAlign: "center",
    color: colors.textSecondary,
    paddingVertical: spacing.md,
  },
});
