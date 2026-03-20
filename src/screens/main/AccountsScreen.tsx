/**
 * Accounts Screen
 *
 * Displays all user accounts with filtering by account type.
 */

import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { Text, Card, FAB, Chip, Searchbar } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { useTranslation } from "react-i18next";

import { useApp } from "../../contexts/AppContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useBalanceVisibility } from "../../contexts/BalanceVisibilityContext";
import { useToast } from "../../contexts/ToastContext";
import accountService from "../../api/services/accountService";
import sharedAccountService from "../../api/services/sharedAccountService";
import { colors, spacing, borderRadius } from "../../theme";
import { formatCurrency } from "../../utils/helpers";
import type {
  AccountsStackParamList,
  Account,
  AccountType,
  ApiError,
} from "../../types";

type Props = NativeStackScreenProps<AccountsStackParamList, "AccountsMain">;

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

export default function AccountsScreen({
  navigation,
}: Props): React.JSX.Element {
  const {
    accounts,
    accountTypes,
    fetchAccounts,
    fetchAccountTypes,
    updateAccount,
    isLoadingAccounts,
  } = useApp();
  const { colors: themeColors } = useTheme();
  const { isVisible, toggle, maskedBalance } = useBalanceVisibility();
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  useFocusEffect(
    useCallback(() => {
      setSelectedTypeId(null);
      setSearchQuery("");
      fetchAccountTypes();
      fetchAccounts();
    }, [fetchAccountTypes, fetchAccounts]),
  );

  const filteredAccounts = useMemo(() => {
    let filtered = accounts;

    if (selectedTypeId) {
      filtered = filtered.filter((acc) => acc.accountTypeId === selectedTypeId);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((acc) =>
        acc.name.toLowerCase().includes(query),
      );
    }

    return filtered;
  }, [accounts, selectedTypeId, searchQuery]);

  const onRefresh = async (): Promise<void> => {
    setIsRefreshing(true);
    await fetchAccounts();
    setIsRefreshing(false);
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

  const totalBalance = filteredAccounts.reduce(
    (sum, acc) => sum + parseFloat(String(acc.balance)),
    0,
  );

  const handleToggleFavorite = async (item: Account) => {
    try {
      if (item.sharedAccountId) {
        // Shared account - use shared account service
        const response = await sharedAccountService.toggleFavorite(
          item.sharedAccountId,
        );
        if (response.success) {
          // Update the account in the list with new favorite status
          const updatedAccount = {
            ...item,
            sharedAccount: {
              ...item.sharedAccount,
              isFavorite: response.data.isFavorite,
            },
          };
          updateAccount(updatedAccount as Account);
        }
      } else {
        // Regular account - use account service
        const response = await accountService.toggleFavorite(item.id);
        if (response.success) {
          updateAccount(response.data.account);
        }
      }
    } catch (err: unknown) {
      console.error("Toggle favorite failed:", err);
      const apiError = err as ApiError;
      const message = apiError?.message || "Failed to update favorite";
      showToast(message, "error");
    }
  };

  const handleAccountPress = (item: Account) => {
    if (item.sharedAccountId) {
      navigation.navigate("SharedAccountDetail", {
        sharedAccountId: item.sharedAccountId,
      });
    } else {
      navigation.navigate("AccountDetail", { accountId: item.id });
    }
  };

  const renderAccount = ({ item }: { item: Account }): React.JSX.Element => {
    const isShared = !!item.sharedAccountId;
    const sa = item.sharedAccount;

    return (
      <TouchableOpacity onPress={() => handleAccountPress(item)}>
        <Card style={styles.accountCard}>
          <Card.Content>
            <View style={styles.accountContent}>
              <View style={styles.accountLeft}>
                <View
                  style={[
                    styles.accountIcon,
                    {
                      backgroundColor:
                        (item.accountType?.color || colors.primary) + "20",
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={
                      isShared
                        ? "account-group"
                        : getIconName(item.accountType?.icon)
                    }
                    size={24}
                    color={item.accountType?.color || colors.primary}
                  />
                </View>
                <View style={styles.accountInfo}>
                  <View style={styles.accountNameRow}>
                    <Text
                      style={[
                        styles.accountName,
                        { color: themeColors.textPrimary },
                      ]}
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                    {isShared && sa?.myRole && (
                      <View
                        style={[
                          styles.roleBadge,
                          {
                            backgroundColor:
                              sa.myRole === "manager"
                                ? colors.primary + "15"
                                : themeColors.border + "50",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.roleBadgeText,
                            {
                              color:
                                sa.myRole === "manager"
                                  ? colors.primary
                                  : themeColors.textSecondary,
                            },
                          ]}
                        >
                          {sa.myRole === "manager"
                            ? t("sharedAccount.manager")
                            : t("sharedAccount.member")}
                        </Text>
                      </View>
                    )}
                  </View>
                  {isShared && sa?.description ? (
                    <Text
                      style={[
                        styles.accountTypeName,
                        { color: themeColors.textSecondary },
                      ]}
                      numberOfLines={1}
                    >
                      {sa.description}
                    </Text>
                  ) : (
                    <Text
                      style={[
                        styles.accountTypeName,
                        { color: themeColors.textSecondary },
                      ]}
                    >
                      {item.accountType?.name}
                    </Text>
                  )}
                </View>
              </View>
              <View style={styles.accountRight}>
                <TouchableOpacity
                  onPress={() => handleToggleFavorite(item)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={styles.favoriteButton}
                >
                  <MaterialCommunityIcons
                    name={
                      (
                        item.sharedAccountId
                          ? item.sharedAccount?.isFavorite
                          : item.isFavorite
                      )
                        ? "star"
                        : "star-outline"
                    }
                    size={20}
                    color={
                      (
                        item.sharedAccountId
                          ? item.sharedAccount?.isFavorite
                          : item.isFavorite
                      )
                        ? colors.warning
                        : themeColors.textSecondary
                    }
                  />
                </TouchableOpacity>
                <Text
                  style={[
                    styles.accountBalance,
                    { color: themeColors.textPrimary },
                  ]}
                >
                  {!isShared && !isVisible("accounts_total")
                    ? maskedBalance
                    : formatCurrency(item.balance)}
                </Text>
                {!item.isActive && (
                  <Text style={styles.inactiveLabel}>
                    {t("common.inactive")}
                  </Text>
                )}
              </View>
            </View>
            {isShared && (
              <View style={styles.sharedFooter}>
                <View style={styles.membersRow}>
                  <MaterialCommunityIcons
                    name="account-multiple"
                    size={14}
                    color={themeColors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.membersCount,
                      { color: themeColors.textSecondary },
                    ]}
                  >
                    {t("sharedAccount.membersCount", {
                      count: sa?.memberCount || 0,
                    })}
                  </Text>
                </View>
              </View>
            )}
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderEmpty = (): React.JSX.Element => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons
        name="wallet-outline"
        size={64}
        color={colors.textSecondary}
      />
      <Text style={[styles.emptyTitle, { color: themeColors.textPrimary }]}>
        {t("account.noAccountsFound")}
      </Text>
      <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>
        {selectedTypeId || searchQuery
          ? t("account.adjustFilters")
          : t("account.addFirstAccount")}
      </Text>
    </View>
  );

  const renderHeader = (): React.JSX.Element => (
    <View style={styles.header}>
      <Searchbar
        placeholder={t("account.searchAccounts")}
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        inputStyle={styles.searchInput}
      />

      <FlatList
        horizontal
        data={[
          { id: null, name: t("common.all") } as unknown as AccountType,
          ...accountTypes,
        ]}
        keyExtractor={(item) => item.id || "all"}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
        renderItem={({ item }) => (
          <Chip
            selected={selectedTypeId === item.id}
            onPress={() => setSelectedTypeId(item.id)}
            style={[
              styles.filterChip,
              selectedTypeId === item.id && styles.filterChipSelected,
            ]}
            textStyle={[
              styles.filterChipText,
              selectedTypeId === item.id && styles.filterChipTextSelected,
            ]}
          >
            {item.name}
          </Chip>
        )}
      />

      <Card style={styles.totalCard}>
        <Card.Content style={styles.totalContent}>
          <View style={styles.totalLabelRow}>
            <Text style={styles.totalLabel}>
              {t("account.totalBalance")} (
              {t("dashboard.accountCount", { count: filteredAccounts.length })})
            </Text>
            <TouchableOpacity
              onPress={() => toggle("accounts_total")}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialCommunityIcons
                name={isVisible("accounts_total") ? "eye" : "eye-off"}
                size={20}
                color={colors.textInverse}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.totalAmount}>
            {isVisible("accounts_total")
              ? formatCurrency(totalBalance)
              : maskedBalance}
          </Text>
        </Card.Content>
      </Card>
    </View>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <FlatList
        data={filteredAccounts}
        keyExtractor={(item) => item.id}
        renderItem={renderAccount}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate("AddAccount")}
        color={colors.textInverse}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  header: {
    marginBottom: spacing.md,
  },
  searchBar: {
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.md,
    elevation: 1,
  },
  searchInput: {
    fontSize: 14,
  },
  filterContainer: {
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  filterChip: {
    marginRight: spacing.xs,
    backgroundColor: colors.surface,
  },
  filterChipSelected: {
    backgroundColor: colors.primary,
  },
  filterChipText: {
    color: colors.textSecondary,
  },
  filterChipTextSelected: {
    color: colors.textInverse,
  },
  totalCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  totalContent: {
    //
  },
  totalLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 14,
    color: colors.textInverse,
    opacity: 0.9,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.textInverse,
  },
  accountCard: {
    marginBottom: spacing.sm,
    borderRadius: borderRadius.md,
    elevation: 1,
  },
  accountContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  accountLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  accountIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  accountInfo: {
    flex: 1,
  },
  accountNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: "600",
  },
  accountName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    flexShrink: 1,
  },
  accountTypeName: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  accountRight: {
    alignItems: "flex-end",
  },
  favoriteButton: {
    marginBottom: 2,
  },
  accountBalance: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  inactiveLabel: {
    fontSize: 10,
    color: colors.warning,
    marginTop: 2,
  },
  sharedFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: spacing.xs,
  },
  membersRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  membersCount: {
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  fab: {
    position: "absolute",
    right: spacing.md,
    bottom: spacing.md,
    backgroundColor: colors.primary,
  },
});
