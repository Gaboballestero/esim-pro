import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { AuthUser, AuthTokens, SocialAuthResponse } from './OAuthService';

/**
 * Mock Authentication Service for testing without backend
 * Simulates user registration and login with local storage
 * Sincronizado con el frontend web
 */
class MockAuthService {
  private static instance: MockAuthService;
  
  // Storage keys
  private readonly USERS_KEY = '@hablaris_mock_users';
  private readonly CURRENT_USER_KEY = '@hablaris_current_user';
  private readonly TOKENS_KEY = '@hablaris_tokens';
  
  // URLs para diferentes entornos
  private getWebApiUrl(): string {
    // Detectar entorno automáticamente
    const isIOS = Platform.OS === 'ios';
    const isDev = __DEV__;
    
    if (isDev) {
      if (isIOS) {
        // iOS Simulator puede usar localhost
        return 'http://localhost:3000/api/auth';
      } else {
        // Android Emulator necesita 10.0.2.2
        // Si falla, también intentará con IP local
        return 'http://10.0.2.2:3000/api/auth';
      }
    }
    
    // Para producción o dispositivo físico
    // Usar IP real de tu computadora
    return 'http://172.19.12.69:3000/api/auth';
  }

  // URLs alternativas para probar si falla la principal
  private getAlternativeUrls(): string[] {
    const isIOS = Platform.OS === 'ios';
    const urls = [];
    
    if (isIOS) {
      urls.push('http://localhost:3000/api/auth');
      urls.push('http://127.0.0.1:3000/api/auth');
    } else {
      urls.push('http://10.0.2.2:3000/api/auth');
      urls.push('http://localhost:3000/api/auth');
    }
    
    // Agregar IP real y comunes como fallback
    urls.push('http://172.19.12.69:3000/api/auth'); // IP real
    urls.push('http://192.168.1.100:3000/api/auth');
    urls.push('http://192.168.0.100:3000/api/auth');
    urls.push('http://10.0.0.100:3000/api/auth');
    
    return urls;
  }

  // Función para probar conectividad con múltiples URLs
  private async tryMultipleUrls(endpoint: string, options: any): Promise<Response> {
    const urls = [this.getWebApiUrl(), ...this.getAlternativeUrls()];
    let lastError: any = null;
    
    for (const baseUrl of urls) {
      try {
        const fullUrl = baseUrl.replace('/api/auth', '') + endpoint;
        console.log(`🌐 Intentando conectar a: ${fullUrl}`);
        
        const response = await fetch(fullUrl, {
          ...options,
          timeout: 5000, // 5 segundos timeout
        });
        
        if (response.ok || response.status < 500) {
          console.log(`✅ Conexión exitosa a: ${fullUrl}`);
          return response;
        }
        
      } catch (error: any) {
        console.log(`❌ Fallo conexión a: ${baseUrl} - ${error.message}`);
        lastError = error;
        continue;
      }
    }
    
    throw lastError || new Error('No se pudo conectar a ninguna URL');
  }

  static getInstance(): MockAuthService {
    if (!MockAuthService.instance) {
      MockAuthService.instance = new MockAuthService();
    }
    return MockAuthService.instance;
  }

  private constructor() {
    this.initializeWithWebSync();
    this.startPeriodicSync(); // Iniciar sincronización periódica
  }

  /**
   * Iniciar sincronización periódica automática
   */
  private startPeriodicSync(): void {
    // Sincronización cada 2 minutos
    setInterval(async () => {
      try {
        console.log('🔄 Sincronización periódica automática...');
        await this.autoSyncWithWeb();
      } catch (error) {
        console.log('⚠️ Error en sincronización periódica:', error);
      }
    }, 2 * 60 * 1000); // 2 minutos
    
    console.log('⏰ Sincronización periódica iniciada (cada 2 minutos)');
  }
    const urls = [this.getWebApiUrl(), ...this.getAlternativeUrls()];
    const uniqueUrls = [...new Set(urls)]; // Eliminar duplicados
    
