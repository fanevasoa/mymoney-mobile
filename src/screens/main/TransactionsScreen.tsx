/**
 * Transactions Screen
 */

import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { Text, Card, Chip, Searchbar } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";

import { useTranslation } from "react-i18next";

import { transactionService } from "../../api";
import { useApp } from "../../contexts/AppContext";
import { useTheme } from "../../contexts/ThemeContext";
import { colors, spacing, borderRadius } from "../../theme";
import { formatCurrency, formatDate } from "../../utils/helpers";
import type {
  DashboardStackParamList,
  Transaction,
  TransactionType,
} from "../../types";

type Props = NativeStackScreenProps<DashboardStackParamList, "Transactions">;
type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

interface TransactionSection {
  date: string;
  data: Transaction[];
}

const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function TransactionsScreen({
  route,
  navigation,
}: Props): React.JSX.Element {
  const { accounts } = useApp();
  const { colors: themeColors } = useTheme();
  const { t } = useTranslation();
  const initialAccountId = route.params?.accountId;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    initialAccountId || null,
  );
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchTransactions = useCallback(
    async (reset = false) => {
      try {
        const currentPage = reset ? 1 : page;
        const params: Record<string, unknown> = {
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
    [page, selectedType, selectedAccountId],
  );

  useEffect(() => {
    setPage(1);
    setIsLoading(true);
    fetchTransactions(true);
  }, [selectedType, selectedAccountId]);

  useFocusEffect(
    useCallback(() => {
      setPage(1);
      fetchTransactions(true);
    }, []),
  );

  const onRefresh = async () => {
    setIsRefreshing(true);
    setPage(1);
    await fetchTransactions(true);
    setIsRefreshing(false);
  };

  const filteredTransactions = transactions.filter((t) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      t.description?.toLowerCase().includes(query) ||
      t.category?.toLowerCase().includes(query) ||
      t.account?.name?.toLowerCase().includes(query)
    );
  });

  const sections: TransactionSection[] = Object.entries(
    filteredTransactions.reduce<Record<string, Transaction[]>>((groups, t) => {
      const date = formatDate(t.createdAt);
      if (!groups[date]) groups[date] = [];
      groups[date].push(t);
      return groups;
    }, {}),
  ).map(([date, data]) => ({ date, data }));

  const getIcon = (
    type: TransactionType,
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

  const renderTransaction = (tx: Transaction) => {
    const icon = getIcon(tx.type);
    return (
      <TouchableOpacity
        key={tx.id}
        onPress={() =>
          navigation.navigate("EditTransaction", {
            transactionId: tx.id,
          })
        }
      >
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.left}>
              <MaterialCommunityIcons
                name={icon.name}
                size={36}
                color={icon.color}
              />
              <View style={styles.info}>
                <Text style={styles.desc} numberOfLines={1}>
                  {tx.description || tx.type}
                </Text>
                <Text style={styles.meta}>
                  {tx.account?.name}
                  {tx.category ? ` - ${tx.category}` : ""}
                </Text>
                <Text style={styles.time}>{formatTime(tx.createdAt)}</Text>
              </View>
            </View>
            <Text
              style={[
                styles.amount,
                {
                  color:
                    tx.type === "earning" ? colors.earning : colors.expense,
                },
              ]}
            >
              {tx.type === "earning" ? "+" : "-"}
              {formatCurrency(tx.amount)}
            </Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  const typeFilters = [
    { id: null, label: t("common.all") },
    { id: "earning", label: t("common.income") },
    { id: "expense", label: t("common.expense") },
    { id: "transfer_fee", label: t("common.fees") },
  ];

  const accountFilters = [
    { id: null, name: t("common.allAccounts") },
    ...accounts.map((a) => ({ id: a.id, name: a.name })),
  ];

  const renderHeader = () => (
    <View style={styles.header}>
      <Searchbar
        placeholder={t("common.search")}
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.search}
      />
      <FlatList
        horizontal
        data={typeFilters}
        keyExtractor={(i) => i.id || "all"}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <Chip
            selected={selectedType === item.id}
            onPress={() => setSelectedType(item.id)}
            style={[
              styles.chip,
              selectedType === item.id && styles.chipSelected,
            ]}
            textStyle={
              selectedType === item.id ? styles.chipTextSelected : undefined
            }
          >
            {item.label}
          </Chip>
        )}
      />
      {!initialAccountId && accounts.length > 0 && (
        <FlatList
          horizontal
          data={accountFilters}
          keyExtractor={(i) => i.id || "all-acc"}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <Chip
              selected={selectedAccountId === item.id}
              onPress={() => setSelectedAccountId(item.id)}
              style={[
                styles.chip,
                selectedAccountId === item.id && styles.chipSelected,
              ]}
              textStyle={
                selectedAccountId === item.id
                  ? styles.chipTextSelected
                  : undefined
              }
            >
              {item.name}
            </Chip>
          )}
        />
      )}
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.empty}>
      <MaterialCommunityIcons
        name="receipt"
        size={64}
        color={colors.textSecondary}
      />
      <Text style={styles.emptyTitle}>{t("transactions.noTransactions")}</Text>
    </View>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <FlatList
        data={sections}
        keyExtractor={(i) => i.date}
        renderItem={({ item }) => (
          <View>
            <Text style={styles.sectionHeader}>{item.date}</Text>
            {item.data.map(renderTransaction)}
          </View>
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!isLoading ? renderEmpty : null}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        onEndReached={() => !isLoading && hasMore && fetchTransactions(false)}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: spacing.md, paddingBottom: spacing.xxl },
  header: { marginBottom: spacing.md },
  search: {
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.md,
  },
  chip: {
    marginRight: spacing.xs,
    backgroundColor: colors.surface,
    marginVertical: spacing.xs,
  },
  chipSelected: { backgroundColor: colors.primary },
  chipTextSelected: { color: colors.textInverse },
  sectionHeader: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  card: { marginBottom: spacing.sm, borderRadius: borderRadius.md },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  left: { flexDirection: "row", alignItems: "center", flex: 1 },
  info: { marginLeft: spacing.sm, flex: 1 },
  desc: { fontSize: 14, fontWeight: "500", color: colors.textPrimary },
  meta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  time: { fontSize: 11, color: colors.textDisabled, marginTop: 2 },
  amount: { fontSize: 16, fontWeight: "600" },
  empty: { alignItems: "center", paddingVertical: spacing.xxl },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
});
