import * as AuthSession from 'expo-auth-session';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants';
import MockAuthService from './MockAuthService';

export interface AuthUser {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  profile_picture?: string;
  is_email_verified: boolean;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface SocialAuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

class OAuthService {
  private static instance: OAuthService;
  private isGoogleConfigured = false;
  
  // Development flag - set to true to use mock authentication without backend
  private readonly USE_MOCK_AUTH = true;

  // Google OAuth configuration
  private readonly googleConfig = {
    clientId: 'YOUR_GOOGLE_CLIENT_ID', // TODO: Add from Google Console
    scopes: ['openid', 'profile', 'email'],
  };

  static getInstance(): OAuthService {
    if (!OAuthService.instance) {
      OAuthService.instance = new OAuthService();
    }
    return OAuthService.instance;
  }

  private constructor() {
    this.configureGoogle();
  }

  private configureGoogle() {
    // No additional configuration needed for Expo AuthSession
    this.isGoogleConfigured = true;
  }

  async signInWithGoogle(): Promise<AuthUser | null> {
    try {
      if (!this.isGoogleConfigured) {
        throw new Error('Google Sign-In not configured');
      }

      // Create Google OAuth request
      const request = new AuthSession.AuthRequest({
        clientId: this.googleConfig.clientId,
        scopes: this.googleConfig.scopes,
        redirectUri: AuthSession.makeRedirectUri({
          scheme: 'com.esimpro.mobile'
        }),
        responseType: AuthSession.ResponseType.Code,
        extraParams: {
          access_type: 'offline',
        },
      });

      const result = await request.promptAsync({
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      });

      if (result.type === 'success') {
        const { code } = result.params;
        
        // Exchange code for tokens with backend
        const response = await fetch(`${API_BASE_URL}/auth/google/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code: code,
            redirect_uri: AuthSession.makeRedirectUri({
              scheme: 'com.esimpro.mobile'
            }),
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Google sign-in failed');
        }

        const data = await response.json();
        
        // Store tokens
        await this.storeTokens(data.tokens);
        
        return data.user;
      }

      return null;
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('cancelled')) {
          throw new Error('Google sign-in was cancelled');
        } else if (error.message.includes('network')) {
          throw new Error('Network error. Please check your connection.');
        }
      }
      
      throw new Error('Google sign-in failed. Please try again.');
    }
  }

  async signInWithApple(): Promise<AuthUser | null> {
    try {
      // Check if Apple Authentication is available
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      if (!isAvailable) {
        throw new Error('Apple Sign-In is not available on this device');
      }

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      // Send to backend
      const response = await fetch(`${API_BASE_URL}/auth/apple/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identity_token: credential.identityToken,
          authorization_code: credential.authorizationCode,
          user_id: credential.user,
          email: credential.email,
          full_name: credential.fullName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Apple sign-in failed');
      }

      const data = await response.json();
      
      // Store tokens
      await this.storeTokens(data.tokens);
      
      return data.user;
    } catch (error) {
      console.error('Apple Sign-In Error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('cancelled')) {
          throw new Error('Apple sign-in was cancelled');
        }
      }
      
      throw new Error('Apple sign-in failed. Please try again.');
    }
  }

  async logout(): Promise<void> {
    try {
      // Use mock service if enabled
      if (this.USE_MOCK_AUTH) {
        await MockAuthService.clearSession();
        return;
      }
      
      // Clear stored tokens
      await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user_data']);
      
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Logout Error:', error);
      throw new Error('Failed to logout. Please try again.');
    }
  }

