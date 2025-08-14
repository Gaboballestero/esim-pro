import AsyncStorage from '@react-native-async-storage/async-storage';

// App Configuration
export const APP_CONFIG = {
  // Toggle between demo and real API
  USE_REAL_API: true, // 🎯 Activar paso a paso: false → true
  
  // API Configuration
  DEMO_MODE: !process.env.NODE_ENV || process.env.NODE_ENV === 'development',
  
  // Backend URLs
  API_URLS: {
    local: 'http://localhost:8000/api',        // Para navegador web
    development: 'http://192.168.100.92:8080/api', // Tu IP local con puerto 8080
    emulator: 'http://10.0.2.2:8000/api',     // Para Android Emulator
    tunnel: 'https://your-tunnel-url.ngrok.io/api', // Se actualizará automáticamente
    production: 'https://your-domain.com/api',
  },
  
  // Get current API URL
  getApiUrl: function() {
    if (!this.USE_REAL_API) return null; // Demo mode
    
    // Detect platform and return appropriate URL
    if (typeof window !== 'undefined') {
      // Running in web browser
      return this.API_URLS.local;
    }
    
    // For mobile devices, prefer tunnel if available
    if (this.API_URLS.tunnel && this.API_URLS.tunnel !== 'https://your-tunnel-url.ngrok.io/api') {
      return this.API_URLS.tunnel;
    }
    
    // Fallback to development URL
    return this.API_URLS.development;
  },
  
  // Feature flags for gradual testing - Activar una por una
  FEATURES: {
    REAL_AUTH: true,      // 🎯 PASO 1: Autenticación real (login/register)
    REAL_PLANS: true,     // 🎯 PASO 2: Planes reales desde backend
    REAL_ESIMS: true,     // 🎯 PASO 3: Gestión real de eSIMs
    PAYMENTS: true,       // 🎯 PASO 4: Sistema de pagos
    PUSH_NOTIFICATIONS: true, // 🎯 PASO 5: Notificaciones ✅ ACTIVADO
  }
};

// Load configuration from storage on app start
export const loadAppConfig = async () => {
  try {
    const savedConfig = await AsyncStorage.getItem('APP_CONFIG');
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig);
      // Always update the IP to current one
      parsed.API_URLS.development = 'http://192.168.100.92:8000/api';
      Object.assign(APP_CONFIG, parsed);
    }
  } catch (error) {
    console.log('No saved config found, using defaults');
  }
};

// Save configuration to storage
export const saveAppConfig = async () => {
  try {
    await AsyncStorage.setItem('APP_CONFIG', JSON.stringify(APP_CONFIG));
  } catch (error) {
    console.error('Error saving config:', error);
  }
};

// Helper functions
export const isFeatureEnabled = (feature: keyof typeof APP_CONFIG.FEATURES) => {
  return APP_CONFIG.FEATURES[feature];
};

export const isDemoMode = () => {
  return !APP_CONFIG.USE_REAL_API;
};
