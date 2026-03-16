/**
 * Main Navigator
 *
 * Bottom tab navigator with nested stack navigators for authenticated users.
 */

import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { useTranslation } from "react-i18next";

import { colors as lightColors } from "../theme";
import { useTheme } from "../contexts/ThemeContext";
import CustomTabBar from "./CustomTabBar";

// Screens
import DashboardScreen from "../screens/main/DashboardScreen";
import AccountsScreen from "../screens/main/AccountsScreen";
import AccountDetailScreen from "../screens/main/AccountDetailScreen";
import AddAccountScreen from "../screens/main/AddAccountScreen";
import AddTransactionScreen from "../screens/main/AddTransactionScreen";
import TransferScreen from "../screens/main/TransferScreen";
import TransactionsScreen from "../screens/main/TransactionsScreen";
import ReportsScreen from "../screens/main/ReportsScreen";
import ProfileScreen from "../screens/main/ProfileScreen";
import BorrowingsScreen from "../screens/main/BorrowingsScreen";
import BorrowingDetailScreen from "../screens/main/BorrowingDetailScreen";
import SharedAccountDetailScreen from "../screens/main/SharedAccountDetailScreen";
import AddSharedAccountMemberScreen from "../screens/main/AddSharedAccountMemberScreen";
import SharedAccountIncomeScreen from "../screens/main/SharedAccountIncomeScreen";
import CreateBudgetCampaignScreen from "../screens/main/CreateBudgetCampaignScreen";
import BudgetCampaignDetailScreen from "../screens/main/BudgetCampaignDetailScreen";
import AddBudgetItemScreen from "../screens/main/AddBudgetItemScreen";
import EditBudgetCampaignScreen from "../screens/main/EditBudgetCampaignScreen";
import EditBudgetItemScreen from "../screens/main/EditBudgetItemScreen";
import EditTransactionScreen from "../screens/main/EditTransactionScreen";

import type {
  MainTabParamList,
  DashboardStackParamList,
  AccountsStackParamList,
  AddStackParamList,
  ReportsStackParamList,
  ProfileStackParamList,
} from "../types";

// Stack Navigators
const DashboardStack = createNativeStackNavigator<DashboardStackParamList>();
const AccountsStack = createNativeStackNavigator<AccountsStackParamList>();
const AddStack = createNativeStackNavigator<AddStackParamList>();
const ReportsStack = createNativeStackNavigator<ReportsStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

// Tab Navigator
const Tab = createBottomTabNavigator<MainTabParamList>();

function useScreenOptions() {
  const { colors } = useTheme();
  return {
    headerStyle: {
      backgroundColor: colors.primary,
    },
    headerTintColor: lightColors.textInverse,
    headerTitleStyle: {
      fontWeight: "600" as const,
    },
  };
}

function DashboardStackNavigator(): React.JSX.Element {
  const screenOptions = useScreenOptions();
  const { t } = useTranslation();
  return (
    <DashboardStack.Navigator screenOptions={screenOptions}>
      <DashboardStack.Screen
        name="DashboardMain"
        component={DashboardScreen}
        options={{ title: t("nav.dashboard") }}
      />
      <DashboardStack.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{ title: t("transactions.title") }}
      />
      <DashboardStack.Screen
        name="AccountDetail"
        component={AccountDetailScreen}
        options={{ title: t("common.accounts") }}
      />
      <DashboardStack.Screen
        name="EditTransaction"
        component={EditTransactionScreen}
        options={{ title: t("nav.editTransaction") }}
      />
    </DashboardStack.Navigator>
  );
}

