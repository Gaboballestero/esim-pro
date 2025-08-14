import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadAppConfig } from './src/config/app';

// 🧹 LIMPIEZA DE STORAGE - Desactivada después del debugging
const FORCE_CLEAR_STORAGE = false;

// Screens
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import PlansScreen from './src/screens/PlansScreen';
import MyESIMsScreen from './src/screens/MyESIMsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import DeveloperScreen from './src/screens/DeveloperScreen';

// Types
import { RootStackParamList, MainTabParamList } from './src/types/navigation';
import { COLORS } from './src/constants/theme';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Plans') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'MyESIMs') {
            iconName = focused ? 'phone-portrait' : 'phone-portrait-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'home-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ tabBarLabel: 'Inicio' }}
      />
      <Tab.Screen 
        name="Plans" 
        component={PlansScreen} 
        options={{ tabBarLabel: 'Planes' }}
      />
      <Tab.Screen 
        name="MyESIMs" 
        component={MyESIMsScreen} 
        options={{ tabBarLabel: 'Mis eSIMs' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ tabBarLabel: 'Perfil' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    checkAppState();
  }, []);

  const checkAppState = async () => {
    try {
      // 🧹 FORZAR LIMPIEZA TOTAL - Temporal para debugging
      if (FORCE_CLEAR_STORAGE) {
        console.log('🧹 FORZANDO LIMPIEZA DE ASYNCSTORAGE...');
        await AsyncStorage.clear();
        console.log('✅ AsyncStorage limpiado completamente');
      }
      
      // Load app configuration
      await loadAppConfig();
      
      const hasLaunched = await AsyncStorage.getItem('hasLaunched');
      const token = await AsyncStorage.getItem('authToken');
      
      setIsFirstLaunch(hasLaunched === null);
      setIsLoggedIn(!!token);
    } catch (error) {
      console.error('Error checking app state:', error);
      setIsFirstLaunch(true);
      setIsLoggedIn(false);
    }
  };

  if (isFirstLaunch === null || isLoggedIn === null) {
    return null; // Loading screen could go here
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ headerShown: false }}
        initialRouteName={
          isFirstLaunch ? 'Welcome' : 
          !isLoggedIn ? 'Login' : 'MainTabs'
        }
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="Developer" component={DeveloperScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
