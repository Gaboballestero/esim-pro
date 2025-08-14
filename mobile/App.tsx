import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';

// Screens
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import ShopScreen from './src/screens/ShopScreen';
import PlansScreen from './src/screens/PlansScreen';
import MyESIMsScreen from './src/screens/MyESIMsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import QRScannerScreen from './src/screens/QRScannerScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import SupportScreen from './src/screens/SupportScreen';
import RewardsScreen from './src/screens/RewardsScreen';
import GeolocationScreen from './src/screens/GeolocationScreen';
import FlexiblePlansScreen from './src/screens/FlexiblePlansScreen';
import AdvancedDashboardScreen from './src/screens/AdvancedDashboardScreen';
import CoverageMapScreen from './src/screens/CoverageMapScreen';
import DataUsageScreen from './src/screens/DataUsageScreen';
import PlanManagementScreen from './src/screens/PlanManagementScreen';
import AIAssistantScreen from './src/screens/AIAssistantScreen';
import NotificationSettingsScreen from './src/screens/NotificationSettingsScreen';
import AccountSettingsScreen from './src/screens/AccountSettingsScreen';
import LiveChatScreen from './src/screens/LiveChatScreen';

import ESIMDetailsScreen from './src/screens/ESIMDetailsScreen';
import ESIMGuideScreen from './src/screens/ESIMGuideScreenSimple';
import QRCodeViewScreen from './src/screens/QRCodeViewScreenSimple';

// Types
import { RootStackParamList, MainTabParamList } from './src/types/navigation';

// Context
import { AuthProvider, useAuth } from './src/contexts/AuthContext';

// Services
import { AuthService } from './src/services/AuthService';
import HablarisNotificationService from './src/services/HablarisNotificationService';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function MainTabs() {
  return (
    <Tab.Navigator
      id="MainTabs"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Shop') {
            iconName = focused ? 'storefront' : 'storefront-outline';
          } else if (route.name === 'MyESIMs') {
            iconName = focused ? 'phone-portrait' : 'phone-portrait-outline';
          } else if (route.name === 'Dashboard') {
            iconName = focused ? 'analytics' : 'analytics-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#667eea',
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: '#667eea',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'Inicio' }}
      />
      <Tab.Screen 
        name="Shop" 
        component={ShopScreen} 
        options={{ title: 'Shop' }}
      />
      <Tab.Screen 
        name="MyESIMs" 
        component={MyESIMsScreen} 
        options={{ title: 'Mis eSIMs' }}
      />
      <Tab.Screen 
        name="Dashboard" 
        component={AdvancedDashboardScreen} 
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'Perfil' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make any API calls you need to do here
        await Font.loadAsync({
          ...Ionicons.font,
        });

        // Initialize notification service
        await HablarisNotificationService.initialize();

      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}

function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null; // o un spinner de carga
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor="#667eea" />
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          gestureEnabled: true,
        }}
      >
        {isAuthenticated ? (
          // Usuario autenticado - mostrar tabs como pantalla principal
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="Shop" component={ShopScreen} />
          </>
        ) : (
          // Usuario no autenticado - mostrar Shop como pantalla principal
          <>
            <Stack.Screen name="Shop" component={ShopScreen} />
            <Stack.Screen name="Main" component={MainTabs} />
          </>
        )}
        
        {/* Pantallas de autenticación disponibles cuando se necesiten */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        
        {/* Otras pantallas disponibles */}
        <Stack.Screen 
          name="QRScanner" 
          component={QRScannerScreen}
          options={{
            headerShown: true,
            title: 'Escanear QR',
            headerStyle: { backgroundColor: '#667eea' },
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen 
          name="Checkout" 
          component={CheckoutScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="Support" 
          component={SupportScreen}
          options={{
            headerShown: true,
            title: 'Ayuda y Soporte',
            headerStyle: { backgroundColor: '#667eea' },
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen 
          name="Rewards" 
          component={RewardsScreen}
          options={{
            headerShown: true,
            title: 'Recompensas',
            headerStyle: { backgroundColor: '#667eea' },
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen 
          name="Geolocation" 
          component={GeolocationScreen}
          options={{
            headerShown: true,
            title: 'Ubicación',
            headerStyle: { backgroundColor: '#667eea' },
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen 
          name="FlexiblePlans" 
          component={FlexiblePlansScreen}
          options={{
            headerShown: true,
            title: 'Planes Flexibles',
            headerStyle: { backgroundColor: '#667eea' },
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen 
          name="AdvancedDashboard" 
          component={AdvancedDashboardScreen}
          options={{
            headerShown: true,
            title: 'Dashboard Avanzado',
            headerStyle: { backgroundColor: '#667eea' },
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen 
          name="Plans" 
          component={PlansScreen}
          options={{
            headerShown: true,
            title: 'Planes eSIM',
            headerStyle: { backgroundColor: '#667eea' },
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen 
          name="CoverageMap" 
          component={CoverageMapScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="DataUsage" 
          component={DataUsageScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="PlanManagement" 
          component={PlanManagementScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="AIAssistant" 
          component={AIAssistantScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="NotificationSettings" 
          component={NotificationSettingsScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="AccountSettings" 
          component={AccountSettingsScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="LiveChat" 
          component={LiveChatScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="ESIMDetails" 
          component={ESIMDetailsScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="ESIMGuide" 
          component={ESIMGuideScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="QRCodeView" 
          component={QRCodeViewScreen}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
