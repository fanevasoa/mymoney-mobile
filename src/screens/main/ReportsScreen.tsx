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

import { useTranslation } from "react-i18next";

import { dashboardService } from "../../api";
import { useTheme } from "../../contexts/ThemeContext";
import { colors, spacing, borderRadius } from "../../theme";
import { formatCurrency } from "../../utils/helpers";
import type {
  MonthlyBreakdown,
  WeeklyBreakdown,
  DailyBreakdown,
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
  const { t } = useTranslation();

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

  const [chartGranularity, setChartGranularity] = useState<string>("monthly");
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth() + 1,
  );
  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number>(0);

  const [monthlyData, setMonthlyData] = useState<MonthlyBreakdown | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyBreakdown | null>(null);
  const [dailyData, setDailyData] = useState<DailyBreakdown | null>(null);
  const [categoryData, setCategoryData] = useState<CategoryBreakdown | null>(
    null,
  );
  const [summaryData, setSummaryData] = useState<FinancialSummary | null>(null);

  const fetchReports = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);

      const [monthlyRes, weeklyRes, dailyRes, categoryRes, summaryRes] =
        await Promise.all([
          dashboardService.getMonthlyBreakdown({ year: selectedYear }),
          dashboardService.getWeeklyBreakdown({
            year: selectedYear,
            month: selectedMonth,
          }),
          dashboardService.getDailyBreakdown({
            year: selectedYear,
            month: selectedMonth,
          }),
          dashboardService.getCategoryBreakdown({ type: "expense" }),
          dashboardService.getFinancialSummary(),
        ]);

      if (monthlyRes.success) {
        setMonthlyData(monthlyRes.data);
      }
      if (weeklyRes.success) {
        setWeeklyData(weeklyRes.data);
      }
      if (dailyRes.success) {
        setDailyData(dailyRes.data);
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
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const onRefresh = async (): Promise<void> => {
    setIsRefreshing(true);
    await fetchReports();
    setIsRefreshing(false);
  };

  const getLineChartData = () => {
    if (chartGranularity === "daily") {
      if (!dailyData?.days?.length) return null;
      const week = weeklyData?.weeks?.[selectedWeekIndex];
      const filteredDays = week
        ? dailyData.days.filter(
            (d) => d.date >= week.startDate && d.date <= week.endDate,
          )
        : dailyData.days;
      if (!filteredDays.length) return null;
      return {
        labels: filteredDays.map((d) => d.label),
        datasets: [
          {
            data: filteredDays.map((d) => d.earnings || 0),
            color: () => colors.earning,
            strokeWidth: 2,
          },
          {
            data: filteredDays.map((d) => d.expenses || 0),
            color: () => colors.expense,
            strokeWidth: 2,
          },
        ],
        legend: [t("common.income"), t("common.expense")],
      };
    }

    if (chartGranularity === "weekly") {
      if (!weeklyData?.weeks?.length) return null;
      return {
        labels: weeklyData.weeks.map((w) => w.label),
        datasets: [
          {
            data: weeklyData.weeks.map((w) => w.earnings || 0),
            color: () => colors.earning,
            strokeWidth: 2,
          },
          {
            data: weeklyData.weeks.map((w) => w.expenses || 0),
            color: () => colors.expense,
            strokeWidth: 2,
          },
        ],
        legend: [t("common.income"), t("common.expense")],
      };
    }

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
      legend: [t("common.income"), t("common.expense")],
    };
  };

  const MONTH_NAMES = Array.from({ length: 12 }, (_, i) =>
    new Date(2000, i).toLocaleString("default", { month: "short" }),
  );

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
          { value: "monthly", label: t("reports.monthly") },
          { value: "category", label: t("reports.categories") },
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
            {t("reports.financialSummary")}
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
                {t("reports.totalIncome")}
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
                {t("reports.totalExpenses")}
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
                {t("reports.netIncome")}
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
                {t("reports.incomeVsExpenses")}
              </Text>

              {/* Granularity toggle */}
              <SegmentedButtons
                value={chartGranularity}
                onValueChange={setChartGranularity}
                buttons={[
                  { value: "monthly", label: t("reports.monthly") },
                  { value: "weekly", label: t("reports.weekly") },
                  { value: "daily", label: t("reports.daily") },
                ]}
                style={styles.granularityToggle}
              />

              {/* Month selector for weekly/daily view */}
              {(chartGranularity === "weekly" ||
                chartGranularity === "daily") && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.monthSelector}
                >
                  {MONTH_NAMES.map((name, i) => (
                    <Chip
                      key={i}
                      selected={selectedMonth === i + 1}
                      onPress={() => {
                        setSelectedMonth(i + 1);
                        setSelectedWeekIndex(0);
                      }}
                      style={[
                        styles.monthChip,
                        {
                          backgroundColor:
                            selectedMonth === i + 1
                              ? themeColors.primary
                              : themeColors.surface,
                        },
                      ]}
                      textStyle={
                        selectedMonth === i + 1
                          ? styles.yearChipTextSelected
                          : undefined
                      }
                    >
                      {name}
                    </Chip>
                  ))}
                </ScrollView>
              )}

              {/* Week selector for daily view */}
              {chartGranularity === "daily" && weeklyData?.weeks?.length ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.monthSelector}
                >
                  {weeklyData.weeks.map((week, i) => (
                    <Chip
                      key={i}
                      selected={selectedWeekIndex === i}
                      onPress={() => setSelectedWeekIndex(i)}
                      style={[
                        styles.weekChip,
                        {
                          backgroundColor:
                            selectedWeekIndex === i
                              ? themeColors.primary
                              : themeColors.surface,
                        },
                      ]}
                      textStyle={
                        selectedWeekIndex === i
                          ? styles.yearChipTextSelected
                          : undefined
                      }
                    >
                      {week.label}
                    </Chip>
                  ))}
                </ScrollView>
              ) : null}

              <Text
                style={[
                  styles.chartSubtitle,
                  { color: themeColors.textSecondary },
                ]}
              >
                {chartGranularity === "monthly"
                  ? `${selectedYear}`
                  : chartGranularity === "daily" &&
                      weeklyData?.weeks?.[selectedWeekIndex]
                    ? `${weeklyData.weeks[selectedWeekIndex].label} — ${selectedYear}`
                    : `${weeklyData?.monthName || dailyData?.monthName || MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`}
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
                  <Text style={styles.noDataText}>
                    {t("reports.noDataPeriod")}
                  </Text>
                </View>
              )}
            </Card.Content>
          </Card>

          {/* Totals card */}
          {(() => {
            const totals =
              chartGranularity === "weekly"
                ? weeklyData?.totals
                : chartGranularity === "daily"
                  ? dailyData?.totals
                  : monthlyData?.yearTotals;
            const title =
              chartGranularity === "monthly"
                ? t("reports.yearTotals", { year: selectedYear })
                : `${weeklyData?.monthName || dailyData?.monthName || MONTH_NAMES[selectedMonth - 1]} ${selectedYear} ${t("reports.totalsLabel")}`;
            if (!totals) return null;
            return (
              <Card style={styles.totalsCard}>
                <Card.Content>
                  <Text
                    style={[
                      styles.sectionTitle,
                      { color: themeColors.textPrimary },
                    ]}
                  >
                    {title}
                  </Text>
                  <View style={styles.totalsRow}>
                    <View style={styles.totalItem}>
                      <Text
                        style={[
                          styles.totalLabel,
                          { color: themeColors.textSecondary },
                        ]}
                      >
                        {t("common.income")}
                      </Text>
                      <Text
                        style={[styles.totalValue, { color: colors.earning }]}
                      >
                        {formatCurrency(totals.earnings)}
                      </Text>
                    </View>
                    <View style={styles.totalItem}>
                      <Text
                        style={[
                          styles.totalLabel,
                          { color: themeColors.textSecondary },
                        ]}
                      >
                        {t("common.expense")}
                      </Text>
                      <Text
                        style={[styles.totalValue, { color: colors.expense }]}
                      >
                        {formatCurrency(totals.expenses)}
                      </Text>
                    </View>
                    <View style={styles.totalItem}>
                      <Text
                        style={[
                          styles.totalLabel,
                          { color: themeColors.textSecondary },
                        ]}
                      >
                        {t("common.net")}
                      </Text>
                      <Text
                        style={[
                          styles.totalValue,
                          {
                            color:
                              totals.net >= 0 ? colors.earning : colors.expense,
                          },
                        ]}
                      >
                        {formatCurrency(totals.net)}
                      </Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            );
          })()}
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
                {t("reports.expensesByCategory")}
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
                  <Text style={styles.noDataText}>
                    {t("reports.noExpenseData")}
                  </Text>
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
                {t("reports.categoryBreakdown")}
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
                          {t("transactions.transaction", { count: cat.count })}
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
                  {t("reports.noCategoryData")}
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
  granularityToggle: {
    marginBottom: spacing.sm,
  },
  monthSelector: {
    marginBottom: spacing.sm,
  },
  monthChip: {
    marginRight: spacing.xs,
  },
  weekChip: {
    marginRight: spacing.xs,
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
