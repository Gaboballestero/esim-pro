import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '../constants';
import { User, LoginRequest, RegisterRequest, AuthResponse, ApiResponse } from '../types';

class AuthServiceClass {
  private API_URL = API_BASE_URL;
  private TOKEN_KEY = 'auth_token';
  private REFRESH_TOKEN_KEY = 'refresh_token';
  private USER_KEY = 'user_data';
  private FIRST_LAUNCH_KEY = 'has_launched_before';
  
  // MODO DEMO TEMPORAL - Cambiar a false para usar backend real
  private DEMO_MODE = true;

  constructor() {
    // Set up axios interceptors
    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    axios.interceptors.request.use(
      async (config) => {
        const token = await this.getToken();
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
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const refreshToken = await this.getRefreshToken();
            if (refreshToken) {
              const response = await axios.post(`${this.API_URL}/auth/refresh/`, {
                refresh: refreshToken,
              });
              
              const { access } = response.data;
              await this.setToken(access);
              
              // Retry original request
              originalRequest.headers.Authorization = `Bearer ${access}`;
              return axios(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, logout user
            await this.logout();
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    // MODO DEMO: Acepta cualquier credencial
    if (this.DEMO_MODE) {
      const demoUser: User = {
        id: 1,
        email: credentials.email,
        first_name: 'Usuario',
        last_name: 'Demo',
        phone_number: '+1234567890',
        profile: {
          country: 'US',
          preferred_language: 'en',
          notification_preferences: {
            email: true,
            sms: true,
            push: true,
          },
        }
      };

      const demoResponse: AuthResponse = {
        user: demoUser,
        access_token: 'demo_token_123',
        refresh_token: 'demo_refresh_123'
      };

      // Store demo data
      await Promise.all([
        this.setToken(demoResponse.access_token),
        this.setRefreshToken(demoResponse.refresh_token),
        this.setUserData(demoUser),
      ]);

      return demoResponse;
    }

    // MODO REAL: Conecta al backend
    try {
      const response = await axios.post<AuthResponse>(`${this.API_URL}/auth/login/`, credentials);
      const { user, access_token, refresh_token } = response.data;
      
      // Store tokens and user data
      await Promise.all([
        this.setToken(access_token),
        this.setRefreshToken(refresh_token),
        this.setUserData(user),
      ]);
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      // Demo mode: Accept any registration data
      if (this.DEMO_MODE) {
        const demoUser: User = {
          id: Date.now(),
          email: userData.email,
          first_name: userData.first_name || 'Demo',
          last_name: userData.last_name || 'User',
          phone_number: userData.phone_number || '+1234567890',
          profile: {
            country: 'US',
            preferred_language: 'en',
            notification_preferences: {
              email: true,
              sms: true,
              push: true,
            },
          }
        };

        const demoTokens = {
          access_token: 'demo_access_token_' + Date.now(),
          refresh_token: 'demo_refresh_token_' + Date.now(),
        };

        // Store demo tokens and user data
        await Promise.all([
          this.setToken(demoTokens.access_token),
          this.setRefreshToken(demoTokens.refresh_token),
          this.setUserData(demoUser),
        ]);

        return {
          user: demoUser,
          access_token: demoTokens.access_token,
          refresh_token: demoTokens.refresh_token,
        };
      }

      const response = await axios.post<AuthResponse>(`${this.API_URL}/auth/register/`, userData);
      const { user, access_token, refresh_token } = response.data;
      
      // Store tokens and user data
      await Promise.all([
        this.setToken(access_token),
        this.setRefreshToken(refresh_token),
        this.setUserData(user),
      ]);
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  }

  async logout(): Promise<void> {
    try {
      // En modo demo, no intentamos hacer petición al backend
      if (!this.DEMO_MODE) {
        const refreshToken = await this.getRefreshToken();
        if (refreshToken) {
          await axios.post(`${this.API_URL}/auth/logout/`, {
            refresh: refreshToken,
          });
        }
      }
    } catch (error) {
      console.warn('Logout request failed:', error);
    } finally {
      // Clear local storage
      await Promise.all([
        AsyncStorage.removeItem(this.TOKEN_KEY),
        AsyncStorage.removeItem(this.REFRESH_TOKEN_KEY),
        AsyncStorage.removeItem(this.USER_KEY),
      ]);
    }
  }

  async checkAuthStatus(): Promise<boolean> {
    try {
      const token = await this.getToken();
      if (!token) return false;

      // En modo demo, solo verificamos que exista un token
      if (this.DEMO_MODE) {
        return token.startsWith('demo_');
      }

      // Verify token with backend
      const response = await axios.get(`${this.API_URL}/auth/verify/`);
      return response.status === 200;
    } catch (error) {
      // Token is invalid, remove it
      await this.logout();
      return false;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  async updateUser(userData: Partial<User>): Promise<User> {
    try {
      // En modo demo, actualizamos solo localmente
      if (this.DEMO_MODE) {
        const currentUser = await this.getCurrentUser();
        if (currentUser) {
          const updatedUser = { ...currentUser, ...userData };
          await this.setUserData(updatedUser);
          return updatedUser;
        } else {
          throw new Error('No user found');
        }
      }

      const response = await axios.patch<User>(`${this.API_URL}/auth/user/`, userData);
      await this.setUserData(response.data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'User update failed');
    }
  }

  async getProfile(): Promise<ApiResponse<{ user: User }>> {
    try {
      // En modo demo, devolvemos el usuario actual
      if (this.DEMO_MODE) {
        const user = await this.getCurrentUser();
        if (user) {
          return {
            success: true,
            data: { user },
            message: 'Perfil obtenido exitosamente'
          };
        } else {
          return {
            success: false,
            error: 'Usuario no encontrado'
          };
        }
      }

      const response = await axios.get(`${this.API_URL}/users/profile/`);
      return {
        success: true,
        data: response.data,
        message: 'Perfil obtenido exitosamente'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener perfil'
      };
    }
  }

  async updateProfile(profileData: Partial<User>): Promise<ApiResponse<{ user: User }>> {
    try {
      // En modo demo, actualizamos localmente
      if (this.DEMO_MODE) {
        const currentUser = await this.getCurrentUser();
        if (currentUser) {
          const updatedUser = { ...currentUser, ...profileData };
          await this.setUserData(updatedUser);
          return {
            success: true,
            data: { user: updatedUser },
            message: 'Perfil actualizado exitosamente'
          };
        } else {
          return {
            success: false,
            error: 'Usuario no encontrado'
          };
        }
      }

      const response = await axios.put(`${this.API_URL}/users/profile/`, profileData);
      await this.setUserData(response.data.user);
      return {
        success: true,
        data: response.data,
        message: 'Perfil actualizado exitosamente'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al actualizar perfil'
      };
    }
  }

  async changePassword(passwordData: {
    current_password: string;
    new_password: string;
    confirm_password: string;
  }): Promise<ApiResponse<{}>> {
    try {
      // En modo demo, simulamos el cambio de contraseña
      if (this.DEMO_MODE) {
        if (passwordData.new_password !== passwordData.confirm_password) {
          return {
            success: false,
            error: 'Las contraseñas nuevas no coinciden'
          };
        }
        
        // Simular un delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return {
          success: true,
          data: {},
          message: 'Contraseña cambiada exitosamente'
        };
      }

      const response = await axios.post(`${this.API_URL}/users/change-password/`, passwordData);
      return {
        success: true,
        data: response.data,
        message: 'Contraseña cambiada exitosamente'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al cambiar contraseña'
      };
    }
  }

  async getUserStats(): Promise<ApiResponse<any>> {
    try {
      // En modo demo, devolvemos estadísticas simuladas
      if (this.DEMO_MODE) {
        const mockStats = {
          profile: {
            member_since: '2024-01-15',
            is_verified: true,
            total_esims: 3,
            active_esims: 2,
          },
          usage: {
            total_orders: 5,
            total_spent: 125.50,
            preferred_currency: 'USD',
          }
        };
        
        return {
          success: true,
          data: { stats: mockStats },
          message: 'Estadísticas obtenidas exitosamente'
        };
      }

      const response = await axios.get(`${this.API_URL}/users/profile/stats/`);
      return {
        success: true,
        data: response.data,
        message: 'Estadísticas obtenidas exitosamente'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener estadísticas'
      };
    }
  }

  // First launch management
  async hasLaunchedBefore(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(this.FIRST_LAUNCH_KEY);
      return value === 'true';
    } catch (error) {
      return false;
    }
  }

  async setHasLaunchedBefore(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.FIRST_LAUNCH_KEY, 'true');
    } catch (error) {
      console.error('Error setting first launch flag:', error);
    }
  }

  // Token management
  private async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.TOKEN_KEY);
    } catch (error) {
      return null;
    }
  }

  private async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(this.TOKEN_KEY, token);
    } catch (error) {
      console.error('Error setting token:', error);
    }
  }

  private async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.REFRESH_TOKEN_KEY);
    } catch (error) {
      return null;
    }
  }

  private async setRefreshToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(this.REFRESH_TOKEN_KEY, token);
    } catch (error) {
      console.error('Error setting refresh token:', error);
    }
  }

  private async setUserData(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(this.USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error setting user data:', error);
    }
  }
}

export const AuthService = new AuthServiceClass();
