import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import OAuthService, { AuthUser } from '../services/OAuthService';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  loginWithApple: () => Promise<boolean>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<boolean>;
}

interface RegisterData {
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const isAuth = await OAuthService.isAuthenticated();
      if (isAuth) {
        const storedUser = await OAuthService.getStoredUser();
        setUser(storedUser);
      }
    } catch (error) {
      console.error('Check auth status error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 Logging in with email:', email);
      setIsLoading(true);
      const authResponse = await OAuthService.loginWithEmail(email, password);
      if (authResponse && authResponse.user) {
        setUser(authResponse.user);
        await OAuthService.storeUser(authResponse.user);
        console.log('✅ Login successful, user set:', authResponse.user.email);
        
        // Asegurar que el estado se actualice inmediatamente
        setIsLoading(false);
        return true;
      }
      console.log('❌ Login failed: no user returned');
      return false;
    } catch (error: any) {
      console.error('❌ Login error:', error.message || error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const authUser = await OAuthService.signInWithGoogle();
      if (authUser) {
        setUser(authUser);
        await OAuthService.storeUser(authUser);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Google login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithApple = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const authUser = await OAuthService.signInWithApple();
      if (authUser) {
        setUser(authUser);
        await OAuthService.storeUser(authUser);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Apple login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await OAuthService.logout();
      setUser(null);
      // Limpiar también la sesión del mock service si se está usando
      const MockAuthService = (await import('../services/MockAuthService')).default;
      await MockAuthService.clearSession();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setIsLoading(true);
      const authResponse = await OAuthService.registerWithEmail(userData);
      if (authResponse && authResponse.user) {
        setUser(authResponse.user);
        await OAuthService.storeUser(authResponse.user);
        console.log('✅ Registration successful:', authResponse.user.email);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    loginWithGoogle,
    loginWithApple,
    logout,
    register,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
