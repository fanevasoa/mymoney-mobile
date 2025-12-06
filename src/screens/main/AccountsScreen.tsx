/**
 * Accounts Screen
 *
 * Displays all user accounts with filtering by account type.
 */

import React, { useEffect, useState, useCallback } from "react";
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

import { useApp } from "../../contexts/AppContext";
import { colors, spacing, borderRadius } from "../../theme";
import { formatCurrency } from "../../utils/helpers";
import type { AccountsStackParamList, Account, AccountType } from "../../types";

type Props = NativeStackScreenProps<AccountsStackParamList, "AccountsMain">;

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

export default function AccountsScreen({ navigation }: Props): JSX.Element {
  const {
    accounts,
    accountTypes,
    fetchAccounts,
    fetchAccountTypes,
    isLoadingAccounts,
  } = useApp();

  const [filteredAccounts, setFilteredAccounts] = useState<Account[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  useFocusEffect(
    useCallback(() => {
      fetchAccountTypes();
      fetchAccounts();
    }, [fetchAccountTypes, fetchAccounts])
  );

  useEffect(() => {
    let filtered = [...accounts];

    if (selectedTypeId) {
      filtered = filtered.filter((acc) => acc.accountTypeId === selectedTypeId);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((acc) =>
        acc.name.toLowerCase().includes(query)
      );
    }

    setFilteredAccounts(filtered);
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
    0
  );

  const renderAccount = ({ item }: { item: Account }): JSX.Element => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("AccountDetail", { accountId: item.id })
      }
    >
      <Card style={styles.accountCard}>
        <Card.Content style={styles.accountContent}>
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
                name={getIconName(item.accountType?.icon)}
                size={24}
                color={item.accountType?.color || colors.primary}
              />
            </View>
            <View style={styles.accountInfo}>
              <Text style={styles.accountName}>{item.name}</Text>
              <Text style={styles.accountTypeName}>
                {item.accountType?.name}
              </Text>
            </View>
          </View>
          <View style={styles.accountRight}>
            <Text style={styles.accountBalance}>
              {formatCurrency(item.balance)}
            </Text>
            {!item.isActive && (
              <Text style={styles.inactiveLabel}>Inactive</Text>
            )}
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderEmpty = (): JSX.Element => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons
        name="wallet-outline"
        size={64}
        color={colors.textSecondary}
      />
      <Text style={styles.emptyTitle}>No accounts found</Text>
      <Text style={styles.emptyText}>
        {selectedTypeId || searchQuery
          ? "Try adjusting your filters"
          : "Tap the + button to add your first account"}
      </Text>
    </View>
  );

  const renderHeader = (): JSX.Element => (
    <View style={styles.header}>
      <Searchbar
        placeholder="Search accounts..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        inputStyle={styles.searchInput}
      />

      <FlatList
        horizontal
        data={[
          { id: null, name: "All" } as unknown as AccountType,
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
          <Text style={styles.totalLabel}>
            Total ({filteredAccounts.length} account
            {filteredAccounts.length !== 1 ? "s" : ""})
          </Text>
          <Text style={styles.totalAmount}>{formatCurrency(totalBalance)}</Text>
        </Card.Content>
      </Card>
    </View>
  );

  return (
    <View style={styles.container}>
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
  accountName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  accountTypeName: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  accountRight: {
    alignItems: "flex-end",
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
