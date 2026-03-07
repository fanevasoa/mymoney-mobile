/**
 * Reports Screen
 *
 * Financial reports and analytics with charts.
 */

import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from "react-native";
import { Text, Card, SegmentedButtons, Chip } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LineChart, PieChart } from "react-native-chart-kit";

import { dashboardService } from "../../api";
import { useTheme } from "../../contexts/ThemeContext";
import { colors, spacing, borderRadius } from "../../theme";
import { formatCurrency } from "../../utils/helpers";
import type {
  MonthlyBreakdown,
  CategoryBreakdown,
  FinancialSummary,
  CategoryData,
} from "../../types";

const screenWidth = Dimensions.get("window").width;

const PIE_COLORS = [
  "#6366F1",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
  "#F97316",
  "#06B6D4",
  "#84CC16",
];

interface PieChartData {
  name: string;
  amount: number;
  color: string;
  legendFontColor: string;
  legendFontSize: number;
}

export default function ReportsScreen(): React.JSX.Element {
  const { colors: themeColors } = useTheme();

  const chartConfig = {
    backgroundColor: themeColors.surface,
    backgroundGradientFrom: themeColors.surface,
    backgroundGradientTo: themeColors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
    labelColor: () => themeColors.textSecondary,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: themeColors.primary,
    },
  };

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [reportType, setReportType] = useState<string>("monthly");
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear(),
  );

  const [monthlyData, setMonthlyData] = useState<MonthlyBreakdown | null>(null);
  const [categoryData, setCategoryData] = useState<CategoryBreakdown | null>(
    null,
  );
  const [summaryData, setSummaryData] = useState<FinancialSummary | null>(null);

  const fetchReports = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);

      const [monthlyRes, categoryRes, summaryRes] = await Promise.all([
        dashboardService.getMonthlyBreakdown({ year: selectedYear }),
        dashboardService.getCategoryBreakdown({ type: "expense" }),
        dashboardService.getFinancialSummary(),
      ]);

      if (monthlyRes.success) {
        setMonthlyData(monthlyRes.data);
      }
      if (categoryRes.success) {
        setCategoryData(categoryRes.data);
      }
      if (summaryRes.success) {
        setSummaryData(summaryRes.data.summary);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const onRefresh = async (): Promise<void> => {
    setIsRefreshing(true);
    await fetchReports();
    setIsRefreshing(false);
  };

  const getLineChartData = () => {
    if (!monthlyData?.months) return null;

    return {
      labels: monthlyData.months.map((m) => m.monthName),
      datasets: [
        {
          data: monthlyData.months.map((m) => m.earnings || 0),
          color: () => colors.earning,
          strokeWidth: 2,
        },
        {
          data: monthlyData.months.map((m) => m.expenses || 0),
          color: () => colors.expense,
          strokeWidth: 2,
        },
      ],
      legend: ["Income", "Expenses"],
    };
  };

  const getPieChartData = (): PieChartData[] => {
    if (!categoryData?.categories) return [];

    return categoryData.categories.slice(0, 6).map((cat, index) => ({
      name: cat.category,
      amount: cat.total,
      color: PIE_COLORS[index % PIE_COLORS.length],
      legendFontColor: themeColors.textSecondary,
      legendFontSize: 12,
    }));
  };

  const lineChartData = getLineChartData();
  const pieChartData = getPieChartData();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
      }
    >
      <SegmentedButtons
        value={reportType}
        onValueChange={setReportType}
        buttons={[
          { value: "monthly", label: "Monthly" },
          { value: "category", label: "Categories" },
        ]}
        style={styles.segmentedButtons}
      />

      <View style={styles.yearSelector}>
        {[selectedYear - 1, selectedYear, selectedYear + 1].map((year) => (
          <Chip
            key={year}
            selected={selectedYear === year}
            onPress={() => setSelectedYear(year)}
            style={[
              styles.yearChip,
              {
                backgroundColor:
                  selectedYear === year
                    ? themeColors.primary
                    : themeColors.surface,
              },
            ]}
            textStyle={
              selectedYear === year ? styles.yearChipTextSelected : undefined
            }
          >
            {year}
          </Chip>
        ))}
      </View>

      <Card style={styles.summaryCard}>
        <Card.Content>
          <Text
            style={[styles.sectionTitle, { color: themeColors.textPrimary }]}
          >
            Financial Summary
          </Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <MaterialCommunityIcons
                name="arrow-down-circle"
                size={28}
                color={colors.earning}
              />
              <Text
                style={[
                  styles.summaryLabel,
                  { color: themeColors.textSecondary },
                ]}
              >
                Total Income
              </Text>
              <Text style={[styles.summaryValue, { color: colors.earning }]}>
                {formatCurrency(summaryData?.earnings?.total)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <MaterialCommunityIcons
                name="arrow-up-circle"
                size={28}
                color={colors.expense}
              />
              <Text
                style={[
                  styles.summaryLabel,
                  { color: themeColors.textSecondary },
                ]}
              >
                Total Expenses
              </Text>
              <Text style={[styles.summaryValue, { color: colors.expense }]}>
                {formatCurrency(summaryData?.totalExpenses)}
              </Text>
            </View>
            <View style={[styles.summaryItem, styles.summaryItemFull]}>
              <MaterialCommunityIcons
                name="chart-line"
                size={28}
                color={
                  (summaryData?.netIncome ?? 0) >= 0
                    ? colors.earning
                    : colors.expense
                }
              />
              <Text
                style={[
                  styles.summaryLabel,
                  { color: themeColors.textSecondary },
                ]}
              >
                Net Income
              </Text>
              <Text
                style={[
                  styles.summaryValue,
                  {
                    color:
                      (summaryData?.netIncome ?? 0) >= 0
                        ? colors.earning
                        : colors.expense,
                  },
                ]}
              >
                {(summaryData?.netIncome ?? 0) >= 0 ? "+" : ""}
                {formatCurrency(summaryData?.netIncome)}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {reportType === "monthly" ? (
        <>
          <Card style={styles.chartCard}>
            <Card.Content>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: themeColors.textPrimary },
                ]}
              >
                Income vs Expenses
              </Text>
              <Text
                style={[
                  styles.chartSubtitle,
                  { color: themeColors.textSecondary },
                ]}
              >
                {selectedYear}
              </Text>
              {lineChartData &&
              lineChartData.datasets[0].data.some((d) => d > 0) ? (
                <LineChart
                  data={lineChartData}
                  width={screenWidth - spacing.md * 4}
                  height={220}
                  chartConfig={chartConfig}
                  bezier
                  style={styles.chart}
                  withInnerLines={false}
                  withOuterLines={false}
                  fromZero
                />
              ) : (
                <View style={styles.noDataContainer}>
                  <MaterialCommunityIcons
                    name="chart-line"
                    size={48}
                    color={colors.textDisabled}
                  />
                  <Text style={styles.noDataText}>No data for this period</Text>
                </View>
              )}
            </Card.Content>
          </Card>

          {monthlyData?.yearTotals && (
            <Card style={styles.totalsCard}>
              <Card.Content>
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: themeColors.textPrimary },
                  ]}
                >
                  Year {selectedYear} Totals
                </Text>
                <View style={styles.totalsRow}>
                  <View style={styles.totalItem}>
                    <Text
                      style={[
                        styles.totalLabel,
                        { color: themeColors.textSecondary },
                      ]}
                    >
                      Income
                    </Text>
                    <Text
                      style={[styles.totalValue, { color: colors.earning }]}
                    >
                      {formatCurrency(monthlyData.yearTotals.earnings)}
                    </Text>
                  </View>
                  <View style={styles.totalItem}>
                    <Text
                      style={[
                        styles.totalLabel,
                        { color: themeColors.textSecondary },
                      ]}
                    >
                      Expenses
                    </Text>
                    <Text
                      style={[styles.totalValue, { color: colors.expense }]}
                    >
                      {formatCurrency(monthlyData.yearTotals.expenses)}
                    </Text>
                  </View>
                  <View style={styles.totalItem}>
                    <Text
                      style={[
                        styles.totalLabel,
                        { color: themeColors.textSecondary },
                      ]}
                    >
                      Net
                    </Text>
                    <Text
                      style={[
                        styles.totalValue,
                        {
                          color:
                            monthlyData.yearTotals.net >= 0
                              ? colors.earning
                              : colors.expense,
                        },
                      ]}
                    >
                      {formatCurrency(monthlyData.yearTotals.net)}
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          )}
        </>
      ) : (
        <>
          <Card style={styles.chartCard}>
            <Card.Content>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: themeColors.textPrimary },
                ]}
              >
                Expenses by Category
              </Text>
              {pieChartData.length > 0 ? (
                <PieChart
                  data={pieChartData}
                  width={screenWidth - spacing.md * 4}
                  height={220}
                  chartConfig={chartConfig}
                  accessor="amount"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                />
              ) : (
                <View style={styles.noDataContainer}>
                  <MaterialCommunityIcons
                    name="chart-pie"
                    size={48}
                    color={colors.textDisabled}
                  />
                  <Text style={styles.noDataText}>No expense data</Text>
                </View>
              )}
            </Card.Content>
          </Card>

          <Card style={styles.categoryListCard}>
            <Card.Content>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: themeColors.textPrimary },
                ]}
              >
                Category Breakdown
              </Text>
              {categoryData?.categories?.length ? (
                categoryData.categories.map((cat, index) => (
                  <View
                    key={cat.category}
                    style={[
                      styles.categoryRow,
                      { borderBottomColor: themeColors.borderLight },
                    ]}
                  >
                    <View style={styles.categoryLeft}>
                      <View
                        style={[
                          styles.categoryDot,
                          {
                            backgroundColor:
                              PIE_COLORS[index % PIE_COLORS.length],
                          },
                        ]}
                      />
                      <View>
                        <Text
                          style={[
                            styles.categoryName,
                            { color: themeColors.textPrimary },
                          ]}
                        >
                          {cat.category}
                        </Text>
                        <Text
                          style={[
                            styles.categoryCount,
                            { color: themeColors.textSecondary },
                          ]}
                        >
                          {cat.count} transaction{cat.count !== 1 ? "s" : ""}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.categoryRight}>
                      <Text
                        style={[
                          styles.categoryAmount,
                          { color: themeColors.textPrimary },
                        ]}
                      >
                        {formatCurrency(cat.total)}
                      </Text>
                      <Text
                        style={[
                          styles.categoryPercentage,
                          { color: themeColors.textSecondary },
                        ]}
                      >
                        {cat.percentage}%
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.noDataText}>
                  No category data available
                </Text>
              )}
            </Card.Content>
          </Card>
        </>
      )}
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
    paddingBottom: spacing.xxl,
  },
  segmentedButtons: {
    marginBottom: spacing.md,
  },
  yearSelector: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  yearChip: {
    backgroundColor: colors.surface,
  },
  yearChipSelected: {
    backgroundColor: colors.primary,
  },
  yearChipTextSelected: {
    color: colors.textInverse,
  },
  summaryCard: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  summaryItem: {
    flex: 1,
    minWidth: "45%",
    alignItems: "center",
    padding: spacing.sm,
  },
  summaryItemFull: {
    minWidth: "100%",
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 2,
  },
  chartCard: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
  },
  chartSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  chart: {
    marginVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  noDataContainer: {
    alignItems: "center",
    paddingVertical: spacing.xl,
  },
  noDataText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: "center",
  },
  totalsCard: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  totalItem: {
    alignItems: "center",
    flex: 1,
  },
  totalLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 2,
  },
  categoryListCard: {
    borderRadius: borderRadius.lg,
  },
  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  categoryLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  categoryCount: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  categoryRight: {
    alignItems: "flex-end",
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  categoryPercentage: {
    fontSize: 11,
    color: colors.textSecondary,
  },
});
