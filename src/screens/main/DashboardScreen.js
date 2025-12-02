/**
 * Dashboard Screen
 *
 * Main home screen showing:
 * - Total balance
 * - Balance by account type
 * - Account list
 * - Recent transactions
 * - Quick action buttons
 */

import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { Text, Card, FAB } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

import { useAuth } from "../../contexts/AuthContext";
import { useApp } from "../../contexts/AppContext";
import { dashboardService } from "../../api";
import { colors, spacing, borderRadius } from "../../theme";

// Helper to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount || 0);
};

// Helper to format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();
  const { fetchAccountTypes, fetchAccounts, fetchDashboard, dashboardData } =
    useApp();

  const [recentTransactions, setRecentTransactions] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Load dashboard data
   */
  const loadData = useCallback(async () => {
    try {
      await Promise.all([
        fetchAccountTypes(),
        fetchAccounts(),
        fetchDashboard(),
      ]);

      // Fetch recent transactions
      const response = await dashboardService.getRecentTransactions(5);
      if (response.success) {
        setRecentTransactions(response.data.transactions);
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchAccountTypes, fetchAccounts, fetchDashboard]);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Refresh data when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  /**
   * Handle pull-to-refresh
   */
  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  /**
   * Get icon for transaction type
   */
  const getTransactionIcon = (type) => {
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

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        {/* Welcome Header */}
        <View style={styles.welcomeHeader}>
          <Text style={styles.welcomeText}>
            Welcome back, {user?.name?.split(" ")[0] || "User"}!
          </Text>
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </View>

        {/* Total Balance Card */}
        <Card style={styles.balanceCard}>
          <Card.Content>
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <Text style={styles.balanceAmount}>
              {formatCurrency(dashboardData?.totalBalance)}
            </Text>
            <View style={styles.todayStats}>
              <View style={styles.todayStat}>
                <MaterialCommunityIcons
                  name="arrow-down-circle"
                  size={20}
                  color={colors.earning}
                />
                <Text style={styles.todayStatLabel}>Today</Text>
                <Text
                  style={[styles.todayStatAmount, { color: colors.earning }]}
                >
                  +{formatCurrency(dashboardData?.today?.earnings)}
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.todayStat}>
                <MaterialCommunityIcons
                  name="arrow-up-circle"
                  size={20}
                  color={colors.expense}
                />
                <Text style={styles.todayStatLabel}>Today</Text>
                <Text
                  style={[styles.todayStatAmount, { color: colors.expense }]}
                >
                  -{formatCurrency(dashboardData?.today?.expenses)}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() =>
              navigation.navigate("Add", {
                screen: "AddTransaction",
                params: { type: "earning" },
              })
            }
          >
            <View
              style={[
                styles.quickActionIcon,
                { backgroundColor: colors.earning + "20" },
              ]}
            >
              <MaterialCommunityIcons
                name="plus"
                size={24}
                color={colors.earning}
              />
            </View>
            <Text style={styles.quickActionText}>Income</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() =>
              navigation.navigate("Add", {
                screen: "AddTransaction",
                params: { type: "expense" },
              })
            }
          >
            <View
              style={[
                styles.quickActionIcon,
                { backgroundColor: colors.expense + "20" },
              ]}
            >
              <MaterialCommunityIcons
                name="minus"
                size={24}
                color={colors.expense}
              />
            </View>
            <Text style={styles.quickActionText}>Expense</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate("Add", { screen: "Transfer" })}
          >
            <View
              style={[
                styles.quickActionIcon,
                { backgroundColor: colors.transfer + "20" },
              ]}
            >
              <MaterialCommunityIcons
                name="swap-horizontal"
                size={24}
                color={colors.transfer}
              />
            </View>
            <Text style={styles.quickActionText}>Transfer</Text>
          </TouchableOpacity>
        </View>

        {/* Account Types Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>By Account Type</Text>
          <View style={styles.accountTypesGrid}>
            {dashboardData?.accountTypesSummary?.map((type) => (
              <Card key={type.id} style={styles.accountTypeCard}>
                <Card.Content style={styles.accountTypeContent}>
                  <View
                    style={[
                      styles.accountTypeIcon,
                      { backgroundColor: type.color + "20" },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={
                        type.icon === "bank"
                          ? "bank"
                          : type.icon === "phone"
                          ? "cellphone"
                          : "cash"
                      }
                      size={24}
                      color={type.color}
                    />
                  </View>
                  <Text style={styles.accountTypeName}>{type.name}</Text>
                  <Text style={styles.accountTypeBalance}>
                    {formatCurrency(type.balance)}
                  </Text>
                  <Text style={styles.accountTypeCount}>
                    {type.accountCount} account
                    {type.accountCount !== 1 ? "s" : ""}
                  </Text>
                </Card.Content>
              </Card>
            ))}
          </View>
        </View>

        {/* Accounts List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Accounts</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Accounts")}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {dashboardData?.accountsSummary?.slice(0, 3).map((account) => (
            <TouchableOpacity
              key={account.id}
              onPress={() =>
                navigation.navigate("AccountDetail", { accountId: account.id })
              }
            >
              <Card style={styles.accountCard}>
                <Card.Content style={styles.accountCardContent}>
                  <View style={styles.accountInfo}>
                    <View
                      style={[
                        styles.accountIcon,
                        { backgroundColor: account.accountType?.color + "20" },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={
                          account.accountType?.icon === "bank"
                            ? "bank"
                            : account.accountType?.icon === "phone"
                            ? "cellphone"
                            : "cash"
                        }
                        size={20}
                        color={account.accountType?.color}
                      />
                    </View>
                    <View>
                      <Text style={styles.accountName}>{account.name}</Text>
                      <Text style={styles.accountType}>
                        {account.accountType?.name}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.accountBalance}>
                    {formatCurrency(account.balance)}
                  </Text>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Transactions")}
            >
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {recentTransactions.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <Text style={styles.emptyText}>No transactions yet</Text>
              </Card.Content>
            </Card>
          ) : (
            recentTransactions.map((transaction) => {
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
                          {transaction.account?.name} •{" "}
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
    </View>
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
  welcomeHeader: {
    marginBottom: spacing.md,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  dateText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  balanceCard: {
    backgroundColor: colors.primary,
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.textInverse,
    opacity: 0.9,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: "bold",
    color: colors.textInverse,
    marginTop: spacing.xs,
  },
  todayStats: {
    flexDirection: "row",
    marginTop: spacing.lg,
  },
  todayStat: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  todayStatLabel: {
    fontSize: 12,
    color: colors.textInverse,
    opacity: 0.8,
    marginTop: spacing.xs,
  },
  todayStatAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textInverse,
    marginTop: 2,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: spacing.lg,
  },
  quickAction: {
    alignItems: "center",
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  quickActionText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "500",
  },
  accountTypesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  accountTypeCard: {
    flex: 1,
    minWidth: "30%",
    borderRadius: borderRadius.md,
  },
  accountTypeContent: {
    alignItems: "center",
    padding: spacing.sm,
  },
  accountTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  accountTypeName: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  accountTypeBalance: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  accountTypeCount: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  accountCard: {
    marginBottom: spacing.sm,
    borderRadius: borderRadius.md,
  },
  accountCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  accountInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  accountIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.sm,
  },
  accountName: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  accountType: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  accountBalance: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
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