  async refreshAccessToken(): Promise<string | null> {
    try {
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh: refreshToken,
        }),
      });

      if (!response.ok) {
        // Refresh token is invalid, user needs to login again
        await this.logout();
        throw new Error('Session expired. Please login again.');
      }

      const data = await response.json();
      await AsyncStorage.setItem('access_token', data.access);
      
      return data.access;
    } catch (error) {
      console.error('Token Refresh Error:', error);
      throw error;
    }
  }

  async getStoredTokens(): Promise<AuthTokens | null> {
    try {
      const accessToken = await AsyncStorage.getItem('access_token');
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      
      if (accessToken && refreshToken) {
        return {
          access: accessToken,
          refresh: refreshToken,
        };
      }
      
      return null;
    } catch (error) {
      console.error('Get Stored Tokens Error:', error);
      return null;
    }
  }

  async getStoredUser(): Promise<AuthUser | null> {
    try {
      // Use mock service if enabled
      if (this.USE_MOCK_AUTH) {
        return await MockAuthService.getCurrentUser();
      }
      
      const userData = await AsyncStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Get Stored User Error:', error);
      return null;
    }
  }

  async storeTokens(tokens: AuthTokens): Promise<void> {
    try {
      await AsyncStorage.multiSet([
        ['access_token', tokens.access],
        ['refresh_token', tokens.refresh],
      ]);
    } catch (error) {
      console.error('Store Tokens Error:', error);
      throw new Error('Failed to store authentication tokens');
    }
  }

  async storeUser(user: AuthUser): Promise<void> {
    try {
      await AsyncStorage.setItem('user_data', JSON.stringify(user));
    } catch (error) {
      console.error('Store User Error:', error);
      throw new Error('Failed to store user data');
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      // Use mock service if enabled
      if (this.USE_MOCK_AUTH) {
        return await MockAuthService.isAuthenticated();
      }
      
      const tokens = await this.getStoredTokens();
      return !!tokens?.access;
    } catch (error) {
      console.error('Is Authenticated Error:', error);
      return false;
    }
  }

  async makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    try {
      let accessToken = await AsyncStorage.getItem('access_token');
      
      if (!accessToken) {
        throw new Error('No access token available');
      }

      // Add authorization header
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        ...options.headers,
      };

      let response = await fetch(url, {
        ...options,
        headers,
      });

      // If token expired, try to refresh
      if (response.status === 401) {
        accessToken = await this.refreshAccessToken();
        
        if (accessToken) {
          // Retry with new token
          response = await fetch(url, {
            ...options,
            headers: {
              ...headers,
              'Authorization': `Bearer ${accessToken}`,
            },
          });
        }
      }

      return response;
    } catch (error) {
      console.error('Authenticated Request Error:', error);
      throw error;
    }
  }

  // Traditional Email/Password Authentication
  async registerWithEmail(userData: {
    email: string;
    password: string;
    password_confirm: string;
    first_name: string;
    last_name: string;
  }): Promise<SocialAuthResponse | null> {
    try {
      console.log('🔐 Registering user with email:', userData.email);

      // Use mock service if enabled
      if (this.USE_MOCK_AUTH) {
        console.log('📱 Using mock authentication service');
        return await MockAuthService.registerUser(userData);
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          password_confirm: userData.password_confirm,
          first_name: userData.first_name,
          last_name: userData.last_name,
        }),
      });

      const data = await response.json();

      if (response.ok && data.user && data.tokens) {
        console.log('✅ Registration successful');
        
        // Store tokens
        await this.storeTokens(data.tokens);
        
        return data;
      } else {
        console.error('❌ Registration failed:', data);
        throw new Error(data.detail || data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      // If network error and mock is available, fallback to mock
      if (this.USE_MOCK_AUTH && error instanceof Error && error.message.includes('Network request failed')) {
        console.log('📱 Network failed, falling back to mock authentication');
        return await MockAuthService.registerUser(userData);
      }
      
      throw error;
    }
  }

  async loginWithEmail(email: string, password: string): Promise<SocialAuthResponse | null> {
    try {
      console.log('🔐 Logging in with email:', email);

      // Use mock service if enabled
      if (this.USE_MOCK_AUTH) {
        console.log('📱 Using mock authentication service');
        return await MockAuthService.loginUser({ email, password });
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.user && data.tokens) {
        console.log('✅ Login successful');
        
        // Store tokens
        await this.storeTokens(data.tokens);
        
        return data;
      } else {
        console.error('❌ Login failed:', data);
        throw new Error(data.detail || data.error || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // If network error and mock is available, fallback to mock
      if (this.USE_MOCK_AUTH && error instanceof Error && error.message.includes('Network request failed')) {
        console.log('📱 Network failed, falling back to mock authentication');
        return await MockAuthService.loginUser(email, password);
      }
      
      throw error;
    }
  }

  // Platform-specific availability checks
  async isGoogleSignInAvailable(): Promise<boolean> {
    return this.isGoogleConfigured;
  }

  async isAppleSignInAvailable(): Promise<boolean> {
    return await AppleAuthentication.isAvailableAsync();
  }

  // Development utilities
  async clearMockData(): Promise<void> {
    if (this.USE_MOCK_AUTH) {
      await MockAuthService.clearAllData();
      console.log('🧹 Mock data cleared');
    }
  }

  isMockModeEnabled(): boolean {
    return this.USE_MOCK_AUTH;
  }
}

export default OAuthService.getInstance();
