import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OAuthService, { AuthUser } from '../services/OAuthService';

interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
    error: null,
  });

  // Verificar estado de autenticación al iniciar
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const isSignedIn = await OAuthService.isSignedIn();
      
      if (isSignedIn) {
        const user = await OAuthService.getCurrentUser();
        setAuthState({
          isAuthenticated: true,
          user,
          loading: false,
          error: null,
        });
      } else {
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false,
          error: null,
        });
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: 'Error verificando autenticación',
      });
    }
  };

  const signIn = useCallback(async (user: AuthUser) => {
    setAuthState({
      isAuthenticated: true,
      user,
      loading: false,
      error: null,
    });
  }, []);

  const signOut = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      
      await OAuthService.signOut();
      
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error signing out:', error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: 'Error al cerrar sesión',
      }));
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const user = await OAuthService.getCurrentUser();
      setAuthState(prev => ({ ...prev, user }));
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  }, []);

  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...authState,
    signIn,
    signOut,
    refreshUser,
    checkAuthStatus,
    clearError,
  };
};

export default useAuth;