    for (let i = 0; i < uniqueUrls.length; i++) {
      const baseUrl = uniqueUrls[i].replace('/api/auth', '');
      const fullUrl = `${baseUrl}${endpoint}`;
      
      try {
        console.log(`🌐 Intentando conectar a: ${fullUrl} (${i + 1}/${uniqueUrls.length})`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        const response = await fetch(fullUrl, {
          ...options,
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          console.log(`✅ Conexión exitosa con: ${fullUrl}`);
          return response;
        } else {
          console.log(`⚠️ Respuesta no exitosa de ${fullUrl}: ${response.status}`);
        }
      } catch (error: any) {
        console.log(`❌ Error conectando a ${fullUrl}: ${error.message}`);
        if (i === uniqueUrls.length - 1) {
          // Si es el último intento, lanzar el error
          throw new Error(`No se pudo conectar a ningún servidor. Último error: ${error.message}`);
        }
        // Continuar con la siguiente URL
      }
    }
    
    throw new Error('No se pudo conectar a ningún servidor disponible');
  }

  /**
   * Autodetectar la URL funcional del servidor
   */
  async autoDetectServerUrl(): Promise<string> {
    const urls = [this.getWebApiUrl(), ...this.getAlternativeUrls()];
    const uniqueUrls = [...new Set(urls)];
    
    for (const url of uniqueUrls) {
      try {
        const baseUrl = url.replace('/api/auth', '');
        const testUrl = `${baseUrl}/api/auth/sync`;
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch(testUrl, {
          method: 'GET',
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          console.log(`✅ Servidor detectado en: ${baseUrl}`);
          return url;
        }
      } catch (error) {
        // Continuar con la siguiente URL
      }
    }
    
    throw new Error('No se pudo detectar ningún servidor funcional');
  }

  /**
   * Iniciar sincronización periódica automática
   */
  private startPeriodicSync(): void {
    // Sincronización cada 2 minutos
    setInterval(async () => {
      try {
        console.log('🔄 Sincronización periódica automática...');
        await this.autoSyncWithWeb();
      } catch (error) {
        console.log('⚠️ Error en sincronización periódica:', error);
      }
    }, 2 * 60 * 1000); // 2 minutos
    
    console.log('⏰ Sincronización periódica iniciada (cada 2 minutos)');
  }

  /**
   * Inicializar y sincronizar con usuarios de la web
   */
  private async initializeWithWebSync(): Promise<void> {
    try {
      // Primero, asegurar que tenemos usuarios por defecto (para modo offline)
      await this.ensureDefaultUsers();
      
      // Intentar auto-sincronización mejorada
      await this.autoSyncWithWeb();
    } catch (error) {
      console.log('🔄 No se pudo auto-sincronizar, usando datos locales');
      // Si falla, continuar con datos locales que ya están inicializados
    }
  }

  /**
   * Asegurar que existen usuarios por defecto para modo offline
   */
  private async ensureDefaultUsers(): Promise<void> {
    const existingUsers = await this.getStoredUsers();
    
    if (existingUsers.length === 0) {
      console.log('📱 Inicializando usuarios por defecto...');
      
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
          email: 'admin@hablaris.com',
          password: 'admin123',
          first_name: 'Admin',
          last_name: 'Hablaris',
          username: 'admin',
          created_at: new Date().toISOString(),
          is_mobile_user: false,
          is_email_verified: true
        },
        {
          id: 3,
          email: 'demo@demo.com',
          password: 'demo123',
          first_name: 'Demo',
          last_name: 'User',
          username: 'demo',
          created_at: new Date().toISOString(),
          is_mobile_user: false,
          is_email_verified: true
        },
        {
          id: 4,
          email: 'user@test.com',
          password: '123456',
          first_name: 'Test',
          last_name: 'User',
          username: 'user',
          created_at: new Date().toISOString(),
          is_mobile_user: false,
          is_email_verified: true
        }
      ];
      
      await AsyncStorage.setItem(this.USERS_KEY, JSON.stringify(defaultUsers));
      console.log(`✅ ${defaultUsers.length} usuarios por defecto inicializados`);
    }
  }