function AccountsStackNavigator(): React.JSX.Element {
  const screenOptions = useScreenOptions();
  const { t } = useTranslation();
  return (
    <AccountsStack.Navigator screenOptions={screenOptions}>
      <AccountsStack.Screen
        name="AccountsMain"
        component={AccountsScreen}
        options={{ title: t("nav.accounts") }}
      />
      <AccountsStack.Screen
        name="AccountDetail"
        component={AccountDetailScreen}
        options={{ title: t("common.accounts") }}
      />
      <AccountsStack.Screen
        name="AddAccount"
        component={AddAccountScreen}
        options={{ title: t("addAccount.title") }}
      />
      <AccountsStack.Screen
        name="SharedAccountDetail"
        component={SharedAccountDetailScreen}
        options={{ title: t("nav.sharedAccount") }}
      />
      <AccountsStack.Screen
        name="AddSharedAccountMember"
        component={AddSharedAccountMemberScreen}
        options={{ title: t("nav.addMember") }}
      />
      <AccountsStack.Screen
        name="SharedAccountIncome"
        component={SharedAccountIncomeScreen}
        options={{ title: t("nav.addIncome") }}
      />
      <AccountsStack.Screen
        name="CreateBudgetCampaign"
        component={CreateBudgetCampaignScreen}
        options={{ title: t("nav.newBudgetCampaign") }}
      />
      <AccountsStack.Screen
        name="BudgetCampaignDetail"
        component={BudgetCampaignDetailScreen}
        options={{ title: t("nav.budgetCampaign") }}
      />
      <AccountsStack.Screen
        name="EditBudgetCampaign"
        component={EditBudgetCampaignScreen}
        options={{ title: t("nav.editCampaign") }}
      />
      <AccountsStack.Screen
        name="AddBudgetItem"
        component={AddBudgetItemScreen}
        options={{ title: t("nav.addBudgetItem") }}
      />
      <AccountsStack.Screen
        name="EditBudgetItem"
        component={EditBudgetItemScreen}
        options={{ title: t("nav.editBudgetItem") }}
      />
      <AccountsStack.Screen
        name="EditTransaction"
        component={EditTransactionScreen}
        options={{ title: t("nav.editTransaction") }}
      />
    </AccountsStack.Navigator>
  );
}

function AddStackNavigator(): React.JSX.Element {
  const screenOptions = useScreenOptions();
  const { t } = useTranslation();
  return (
    <AddStack.Navigator screenOptions={screenOptions}>
      <AddStack.Screen
        name="AddTransaction"
        component={AddTransactionScreen}
        options={{ title: t("nav.add") }}
      />
      <AddStack.Screen
        name="Transfer"
        component={TransferScreen}
        options={{ title: t("transfer.title") }}
      />
      <AddStack.Screen
        name="Borrowings"
        component={BorrowingsScreen}
        options={{ title: t("nav.borrowings") }}
      />
      <AddStack.Screen
        name="BorrowingDetail"
        component={BorrowingDetailScreen}
        options={{ title: t("nav.borrowingDetail") }}
      />
      <AddStack.Screen
        name="EditTransaction"
        component={EditTransactionScreen}
        options={{ title: t("nav.editTransaction") }}
      />
    </AddStack.Navigator>
  );
}

function ReportsStackNavigator(): React.JSX.Element {
  const screenOptions = useScreenOptions();
  const { t } = useTranslation();
  return (
    <ReportsStack.Navigator screenOptions={screenOptions}>
      <ReportsStack.Screen
        name="ReportsMain"
        component={ReportsScreen}
        options={{ title: t("reports.title") }}
      />
    </ReportsStack.Navigator>
  );
}

function ProfileStackNavigator(): React.JSX.Element {
  const screenOptions = useScreenOptions();
  const { t } = useTranslation();
  return (
    <ProfileStack.Navigator screenOptions={screenOptions}>
      <ProfileStack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{ title: t("profile.title") }}
      />
    </ProfileStack.Navigator>
  );
}

export default function MainNavigator(): React.JSX.Element {
  const resetStackOnTabPress = (e: any, navigation: any) => {
    const state = navigation.getState();
    const route = state.routes.find((r: any) => r.key === e.target);
    if (route?.state?.routes && route.state.routes.length > 1) {
      e.preventDefault();
      const firstRouteName = route.state.routes[0].name;
      navigation.navigate(route.name, { screen: firstRouteName });
    }
  };

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardStackNavigator}
        listeners={({ navigation }) => ({
          tabPress: (e) => resetStackOnTabPress(e, navigation),
        })}
      />
      <Tab.Screen
        name="Accounts"
        component={AccountsStackNavigator}
        listeners={({ navigation }) => ({
          tabPress: (e) => resetStackOnTabPress(e, navigation),
        })}
      />
      <Tab.Screen
        name="Add"
        component={AddStackNavigator}
        options={{
          tabBarLabel: "Add",
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => resetStackOnTabPress(e, navigation),
        })}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsStackNavigator}
        listeners={({ navigation }) => ({
          tabPress: (e) => resetStackOnTabPress(e, navigation),
        })}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        listeners={({ navigation }) => ({
          tabPress: (e) => resetStackOnTabPress(e, navigation),
        })}
      />
    </Tab.Navigator>
  );
}
