// ─────────────────────────────────────────────────────────────
//  RaPaX™ Mobile — Navigation
// ─────────────────────────────────────────────────────────────
import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Colors, Typography, Spacing } from '../theme';

import ShopScreen     from '../screens/ShopScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import OperatorScreen from '../screens/OperatorScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

const screenOptions = {
  headerStyle:     { backgroundColor: Colors.blackSoft },
  headerTintColor: Colors.gold,
  headerTitleStyle:{ fontWeight: Typography.bold, letterSpacing: 1 },
  headerShadowVisible: false,
  contentStyle:    { backgroundColor: Colors.black },
};

// ── Buyer stack: Shop → Checkout ──────────────────────────────
function BuyerStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Shop"
        component={ShopScreen}
        options={{ title: 'RaPaX™ STORE' }}
      />
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{ title: 'CHECKOUT' }}
      />
    </Stack.Navigator>
  );
}

// ── Tab icons (emoji-based, no icon library dependency) ───────
function TabIcon({ emoji, focused }) {
  return (
    <Text style={{ fontSize: focused ? 22 : 18, opacity: focused ? 1 : 0.5 }}>
      {emoji}
    </Text>
  );
}

// ── Root tab navigator ────────────────────────────────────────
export default function AppNavigator() {
  return (
    <NavigationContainer
      theme={{
        dark: true,
        colors: {
          primary:    Colors.gold,
          background: Colors.black,
          card:       Colors.blackSoft,
          text:       Colors.white,
          border:     Colors.blackBorder,
          notification: Colors.gold,
        },
      }}
    >
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor:  Colors.blackSoft,
            borderTopColor:   Colors.blackBorder,
            borderTopWidth:   1,
            paddingBottom:    Spacing.sm,
            paddingTop:       Spacing.xs,
            height:           60,
          },
          tabBarActiveTintColor:   Colors.gold,
          tabBarInactiveTintColor: Colors.whiteDim,
          tabBarLabelStyle: {
            fontSize:     Typography.xs,
            fontWeight:   Typography.semibold,
            letterSpacing: 0.5,
            marginTop:    2,
          },
        }}
      >
        <Tab.Screen
          name="Store"
          component={BuyerStack}
          options={{
            tabBarLabel: 'STORE',
            tabBarIcon: ({ focused }) => <TabIcon emoji="🛒" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="Operator"
          component={OperatorScreen}
          options={{
            title:      'OPERATOR',
            tabBarLabel:'OPERATOR',
            tabBarIcon: ({ focused }) => <TabIcon emoji="⚡" focused={focused} />,
            headerShown: true,
            headerStyle:      { backgroundColor: Colors.blackSoft },
            headerTintColor:  Colors.gold,
            headerTitleStyle: { fontWeight: Typography.bold, letterSpacing: 1 },
            headerShadowVisible: false,
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title:      'SETTINGS',
            tabBarLabel:'SETTINGS',
            tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" focused={focused} />,
            headerShown: true,
            headerStyle:      { backgroundColor: Colors.blackSoft },
            headerTintColor:  Colors.gold,
            headerTitleStyle: { fontWeight: Typography.bold, letterSpacing: 1 },
            headerShadowVisible: false,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
