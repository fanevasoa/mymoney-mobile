/**
 * Reports Screen
 *
 * Financial reports and analytics with charts:
 * - Monthly earnings vs expenses chart
 * - Category breakdown pie chart
 * - Financial summary
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
import { LineChart, PieChart, BarChart } from "react-native-chart-kit";

import { dashboardService } from "../../api";
import { colors, spacing, borderRadius } from "../../theme";
import { formatCurrency } from "../../utils/helpers";

const screenWidth = Dimensions.get("window").width;

// Chart configuration
const chartConfig = {
  backgroundColor: colors.surface,
  backgroundGradientFrom: colors.surface,
  backgroundGradientTo: colors.surface,
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
  labelColor: () => colors.textSecondary,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: "4",
    strokeWidth: "2",
    stroke: colors.primary,
  },
};

// Pie chart colors
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

export default function ReportsScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [reportType, setReportType] = useState("monthly");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Data states
  const [monthlyData, setMonthlyData] = useState(null);
  const [categoryData, setCategoryData] = useState(null);
  const [summaryData, setSummaryData] = useState(null);

  /**
   * Fetch report data
   */
  const fetchReports = useCallback(async () => {
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

  /**
   * Handle pull-to-refresh
   */
  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchReports();
    setIsRefreshing(false);
  };

  /**
   * Prepare line chart data for monthly breakdown
   */
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

  /**
   * Prepare bar chart data
   */
  const getBarChartData = () => {
    if (!monthlyData?.months) return null;

    return {
      labels: monthlyData.months.slice(0, 6).map((m) => m.monthName),
      datasets: [
        {
          data: monthlyData.months.slice(0, 6).map((m) => m.net || 0),
        },
      ],
    };
  };

  /**
   * Prepare pie chart data for categories
   */
  const getPieChartData = () => {
    if (!categoryData?.categories) return [];

    return categoryData.categories.slice(0, 6).map((cat, index) => ({
      name: cat.category,
      amount: cat.total,
      color: PIE_COLORS[index % PIE_COLORS.length],
      legendFontColor: colors.textSecondary,
      legendFontSize: 12,
    }));
  };

  const lineChartData = getLineChartData();
  const barChartData = getBarChartData();
  const pieChartData = getPieChartData();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
      }
    >
      {/* Report Type Selector */}
      <SegmentedButtons
        value={reportType}
        onValueChange={setReportType}
        buttons={[
          { value: "monthly", label: "Monthly" },
          { value: "category", label: "Categories" },
        ]}
        style={styles.segmentedButtons}
      />

      {/* Year Selector */}
      <View style={styles.yearSelector}>
        {[selectedYear - 1, selectedYear, selectedYear + 1].map((year) => (
          <Chip
            key={year}
            selected={selectedYear === year}
            onPress={() => setSelectedYear(year)}
            style={[
              styles.yearChip,
              selectedYear === year && styles.yearChipSelected,
            ]}
            textStyle={
              selectedYear === year ? styles.yearChipTextSelected : undefined
            }
          >
            {year}
          </Chip>
        ))}
      </View>

      {/* Financial Summary */}
      <Card style={styles.summaryCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Financial Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <MaterialCommunityIcons
                name="arrow-down-circle"
                size={28}
                color={colors.earning}
              />
              <Text style={styles.summaryLabel}>Total Income</Text>
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
              <Text style={styles.summaryLabel}>Total Expenses</Text>
              <Text style={[styles.summaryValue, { color: colors.expense }]}>
                {formatCurrency(summaryData?.totalExpenses)}
              </Text>
            </View>
            <View style={[styles.summaryItem, styles.summaryItemFull]}>
              <MaterialCommunityIcons
                name="chart-line"
                size={28}
                color={
                  summaryData?.netIncome >= 0 ? colors.earning : colors.expense
                }
              />
              <Text style={styles.summaryLabel}>Net Income</Text>
              <Text
                style={[
                  styles.summaryValue,
                  {
                    color:
                      summaryData?.netIncome >= 0
                        ? colors.earning
                        : colors.expense,
                  },
                ]}
              >
                {summaryData?.netIncome >= 0 ? "+" : ""}
                {formatCurrency(summaryData?.netIncome)}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {reportType === "monthly" ? (
        <>
          {/* Monthly Chart */}
          <Card style={styles.chartCard}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Income vs Expenses</Text>
              <Text style={styles.chartSubtitle}>{selectedYear}</Text>
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

          {/* Year Totals */}
          {monthlyData?.yearTotals && (
            <Card style={styles.totalsCard}>
              <Card.Content>
                <Text style={styles.sectionTitle}>
                  Year {selectedYear} Totals
                </Text>
                <View style={styles.totalsRow}>
                  <View style={styles.totalItem}>
                    <Text style={styles.totalLabel}>Income</Text>
                    <Text
                      style={[styles.totalValue, { color: colors.earning }]}
                    >
                      {formatCurrency(monthlyData.yearTotals.earnings)}
                    </Text>
                  </View>
                  <View style={styles.totalItem}>
                    <Text style={styles.totalLabel}>Expenses</Text>
                    <Text
                      style={[styles.totalValue, { color: colors.expense }]}
                    >
                      {formatCurrency(monthlyData.yearTotals.expenses)}
                    </Text>
                  </View>
                  <View style={styles.totalItem}>
                    <Text style={styles.totalLabel}>Net</Text>
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
          {/* Category Pie Chart */}
          <Card style={styles.chartCard}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Expenses by Category</Text>
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

          {/* Category List */}
          <Card style={styles.categoryListCard}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Category Breakdown</Text>
              {categoryData?.categories?.length > 0 ? (
                categoryData.categories.map((cat, index) => (
                  <View key={cat.category} style={styles.categoryRow}>
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
                        <Text style={styles.categoryName}>{cat.category}</Text>
                        <Text style={styles.categoryCount}>
                          {cat.count} transaction{cat.count !== 1 ? "s" : ""}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.categoryRight}>
                      <Text style={styles.categoryAmount}>
                        {formatCurrency(cat.total)}
                      </Text>
                      <Text style={styles.categoryPercentage}>
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