  /**
   * Sincronización automática bidireccional mejorada
   */
  async autoSyncWithWeb(): Promise<void> {
    try {
      console.log('🔄 Iniciando auto-sincronización bidireccional...');
      
      // Obtener usuarios locales
      const localUsers = await this.getStoredUsers();
      console.log(`📱 Usuarios locales: ${localUsers.length}`);
      
      // Obtener última sincronización
      const lastSync = await AsyncStorage.getItem('@hablaris_last_sync');
      const lastSyncTime = lastSync || new Date(0).toISOString();
      
      const webApiUrl = this.getWebApiUrl();
      
      // Usar el nuevo endpoint de auto-sincronización
      const response = await fetch(`${webApiUrl}/auto-sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'full_sync',
          users: localUsers,
          lastSync: lastSyncTime
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log(`✅ Auto-sincronización exitosa: ${data.message}`);
          
          // Actualizar usuarios locales con datos de la web
          if (data.data && data.data.usersForMobile) {
            await this.updateLocalUsersFromWeb(data.data.usersForMobile);
          }
          
          // Guardar timestamp de última sincronización
          await AsyncStorage.setItem('@hablaris_last_sync', data.data.lastSyncTime);
          
          console.log(`📊 Estadísticas finales: ${JSON.stringify(data.data.stats)}`);
        }
      } else {
        console.log('⚠️ Error en respuesta de auto-sync, intentando método legacy...');
        await this.syncWithWeb(); // Fallback al método anterior
      }
      
    } catch (error) {
      console.log('❌ Error en auto-sincronización:', error);
      // Intentar sincronización legacy como fallback
      try {
        await this.syncWithWeb();
      } catch (fallbackError) {
        console.log('❌ También falló sincronización legacy:', fallbackError);
      }
    }
  }

  /**
   * Actualizar usuarios locales con datos de la web
   */
  private async updateLocalUsersFromWeb(webUsers: any[]): Promise<void> {
    try {
      const localUsers = await this.getStoredUsers();
      const updatedUsers = [...localUsers];
      
      webUsers.forEach((webUser: any) => {
        const existingIndex = updatedUsers.findIndex(u => u.email === webUser.email);
        
        if (existingIndex >= 0) {
          // Actualizar usuario existente (mantener contraseña local si existe)
          updatedUsers[existingIndex] = {
            ...updatedUsers[existingIndex],
            first_name: webUser.firstName,
            last_name: webUser.lastName,
            // Mantener contraseña local si existe, sino usar temporal
            id: webUser.id // Actualizar ID si cambió
          };
        } else {
          // Agregar nuevo usuario de la web
          updatedUsers.push({
            id: webUser.id,
            email: webUser.email,
            password: 'web_sync_temp', // Temporal hasta que el usuario haga login
            first_name: webUser.firstName,
            last_name: webUser.lastName,
            created_at: webUser.createdAt,
            is_mobile_user: false,
            needs_password_update: true
          });
        }
      });
      
      await AsyncStorage.setItem(this.USERS_KEY, JSON.stringify(updatedUsers));
      console.log(`💾 Actualizados ${updatedUsers.length} usuarios locales`);
      
    } catch (error) {
      console.log('❌ Error actualizando usuarios locales:', error);
    }
  }

  /**
   * Sincronizar usuarios con el frontend web (método legacy)
   */
  async syncWithWeb(): Promise<void> {
    try {
      console.log('🔄 Sincronizando usuarios con web...');
      
      // Primero obtener usuarios locales
      const localUsers = await this.getStoredUsers();
      console.log(`📱 Usuarios locales: ${localUsers.length}`);
      
      // 1. Enviar usuarios locales a la web
      if (localUsers.length > 0) {
        await this.sendLocalUsersToWeb(localUsers);
      }
      
      // 2. Obtener usuarios de la web
      const webApiUrl = this.getWebApiUrl();
      const response = await fetch(`${webApiUrl}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'get_users'
        }),
        timeout: 10000, // 10 segundos timeout
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.users) {
          console.log(`🌐 Obtenidos ${data.users.length} usuarios de la web`);
          
          // Combinar usuarios sin duplicados
          const combinedUsers = [...localUsers];
          
          data.users.forEach((webUser: any) => {
            const exists = combinedUsers.find(u => u.email === webUser.email);
            if (!exists) {
              // Agregar usuario de la web (con contraseña temporal para permitir login)
              combinedUsers.push({
                id: webUser.id,
                email: webUser.email,
                password: 'web_sync_temp', // Contraseña temporal - se actualizará en primer login
                first_name: webUser.firstName,
                last_name: webUser.lastName,
                created_at: webUser.createdAt,
                is_mobile_user: false,
                needs_password_update: true // Flag para actualizar contraseña
              });
            }
          });
          
          // Guardar usuarios combinados
          await AsyncStorage.setItem(this.USERS_KEY, JSON.stringify(combinedUsers));
          console.log(`💾 Guardados ${combinedUsers.length} usuarios combinados`);
        }
      }
    } catch (error) {
      console.log('⚠️ Error en sincronización con web:', error);
    }
  }

  /**
   * Enviar usuarios locales a la web
   */
  private async sendLocalUsersToWeb(localUsers: any[]): Promise<void> {
    try {
      if (localUsers.length === 0) return;
      
      console.log(`📤 Enviando ${localUsers.length} usuarios locales a la web`);
      
      // Formatear usuarios para la web
      const usersForWeb = localUsers
        .filter(u => u.is_mobile_user !== false) // Solo enviar usuarios que se crearon en móvil
        .map(u => ({
          id: u.id,
          email: u.email,
          password: u.password,
          firstName: u.first_name,
          lastName: u.last_name,
          createdAt: u.created_at
        }));
      
      if (usersForWeb.length === 0) {
        console.log('📤 No hay usuarios móvil nuevos para enviar');
        return;
      }
      
      const webApiUrl = this.getWebApiUrl();
      const response = await fetch(`${webApiUrl}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'send_users',
          users: usersForWeb 
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Sincronización con web completada:', data.message);
      } else {
        console.log('⚠️ Error en respuesta de sincronización web');
      }
    } catch (error) {
      console.log('⚠️ Error enviando usuarios a web:', error);
    }
  }

  /**
   * Intentar login en la web
   */
  private async loginInWeb(email: string, password: string): Promise<any> {
    try {
      console.log('🌐 Intentando login web con sistema de retry...');
      
      const response = await this.fetchWithRetry('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      }, 8000); // 8 segundos timeout por intento
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Error en login web');
      }
      
      console.log('✅ Login web exitoso con retry system');
      return data;
    } catch (error: any) {
      console.log('⚠️ Error en login web (todos los servidores):', error.message || error);
      throw error;
    }
  }
  }

  /**
   * Registrar usuario en la web también
   */
  private async registerInWeb(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<void> {
    try {
      const webApiUrl = this.getWebApiUrl();
      const response = await fetch(`${webApiUrl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error registrando en web');
      }
      
      console.log('✅ Usuario registrado exitosamente en web');
    } catch (error) {
      console.log('⚠️ Error registrando en web:', error);
      throw error;
    }
  }

  /**
   * Simulate user registration
   */
  async registerUser(userData: {
    email: string;
    password: string;
    password_confirm: string;
    first_name: string;
    last_name: string;
  }): Promise<SocialAuthResponse> {
    console.log('🔐 Mock: Registering user with email:', userData.email);

    // Validate input
    if (userData.password !== userData.password_confirm) {
      throw new Error('Las contraseñas no coinciden');
    }

    if (userData.password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }

    // Check if user already exists
    const existingUsers = await this.getStoredUsers();
    const userExists = existingUsers.find(user => user.email === userData.email);
    
    if (userExists) {
      throw new Error('Ya existe una cuenta con este email');
    }

    // Create new user
    const newUser: AuthUser = {
      id: Date.now(), // Simple ID generation
      email: userData.email,
      username: userData.email,
      first_name: userData.first_name,
      last_name: userData.last_name,
      is_email_verified: true,
    };

    // Store user data locally
    const userForStorage = { 
      ...newUser, 
      password: userData.password,
      is_mobile_user: true, // Marcar como usuario creado en móvil
      created_at: new Date().toISOString()
    };
    const updatedUsers = [...existingUsers, userForStorage];
    await AsyncStorage.setItem(this.USERS_KEY, JSON.stringify(updatedUsers));

    // También registrar en la web para sincronización
    try {
      await this.registerInWeb({
        email: userData.email,
        password: userData.password,
        firstName: userData.first_name,
        lastName: userData.last_name
      });
      console.log('✅ Usuario también registrado en web');
      
      // Realizar auto-sincronización para asegurar consistencia
      try {
        await this.autoSyncWithWeb();
        console.log('✅ Auto-sincronización post-registro completada');
      } catch (syncError) {
        console.log('⚠️ Error en auto-sincronización post-registro:', syncError);
      }
      
    } catch (webError) {
      console.log('⚠️ No se pudo registrar en web (continuando con registro local):', webError);
    }

    // Generate mock tokens
    const tokens: AuthTokens = {
      access: `mock_access_token_${Date.now()}`,
      refresh: `mock_refresh_token_${Date.now()}`,
    };

    // Store current session
    await AsyncStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(newUser));
    await AsyncStorage.setItem(this.TOKENS_KEY, JSON.stringify(tokens));

    console.log('✅ Mock: User registered successfully:', newUser.email);

    return {
      user: newUser,
      tokens,
    };
  }

  /**
   * Simulate user login
   */
  async loginUser(email: string, password: string): Promise<SocialAuthResponse> {
    console.log('🔐 Mock: Logging in user with email:', email);

    // Get stored users
    const existingUsers = await this.getStoredUsers();
    let user = existingUsers.find(u => u.email === email && u.password === password);

    // Si no se encuentra localmente, intentar login en web y sincronizar
    if (!user) {
      try {
        console.log('🔄 Usuario no encontrado localmente, intentando login en web...');
        const webLoginResult = await this.loginInWeb(email, password);
        
        if (webLoginResult.success) {
          console.log('✅ Login exitoso en web, sincronizando usuario...');
          
          // Crear usuario local basado en datos de la web
          const webUser = {
            id: webLoginResult.user.id,
            email: webLoginResult.user.email,
            password: password, // Guardar contraseña localmente
            first_name: webLoginResult.user.firstName,
            last_name: webLoginResult.user.lastName,
            username: webLoginResult.user.email.split('@')[0],
            created_at: new Date().toISOString(),
            is_mobile_user: false,
            is_email_verified: true
          };
          
          // Agregar a usuarios locales
          const updatedUsers = [...existingUsers, webUser];
          await AsyncStorage.setItem(this.USERS_KEY, JSON.stringify(updatedUsers));
          
          user = webUser;
        }
      } catch (webError: any) {
        console.log('⚠️ Error en login web:', webError.message);
        
        // Si hay timeout o error de red, verificar si es el usuario que acaba de registrarse
        if (webError.name === 'AbortError' || webError.message?.includes('timeout')) {
          console.log('🔄 Timeout de red - verificando si es usuario recién registrado...');
          
          // Buscar si hay un usuario con este email (sin verificar contraseña)
          const possibleUser = existingUsers.find(u => u.email === email);
          if (possibleUser) {
            console.log('✅ Usuario encontrado localmente, permitiendo login offline');
            // Actualizar la contraseña por si cambió
            possibleUser.password = password;
            await AsyncStorage.setItem(this.USERS_KEY, JSON.stringify(existingUsers));
            user = possibleUser;
          }
        }
      }
    }

    if (!user) {
      throw new Error('Email o contraseña incorrectos. Verifica tu conexión a internet si acabas de registrarte.');
    }

    // Create auth user (without password)
    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      username: user.username || user.email.split('@')[0],
      first_name: user.first_name,
      last_name: user.last_name,
      profile_picture: user.profile_picture,
      is_email_verified: user.is_email_verified || true,
    };

    // Generate mock tokens
    const tokens: AuthTokens = {
      access: `mock_access_token_${Date.now()}`,
      refresh: `mock_refresh_token_${Date.now()}`,
    };

    // Store current session
    await AsyncStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(authUser));
    await AsyncStorage.setItem(this.TOKENS_KEY, JSON.stringify(tokens));

    console.log('✅ Mock: User logged in successfully:', authUser.email);

    return {
      user: authUser,
      tokens,
    };
  }

  /**
   * Get stored users from AsyncStorage
   */
  private async getStoredUsers(): Promise<any[]> {
    try {
      const usersJson = await AsyncStorage.getItem(this.USERS_KEY);
      return usersJson ? JSON.parse(usersJson) : [];
    } catch (error) {
      console.error('Error getting stored users:', error);
      return [];
    }
  }

  /**
   * Get current user session
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const userJson = await AsyncStorage.getItem(this.CURRENT_USER_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Get stored tokens
   */
  async getTokens(): Promise<AuthTokens | null> {
    try {
      const tokensJson = await AsyncStorage.getItem(this.TOKENS_KEY);
      return tokensJson ? JSON.parse(tokensJson) : null;
    } catch (error) {
      console.error('Error getting tokens:', error);
      return null;
    }
  }

  /**
   * Clear user session (logout)
   */
  async clearSession(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.CURRENT_USER_KEY);
      await AsyncStorage.removeItem(this.TOKENS_KEY);
      console.log('✅ Mock: Session cleared');
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    const tokens = await this.getTokens();
    return !!(user && tokens);
  }

  /**
   * Clear all mock data (for testing purposes)
   */
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.USERS_KEY);
      await AsyncStorage.removeItem(this.CURRENT_USER_KEY);
      await AsyncStorage.removeItem(this.TOKENS_KEY);
      console.log('✅ Mock: All data cleared');
    } catch (error) {
      console.error('Error clearing all data:', error);
    }
  }
}

export default MockAuthService.getInstance();
