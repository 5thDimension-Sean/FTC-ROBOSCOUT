import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { RootStackParamList, TabParamList } from './types';
import { useTheme } from '../theme/ThemeContext';

import { FavoritesScreen } from '../screens/FavoritesScreen';
import { TrueSkillScreen } from '../screens/TrueSkillScreen';
import { LookupScreen } from '../screens/LookupScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { TeamDetailScreen } from '../screens/TeamDetailScreen';
import { EventDetailScreen } from '../screens/EventDetailScreen';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const TAB_ICONS: Record<keyof TabParamList, keyof typeof Ionicons.glyphMap> = {
  Favorites: 'star',
  TrueSkill: 'podium',
  Lookup: 'search',
  Settings: 'settings',
};

function Tabs() {
  const { palette } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: palette.surface },
        headerTitleStyle: { color: palette.text },
        headerShadowVisible: false,
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.textMuted,
        tabBarStyle: {
          backgroundColor: palette.surface,
          borderTopColor: palette.border,
        },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={TAB_ICONS[route.name]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
      <Tab.Screen
        name="TrueSkill"
        component={TrueSkillScreen}
        options={{ title: 'TrueSkill' }}
      />
      <Tab.Screen name="Lookup" component={LookupScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { palette, isDark } = useTheme();
  const navTheme = isDark ? DarkTheme : DefaultTheme;
  return (
    <NavigationContainer
      theme={{
        ...navTheme,
        colors: {
          ...navTheme.colors,
          background: palette.background,
          card: palette.surface,
          text: palette.text,
          border: palette.border,
          primary: palette.primary,
        },
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: palette.surface },
          headerTitleStyle: { color: palette.text },
          headerTintColor: palette.primary,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: palette.background },
        }}
      >
        <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
        <Stack.Screen
          name="TeamDetail"
          component={TeamDetailScreen}
          options={{ title: 'Team' }}
        />
        <Stack.Screen
          name="EventDetail"
          component={EventDetailScreen}
          options={({ route }) => ({ title: route.params.eventName })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
