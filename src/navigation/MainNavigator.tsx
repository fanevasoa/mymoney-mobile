/**
 * Main Navigator
 *
 * Bottom tab navigator with nested stack navigators for authenticated users.
 */

import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

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
  return (
    <DashboardStack.Navigator screenOptions={screenOptions}>
      <DashboardStack.Screen
        name="DashboardMain"
        component={DashboardScreen}
        options={{ title: "Dashboard" }}
      />
      <DashboardStack.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{ title: "Transactions" }}
      />
      <DashboardStack.Screen
        name="AccountDetail"
        component={AccountDetailScreen}
        options={{ title: "Account Details" }}
      />
    </DashboardStack.Navigator>
  );
}

function AccountsStackNavigator(): React.JSX.Element {
  const screenOptions = useScreenOptions();
  return (
    <AccountsStack.Navigator screenOptions={screenOptions}>
      <AccountsStack.Screen
        name="AccountsMain"
        component={AccountsScreen}
        options={{ title: "Accounts" }}
      />
      <AccountsStack.Screen
        name="AccountDetail"
        component={AccountDetailScreen}
        options={{ title: "Account Details" }}
      />
      <AccountsStack.Screen
        name="AddAccount"
        component={AddAccountScreen}
        options={{ title: "Add Account" }}
      />
    </AccountsStack.Navigator>
  );
}

function AddStackNavigator(): React.JSX.Element {
  const screenOptions = useScreenOptions();
  return (
    <AddStack.Navigator screenOptions={screenOptions}>
      <AddStack.Screen
        name="AddTransaction"
        component={AddTransactionScreen}
        options={{ title: "Add Transaction" }}
      />
      <AddStack.Screen
        name="Transfer"
        component={TransferScreen}
        options={{ title: "Transfer" }}
      />
    </AddStack.Navigator>
  );
}

function ReportsStackNavigator(): React.JSX.Element {
  const screenOptions = useScreenOptions();
  return (
    <ReportsStack.Navigator screenOptions={screenOptions}>
      <ReportsStack.Screen
        name="ReportsMain"
        component={ReportsScreen}
        options={{ title: "Reports" }}
      />
    </ReportsStack.Navigator>
  );
}

function ProfileStackNavigator(): React.JSX.Element {
  const screenOptions = useScreenOptions();
  return (
    <ProfileStack.Navigator screenOptions={screenOptions}>
      <ProfileStack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{ title: "Profile" }}
      />
    </ProfileStack.Navigator>
  );
}

export default function MainNavigator(): React.JSX.Element {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardStackNavigator} />
      <Tab.Screen name="Accounts" component={AccountsStackNavigator} />
      <Tab.Screen
        name="Add"
        component={AddStackNavigator}
        options={{
          tabBarLabel: "Add",
        }}
      />
      <Tab.Screen name="Reports" component={ReportsStackNavigator} />
      <Tab.Screen name="Profile" component={ProfileStackNavigator} />
    </Tab.Navigator>
  );
}
