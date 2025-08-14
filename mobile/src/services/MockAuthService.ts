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
  private readonly ESIMS_KEY = '@hablaris_mock_esims';
  
  // URL del servidor web - IP real de tu computadora
  private getWebApiUrl(): string {
    const isIOS = Platform.OS === 'ios';
    const isDev = __DEV__;
    
    if (isDev) {
      if (isIOS) {
        // iOS Simulator puede usar localhost
        return 'http://localhost:3000/api';
      } else {
        // Android Emulator usa 10.0.2.2
        return 'http://10.0.2.2:3000/api';
      }
    }
    
    // Para dispositivo físico - IP real
    return 'http://172.19.12.69:3000/api';
  }

  // URLs alternativas para probar si falla la principal
  private getAlternativeUrls(): string[] {
    return [
  'http://10.0.2.2:3000/api',     // Android emulator (emulador)
  'http://10.0.2.2:3001/api',     // Android emulator alt port
  'http://127.0.0.1:3000/api',    // localhost alternativo
  'http://127.0.0.1:3001/api',    // localhost alt port
  'http://localhost:3000/api',    // localhost
  'http://localhost:3001/api',    // localhost alt port
  'http://172.19.12.69:3000/api', // IP LAN (ajustar según tu red)
  'http://172.19.12.69:3001/api', // IP LAN alt port
    ];
  }

  // Función para probar múltiples URLs
  private async tryConnectToWeb(endpoint: string, options: any): Promise<any> {
    const urls = this.getAlternativeUrls();
    
    for (const baseUrl of urls) {
      try {
        const fullUrl = baseUrl + endpoint;
        console.log(`🌐 Intentando conectar a: ${fullUrl}`);
        
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);
  const response = await fetch(fullUrl, { ...options, signal: controller.signal });
  clearTimeout(timeout);
        
  if (response && response.ok) {
          console.log(`✅ Conexión exitosa a: ${fullUrl}`);
          return await response.json();
        }
        
      } catch (error: any) {
  const msg = error?.name === 'AbortError' ? 'Timeout' : (error?.message || 'Error');
  console.log(`❌ Fallo conexión a: ${baseUrl} - ${msg}`);
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
    this.initializeDefaultESims();
  }

  // Inicialización con sincronización web
  private async initializeWithWebSync(): Promise<void> {
    try {
      await this.ensureDefaultUsers();
      // Ping rápido para evitar esperas largas
      try {
        await this.tryConnectToWeb('/ping', { method: 'GET' });
        console.log('✅ Ping web OK');
      } catch (_) {
        console.log('⚠️ Ping web falló, continuaré con datos locales');
      }
      await this.syncWithWebNow();
  // Empujar usuarios locales hacia web (por si hubo registros offline)
  await this.pushLocalUsersToWeb();
      // Sincronización inicial de eSIMs
      await this.syncESimsWithWeb();
    } catch (error) {
      console.log('🔄 No se pudo sincronizar con web, usando datos locales');
    }
  }

  // Sincronización periódica cada 2 minutos (solo usuarios)
  private startPeriodicSync(): void {
  setInterval(async () => {
      try {
        console.log('🔄 Sincronización automática usuarios...');
        await this.syncWithWebNow();
  // Enviar también usuarios locales a web para asegurar bidireccionalidad
  await this.pushLocalUsersToWeb();
      } catch (error) {
        console.log('⚠️ Error en sincronización automática:', error);
      }
  }, 60 * 1000); // cada 60s para pruebas
    
    console.log('⏰ Sincronización automática de usuarios iniciada (cada 2 minutos)');
    console.log('📱 Sincronización de eSIMs: TIEMPO REAL');
  }

  // Empujar usuarios locales del móvil al servidor web
  private async pushLocalUsersToWeb(): Promise<void> {
    try {
      const localUsers = await this.getStoredUsers();
      if (!localUsers || localUsers.length === 0) return;

      // Mapear al formato esperado por el API de sync
      const usersPayload = localUsers.map(u => ({
        email: u.email,
        password: u.password || '123456',
        firstName: u.first_name || 'Usuario',
        lastName: u.last_name || 'Móvil',
      }));

      const res = await this.tryConnectToWeb('/auth/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_users', users: usersPayload })
      });
      if (res?.success) {
        console.log(`🌐 Usuarios locales enviados a web: nuevos=${res?.result?.added ?? 0}, existentes=${res?.result?.existing ?? 0}`);
      }
    } catch (error: any) {
      console.log('⚠️ No se pudieron enviar usuarios locales a web:', error.message);
    }
  }

  // Sincronizar con web ahora
  private async syncWithWebNow(): Promise<void> {
    try {
      console.log('🔄 Sincronizando usuarios con servidor web...');
      
      // Obtener usuarios del servidor web
      const webUsers = await this.tryConnectToWeb('/auth/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_users' })
      });
      
      if (webUsers.success && webUsers.users) {
        console.log(`📥 Obtenidos ${webUsers.users.length} usuarios del servidor`);
        await this.mergeWebUsers(webUsers.users);
      }
      
    } catch (error: any) {
      console.log(`⚠️ Error sincronizando usuarios: ${error.message}`);
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
      await this.tryConnectToWeb('/auth/register', {
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
      console.log('⚠️ No se pudo registrar en web. Intentando empujar vía sync...');
      try {
        await this.pushLocalUsersToWeb();
        console.log('✅ Usuario enviado mediante sync');
      } catch (syncErr) {
        console.log('⚠️ Falló el push de sync también:', syncErr);
      }
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
    await this.syncESimsWithWeb();
  }

  // Sincronización en tiempo real de eSIMs
  async syncESimsRealTime(): Promise<void> {
    console.log('⚡ Sincronización tiempo real de eSIMs...');
    await this.syncESimsWithWeb();
  }

  // === MÉTODOS DE ESIM ===

  // Inicializar eSIMs por defecto
  private async initializeDefaultESims(): Promise<void> {
    const existingESims = await this.getStoredESims();
    
    if (existingESims.length === 0) {
      const defaultESims = [
        {
          id: 1,
          userId: 1, // Usuario test@hablaris.com
          iccid: 'ESIM001TEST12345',
          msisdn: '+1234567890',
          planName: 'Test Plan Móvil',
          countryCode: 'US',
          dataLimit: 5 * 1024 * 1024 * 1024, // 5GB
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días
          status: 'active',
          qrCode: 'https://api.qrserver.com/v1/create-qr-code/?data=ESIM001TEST12345',
          activatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          source: 'mobile'
        }
      ];
      
      await AsyncStorage.setItem(this.ESIMS_KEY, JSON.stringify(defaultESims));
      console.log(`✅ ${defaultESims.length} eSIMs por defecto inicializadas`);
    }
  }

  // Obtener eSIMs almacenadas
  private async getStoredESims(): Promise<any[]> {
    try {
      const esims = await AsyncStorage.getItem(this.ESIMS_KEY);
      return esims ? JSON.parse(esims) : [];
    } catch (error) {
      console.error('Error obteniendo eSIMs:', error);
      return [];
    }
  }

  // Sincronizar eSIMs con web
  private async syncESimsWithWeb(): Promise<void> {
    try {
      console.log('📱 Sincronizando eSIMs con servidor web...');
      
      const localESims = await this.getStoredESims();
      
      // Sincronización bidireccional completa
      const syncResponse = await this.tryConnectToWeb('/esim/auto-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'full_sync',
          esims: localESims
        })
      });
      
      if (syncResponse.success && syncResponse.data?.esimsForMobile) {
        console.log(`📥 Sincronizando ${syncResponse.data.esimsForMobile.length} eSIMs del servidor`);
        await this.mergeWebESims(syncResponse.data.esimsForMobile);
      }
      
    } catch (error: any) {
      console.log(`⚠️ Error sincronizando eSIMs: ${error.message}`);
    }
  }

  // Combinar eSIMs del web con locales
  private async mergeWebESims(webESims: any[]): Promise<void> {
    const localESims = await this.getStoredESims();
    const mergedESims = [...localESims];
    
    webESims.forEach((webESim: any) => {
      const existingIndex = mergedESims.findIndex(e => e.iccid === webESim.iccid);
      
      if (existingIndex >= 0) {
        // Actualizar eSIM existente
        mergedESims[existingIndex] = {
          ...mergedESims[existingIndex],
          ...webESim,
          source: webESim.source || 'web'
        };
      } else {
        // Agregar nueva eSIM del web
        mergedESims.push({
          ...webESim,
          source: webESim.source || 'web'
        });
      }
    });
    
    await AsyncStorage.setItem(this.ESIMS_KEY, JSON.stringify(mergedESims));
    console.log(`💾 Guardadas ${mergedESims.length} eSIMs total`);
  }

  // Obtener eSIMs del usuario actual
  async getUserESims(): Promise<any[]> {
    try {
      // Sincronización en tiempo real antes de obtener eSIMs
      await this.syncESimsRealTime();
      
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        return [];
      }
      
      const allESims = await this.getStoredESims();
      const userESims = allESims.filter(esim => 
        esim.userId === currentUser.id || esim.userId === currentUser.id.toString()
      );
      
      console.log(`📱 ${userESims.length} eSIMs encontradas para usuario ${currentUser.email}`);
      return userESims;
    } catch (error) {
      console.error('Error obteniendo eSIMs del usuario:', error);
      return [];
    }
  }
}

export default MockAuthService.getInstance();
