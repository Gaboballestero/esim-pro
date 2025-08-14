import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { AuthUser, AuthTokens, SocialAuthResponse } from './OAuthService';

/**
 * Mock Authentication Service para testing sin backend
 * Versión simplificada con conectividad mejorada
 */
class MockAuthService {
  private static instance: MockAuthService;
  
  // Storage keys
  private readonly USERS_KEY = '@hablaris_mock_users';
  private readonly CURRENT_USER_KEY = '@hablaris_current_user';
  private readonly TOKENS_KEY = '@hablaris_tokens';
  
  // URL del servidor web - IP real de tu computadora
  private getWebApiUrl(): string {
    const isIOS = Platform.OS === 'ios';
    const isDev = __DEV__;
    
    if (isDev) {
      if (isIOS) {
        // iOS Simulator puede usar localhost
        return 'http://localhost:3000/api/auth';
      } else {
        // Android Emulator usa 10.0.2.2
        return 'http://10.0.2.2:3000/api/auth';
      }
    }
    
    // Para dispositivo físico - IP real
    return 'http://172.19.12.69:3000/api/auth';
  }

  // URLs alternativas para probar si falla la principal
  private getAlternativeUrls(): string[] {
    return [
      'http://172.19.12.69:3000/api/auth', // IP real primera
      'http://localhost:3000/api/auth',     // localhost
      'http://10.0.2.2:3000/api/auth',     // Android emulator
      'http://127.0.0.1:3000/api/auth',    // localhost alternativo
    ];
  }

