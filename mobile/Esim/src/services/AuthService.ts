import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginData, RegisterData, User } from '../types';
import { APP_CONFIG, isDemoMode, isFeatureEnabled } from '../config/app';

// Create axios instance
const apiClient = axios.create({
  baseURL: APP_CONFIG.getApiUrl() || undefined,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': 'eSIMPro-Mobile/1.0',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('refreshToken');
    }
    return Promise.reject(error);
  }
);

export class AuthService {
  static async login(data: LoginData): Promise<{ user: User; token: string }> {
    console.log('🔍 Login Debug:');
    console.log('  - isDemoMode():', isDemoMode());
    console.log('  - isFeatureEnabled(REAL_AUTH):', isFeatureEnabled('REAL_AUTH'));
    console.log('  - USE_REAL_API:', APP_CONFIG.USE_REAL_API);
    console.log('  - API URL:', APP_CONFIG.getApiUrl());
    
    if (isDemoMode() || !isFeatureEnabled('REAL_AUTH')) {
      console.log('🎯 Using DEMO mode for login');
      return this.loginDemo(data);
    }
    
    console.log('🌐 Attempting REAL API login...');
    try {
      const response = await apiClient.post('/auth/login/', {
        email: data.email,
        password: data.password
      });
      
      const { user, access, refresh } = response.data;
      
      // Store tokens
      await AsyncStorage.setItem('authToken', access);
      await AsyncStorage.setItem('refreshToken', refresh);
      await AsyncStorage.setItem('userData', JSON.stringify(user));
      
      return { user, token: access };
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Fallback to demo mode if API fails
      if (error.code === 'NETWORK_ERROR' || error.response?.status >= 500) {
        console.log('API not available, falling back to demo mode');
        return this.loginDemo(data);
      }
      
      throw new Error(error.response?.data?.message || 'Credenciales incorrectas');
    }
  }

  static async register(data: RegisterData): Promise<{ user: User; token: string }> {
    console.log('🔍 Register Debug:');
    console.log('  - isDemoMode():', isDemoMode());
    console.log('  - isFeatureEnabled(REAL_AUTH):', isFeatureEnabled('REAL_AUTH'));
    console.log('  - USE_REAL_API:', APP_CONFIG.USE_REAL_API);
    console.log('  - API URL:', APP_CONFIG.getApiUrl());
    
    if (isDemoMode() || !isFeatureEnabled('REAL_AUTH')) {
      console.log('🎯 Using DEMO mode for register');
      return this.registerDemo(data);
    }
    
    console.log('🌐 Attempting REAL API register...');
    try {
      // Transform data to match Django backend expectations
      const backendData = {
        email: data.email,
        username: data.email, // Use email as username
        password: data.password,
        password_confirm: data.password, // Add password confirmation
        phone_number: data.phoneNumber || '',
        first_name: data.firstName,
        last_name: data.lastName,
      };
      
      console.log('Attempting registration with:', JSON.stringify(backendData, null, 2));
      console.log('API URL:', APP_CONFIG.getApiUrl());
      console.log('Full URL:', `${APP_CONFIG.getApiUrl()}/auth/register/`);
      
      const response = await apiClient.post('/auth/register/', backendData);
      const { user, access, refresh } = response.data;
      
      // Store tokens
      await AsyncStorage.setItem('authToken', access);
      await AsyncStorage.setItem('refreshToken', refresh);
      await AsyncStorage.setItem('userData', JSON.stringify(user));
      
      return { user, token: access };
    } catch (error: any) {
      console.error('Register error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config?.url
      });
      
      // Fallback to demo mode if API fails
      if (error.code === 'NETWORK_ERROR' || error.response?.status >= 500) {
        console.log('API not available, falling back to demo mode');
        return this.registerDemo(data);
      }
      
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Error al crear la cuenta';
      throw new Error(errorMessage);
    }
  }

  // Demo mode functions
  private static async loginDemo(data: LoginData): Promise<{ user: User; token: string }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser: User = {
      id: 1,
      email: data.email,
      firstName: 'Usuario',
      lastName: 'Demo',
      phoneNumber: '+1 234 567 8900',
    };
    
    const mockToken = 'demo-token-' + Date.now();
    
    // Store tokens
    await AsyncStorage.setItem('authToken', mockToken);
    await AsyncStorage.setItem('refreshToken', 'demo-refresh-token');
    await AsyncStorage.setItem('userData', JSON.stringify(mockUser));
    await AsyncStorage.setItem('userMode', 'demo');
    
    return { user: mockUser, token: mockToken };
  }

  private static async registerDemo(data: RegisterData): Promise<{ user: User; token: string }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockUser: User = {
      id: 1,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.phoneNumber,
    };
    
    const mockToken = 'demo-token-' + Date.now();
    
    // Store tokens
    await AsyncStorage.setItem('authToken', mockToken);
    await AsyncStorage.setItem('refreshToken', 'demo-refresh-token');
    await AsyncStorage.setItem('userData', JSON.stringify(mockUser));
    await AsyncStorage.setItem('userMode', 'demo');
    
    return { user: mockUser, token: mockToken };
  }

  static async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('refreshToken');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return null;

      const response = await apiClient.get('/auth/user/');
      return response.data;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }

  static async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      return !!token;
    } catch (error) {
      return false;
    }
  }
}
