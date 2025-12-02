/**
 * Transactions Screen
 *
 * Displays all transactions with filtering and search capabilities.
 */

import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, FlatList, RefreshControl } from "react-native";
import { Text, Card, Chip, Searchbar } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { transactionService } from "../../api";
import { useApp } from "../../contexts/AppContext";
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
    year: "numeric",
  });
};

// Helper to format time
const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function TransactionsScreen({ route }) {
  const { accounts } = useApp();
  const initialAccountId = route.params?.accountId;

  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState(null);
  const [selectedAccountId, setSelectedAccountId] = useState(
    initialAccountId || null
  );
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  /**
   * Fetch transactions
   */
  const fetchTransactions = useCallback(
    async (reset = false) => {
      try {
        const currentPage = reset ? 1 : page;

        const params = {
          page: currentPage,
          limit: 20,
        };

        if (selectedType) params.type = selectedType;
        if (selectedAccountId) params.accountId = selectedAccountId;

        const response = await transactionService.getTransactions(params);

        if (response.success) {
          const newTransactions = response.data.transactions;

          if (reset) {
            setTransactions(newTransactions);
          } else {
            setTransactions((prev) => [...prev, ...newTransactions]);
          }

          setHasMore(newTransactions.length === 20);
          if (!reset) setPage(currentPage + 1);
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [page, selectedType, selectedAccountId]
  );

  // Initial load
  useEffect(() => {
    setPage(1);
    setIsLoading(true);
    fetchTransactions(true);
  }, [selectedType, selectedAccountId]);

  /**
   * Handle pull-to-refresh
   */
  const onRefresh = async () => {
    setIsRefreshing(true);
    setPage(1);
    await fetchTransactions(true);
    setIsRefreshing(false);
  };

  /**
   * Handle load more
   */
  const onLoadMore = () => {
    if (!isLoading && hasMore) {
      fetchTransactions(false);
    }
  };

  /**
   * Filter transactions by search query
   */
  const filteredTransactions = transactions.filter((t) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      t.description?.toLowerCase().includes(query) ||
      t.category?.toLowerCase().includes(query) ||
      t.account?.name?.toLowerCase().includes(query)
    );
  });

  /**
   * Group transactions by date
   */
  const groupedTransactions = filteredTransactions.reduce(
    (groups, transaction) => {
      const date = formatDate(transaction.createdAt);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
      return groups;
    },
    {}
  );

  const sections = Object.entries(groupedTransactions).map(([date, items]) => ({
    date,
    data: items,
  }));

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

  /**
   * Render transaction item
   */
  const renderTransaction = (transaction) => {
    const icon = getTransactionIcon(transaction.type);

    return (
      <Card key={transaction.id} style={styles.transactionCard}>
        <Card.Content style={styles.transactionContent}>
          <View style={styles.transactionLeft}>
            <MaterialCommunityIcons
              name={icon.name}
              size={36}
              color={icon.color}
            />
            <View style={styles.transactionInfo}>
              <Text style={styles.transactionDescription} numberOfLines={1}>
                {transaction.description || transaction.type}
              </Text>
              <Text style={styles.transactionMeta}>
                {transaction.account?.name}
                {transaction.category ? ` • ${transaction.category}` : ""}
              </Text>
              <Text style={styles.transactionTime}>
                {formatTime(transaction.createdAt)}
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
  };

  /**
   * Render section header
   */
  const renderSectionHeader = (date) => (
    <Text style={styles.sectionHeader}>{date}</Text>
  );

  /**
   * Render empty state
   */
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons
        name="receipt"
        size={64}
        color={colors.textSecondary}
      />
      <Text style={styles.emptyTitle}>No transactions found</Text>
      <Text style={styles.emptyText}>
        {searchQuery || selectedType || selectedAccountId
          ? "Try adjusting your filters"
          : "Your transactions will appear here"}
      </Text>
    </View>
  );

  /**
   * Render list header with filters
   */
  const renderHeader = () => (
    <View style={styles.header}>
      {/* Search bar */}
      <Searchbar
        placeholder="Search transactions..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        inputStyle={styles.searchInput}
      />

      {/* Type filters */}
      <FlatList
        horizontal
        data={[
          { id: null, label: "All" },
          { id: "earning", label: "Income" },
          { id: "expense", label: "Expense" },
          { id: "transfer_fee", label: "Fees" },
        ]}
        keyExtractor={(item) => item.id || "all"}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
        renderItem={({ item }) => (
          <Chip
            selected={selectedType === item.id}
            onPress={() => setSelectedType(item.id)}
            style={[
              styles.filterChip,
              selectedType === item.id && styles.filterChipSelected,
            ]}
            textStyle={[
              styles.filterChipText,
              selectedType === item.id && styles.filterChipTextSelected,
            ]}
          >
            {item.label}
          </Chip>
        )}
      />

      {/* Account filter (if not already filtered) */}
      {!initialAccountId && accounts.length > 0 && (
        <FlatList
          horizontal
          data={[{ id: null, name: "All Accounts" }, ...accounts]}
          keyExtractor={(item) => item.id || "all-accounts"}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
          renderItem={({ item }) => (
            <Chip
              selected={selectedAccountId === item.id}
              onPress={() => setSelectedAccountId(item.id)}
              style={[
                styles.filterChip,
                selectedAccountId === item.id && styles.filterChipSelected,
              ]}
              textStyle={[
                styles.filterChipText,
                selectedAccountId === item.id && styles.filterChipTextSelected,
              ]}
            >
              {item.name}
            </Chip>
          )}
        />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={sections}
        keyExtractor={(item) => item.date}
        renderItem={({ item }) => (
          <View>
            {renderSectionHeader(item.date)}
            {item.data.map(renderTransaction)}
          </View>
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!isLoading ? renderEmpty : null}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.5}
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
    paddingBottom: spacing.xxl,
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
    paddingVertical: spacing.xs,
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
    fontSize: 12,
  },
  filterChipTextSelected: {
    color: colors.textInverse,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
    marginTop: spacing.md,
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
  transactionTime: {
    fontSize: 11,
    color: colors.textDisabled,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "600",
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
});