  // Función para probar múltiples URLs
  private async tryConnectToWeb(endpoint: string, options: any): Promise<any> {
    const urls = this.getAlternativeUrls();
    
    for (const baseUrl of urls) {
      try {
        const fullUrl = baseUrl + endpoint.replace('/api/auth', '');
        console.log(`🌐 Intentando conectar a: ${fullUrl}`);
        
        const response = await Promise.race([
          fetch(fullUrl, options),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 5000)
          )
        ]) as Response;
        
        if (response.ok) {
          console.log(`✅ Conexión exitosa a: ${fullUrl}`);
          return await response.json();
        }
        
      } catch (error: any) {
        console.log(`❌ Fallo conexión a: ${baseUrl} - ${error.message}`);
        continue;
      }
    }
    
    throw new Error('No se pudo conectar al servidor web');
  }

  static getInstance(): MockAuthService {
    if (!MockAuthService.instance) {
      MockAuthService.instance = new MockAuthService();
    }
    return MockAuthService.instance;
  }

  private constructor() {
    this.initializeWithWebSync();
    this.startPeriodicSync();
  }

  // Inicialización con sincronización web
  private async initializeWithWebSync(): Promise<void> {
    try {
      await this.ensureDefaultUsers();
      await this.syncWithWebNow();
    } catch (error) {
      console.log('🔄 No se pudo sincronizar con web, usando datos locales');
    }
  }

  // Sincronización periódica cada 30 segundos (más frecuente para testing)
  private startPeriodicSync(): void {
    setInterval(async () => {
      try {
        console.log('🔄 Sincronización automática...');
        await this.syncWithWebNow();
      } catch (error) {
        console.log('⚠️ Error en sincronización automática:', error);
      }
    }, 30 * 1000); // 30 segundos para testing
    
    console.log('⏰ Sincronización automática iniciada (cada 30 segundos)');
  }

  // Sincronizar con web ahora
  private async syncWithWebNow(): Promise<void> {
    try {
      console.log('🔄 Sincronizando con servidor web...');
      
      // Obtener usuarios del servidor web
      const webUsers = await this.tryConnectToWeb('/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_users' })
      });
      
      if (webUsers.success && webUsers.users) {
        console.log(`📥 Obtenidos ${webUsers.users.length} usuarios del servidor`);
        await this.mergeWebUsers(webUsers.users);
      }
      
    } catch (error: any) {
      console.log(`⚠️ Error sincronizando: ${error.message}`);
    }
  }

  // Combinar usuarios del web con locales
  private async mergeWebUsers(webUsers: any[]): Promise<void> {
    const localUsers = await this.getStoredUsers();
    const mergedUsers = [...localUsers];
    
    webUsers.forEach((webUser: any) => {
      const existingIndex = mergedUsers.findIndex(u => u.email === webUser.email);
      
      if (existingIndex >= 0) {
        // Actualizar usuario existente
        mergedUsers[existingIndex] = {
          ...mergedUsers[existingIndex],
          first_name: webUser.firstName,
          last_name: webUser.lastName,
        };
      } else {
        // Agregar nuevo usuario del web
        mergedUsers.push({
          id: webUser.id,
          email: webUser.email,
          password: '123456', // Password temporal para testing
          first_name: webUser.firstName,
          last_name: webUser.lastName,
          created_at: webUser.createdAt,
          is_mobile_user: false,
          source: webUser.source || 'web'
        });
      }
    });
    
    await AsyncStorage.setItem(this.USERS_KEY, JSON.stringify(mergedUsers));
    console.log(`💾 Guardados ${mergedUsers.length} usuarios total`);
  }

  // Asegurar usuarios por defecto
  private async ensureDefaultUsers(): Promise<void> {
    const existingUsers = await this.getStoredUsers();
    
    if (existingUsers.length === 0) {
      const defaultUsers = [
        {
          id: 1,
          email: 'test@hablaris.com',
          password: 'password123',
          first_name: 'Usuario',
          last_name: 'Prueba',
          username: 'test',
          created_at: new Date().toISOString(),
          is_mobile_user: false,
          is_email_verified: true
        },
        {
          id: 2,
          email: 'gabo@gabo.com',
          password: '123456',
          first_name: 'Gabo',
          last_name: 'Test',
          username: 'gabo',
          created_at: new Date().toISOString(),
          is_mobile_user: true,
          is_email_verified: true
        },
        {
          id: 3,
          email: 'jesus@jesus.com',
          password: '123456',
          first_name: 'Jesus',
          last_name: 'Mobile',
          username: 'jesus',
          created_at: new Date().toISOString(),
          is_mobile_user: true,
          is_email_verified: true
        }
      ];
      
      await AsyncStorage.setItem(this.USERS_KEY, JSON.stringify(defaultUsers));
      console.log(`✅ ${defaultUsers.length} usuarios por defecto inicializados`);
    }
  }

  // Obtener usuarios almacenados
  private async getStoredUsers(): Promise<any[]> {
    try {
      const users = await AsyncStorage.getItem(this.USERS_KEY);
      return users ? JSON.parse(users) : [];
    } catch (error) {
      console.error('Error obteniendo usuarios:', error);
      return [];
    }
  }

  // Login de usuario
  async loginUser(credentials: { email: string; password: string }): Promise<SocialAuthResponse> {
    console.log('🔐 Mock: Logging in user with email:', credentials.email);

    // Buscar usuario localmente primero
    const localUsers = await this.getStoredUsers();
    const localUser = localUsers.find(user => 
      user.email === credentials.email && user.password === credentials.password
    );

    if (localUser) {
      console.log('✅ Usuario encontrado localmente');
      
      const authUser: AuthUser = {
        id: localUser.id,
        email: localUser.email,
        username: localUser.email,
        first_name: localUser.first_name,
        last_name: localUser.last_name,
        is_email_verified: true,
      };

      const tokens: AuthTokens = {
        access: `mock_access_token_${Date.now()}`,
        refresh: `mock_refresh_token_${Date.now()}`,
      };

      await AsyncStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(authUser));
      await AsyncStorage.setItem(this.TOKENS_KEY, JSON.stringify(tokens));

      return { user: authUser, tokens };
    }

    // Si no está local, intentar login en web y sincronizar
    console.log('🔄 Usuario no encontrado localmente, sincronizando...');
    
    try {
      await this.syncWithWebNow(); // Sincronizar ahora
      
      // Buscar de nuevo después de sincronizar
      const updatedUsers = await this.getStoredUsers();
      const syncedUser = updatedUsers.find(user => 
        user.email === credentials.email && user.password === credentials.password
      );

      if (syncedUser) {
        console.log('✅ Usuario encontrado después de sincronización');
        
        const authUser: AuthUser = {
          id: syncedUser.id,
          email: syncedUser.email,
          username: syncedUser.email,
          first_name: syncedUser.first_name,
          last_name: syncedUser.last_name,
          is_email_verified: true,
        };

        const tokens: AuthTokens = {
          access: `mock_access_token_${Date.now()}`,
          refresh: `mock_refresh_token_${Date.now()}`,
        };

        await AsyncStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(authUser));
        await AsyncStorage.setItem(this.TOKENS_KEY, JSON.stringify(tokens));

        return { user: authUser, tokens };
      }
    } catch (syncError) {
      console.log('⚠️ Error en sincronización durante login:', syncError);
    }

    throw new Error('Email o contraseña incorrectos. Verifica tu conexión a internet si acabas de registrarte.');
  }

  // Registro de usuario
  async registerUser(userData: {
    email: string;
    password: string;
    password_confirm: string;
    first_name: string;
    last_name: string;
  }): Promise<SocialAuthResponse> {
    console.log('🔐 Mock: Registering user with email:', userData.email);

    if (userData.password !== userData.password_confirm) {
      throw new Error('Las contraseñas no coinciden');
    }

    if (userData.password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }

    const existingUsers = await this.getStoredUsers();
    const userExists = existingUsers.find(user => user.email === userData.email);
    
    if (userExists) {
      throw new Error('Ya existe una cuenta con este email');
    }

    const newUser: AuthUser = {
      id: Date.now(),
      email: userData.email,
      username: userData.email,
      first_name: userData.first_name,
      last_name: userData.last_name,
      is_email_verified: true,
    };

    const userForStorage = { 
      ...newUser, 
      password: userData.password,
      is_mobile_user: true,
      created_at: new Date().toISOString()
    };
    
    const updatedUsers = [...existingUsers, userForStorage];
    await AsyncStorage.setItem(this.USERS_KEY, JSON.stringify(updatedUsers));

    // Intentar registrar también en web
    try {
      await this.tryConnectToWeb('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          firstName: userData.first_name,
          lastName: userData.last_name
        })
      });
      console.log('✅ Usuario también registrado en web');
    } catch (webError) {
      console.log('⚠️ No se pudo registrar en web (continuando con registro local):', webError);
    }

    const tokens: AuthTokens = {
      access: `mock_access_token_${Date.now()}`,
      refresh: `mock_refresh_token_${Date.now()}`,
    };

    await AsyncStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(newUser));
    await AsyncStorage.setItem(this.TOKENS_KEY, JSON.stringify(tokens));

    console.log('✅ Mock: User registered successfully:', newUser.email);
    return { user: newUser, tokens };
  }

  // Obtener usuario actual
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const user = await AsyncStorage.getItem(this.CURRENT_USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error obteniendo usuario actual:', error);
      return null;
    }
  }

  // Logout
  async logout(): Promise<void> {
    await AsyncStorage.removeItem(this.CURRENT_USER_KEY);
    await AsyncStorage.removeItem(this.TOKENS_KEY);
    console.log('✅ Mock: User logged out');
  }

  // Forzar sincronización manual
  async forceSyncNow(): Promise<void> {
    console.log('🔄 Forzando sincronización manual...');
    await this.syncWithWebNow();
  }
}

export default MockAuthService.getInstance();
