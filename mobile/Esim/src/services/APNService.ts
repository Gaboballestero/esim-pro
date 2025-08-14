import { Alert, Linking, Platform } from 'react-native';

export interface APNConfig {
  name: string;
  apn: string;
  username?: string;
  password?: string;
  proxy?: string;
  port?: string;
  mmsc?: string;
  mmsProxy?: string;
  mmsPort?: string;
  authType?: 'none' | 'pap' | 'chap' | 'pap_chap';
  protocol?: 'ipv4' | 'ipv6' | 'ipv4v6';
}

export class APNService {
  // Common APN configurations for eSIM providers
  static getAPNConfig(provider: string, country: string): APNConfig {
    const configs: Record<string, APNConfig> = {
      'esimpro': {
        name: 'eSIM Pro',
        apn: 'esimpro.data',
        username: '',
        password: '',
        authType: 'none',
        protocol: 'ipv4v6',
      },
      'vodafone_es': {
        name: 'Vodafone España',
        apn: 'airtelwap.es',
        username: 'vodafone',
        password: 'vodafone',
        authType: 'pap',
        protocol: 'ipv4v6',
      },
      'movistar_es': {
        name: 'Movistar España',
        apn: 'movistar.es',
        username: 'movistar',
        password: 'movistar',
        authType: 'pap',
        protocol: 'ipv4v6',
      },
      'orange_fr': {
        name: 'Orange Francia',
        apn: 'orange.fr',
        username: 'orange',
        password: 'orange',
        authType: 'pap',
        protocol: 'ipv4v6',
      },
      'tmobile_us': {
        name: 'T-Mobile USA',
        apn: 'fast.t-mobile.com',
        username: '',
        password: '',
        authType: 'none',
        protocol: 'ipv4v6',
      },
    };

    return configs[provider] || configs['esimpro'];
  }

  static async configureAPN(esim: any): Promise<boolean> {
    try {
      const apnConfig = this.getAPNConfig('esimpro', esim.plan.countries[0]?.code || 'ES');
      
      if (Platform.OS === 'ios') {
        return await this.configureAPNiOS(apnConfig, esim);
      } else {
        return await this.configureAPNAndroid(apnConfig, esim);
      }
    } catch (error) {
      console.error('Error configuring APN:', error);
      return false;
    }
  }

  private static async configureAPNiOS(config: APNConfig, esim: any): Promise<boolean> {
    return new Promise((resolve) => {
      Alert.alert(
        '📱 Configuración iOS',
        `Para configurar automáticamente tu eSIM en iOS:

1. Ve a Configuración → Celular
2. Selecciona tu eSIM: "${esim.plan.name}"
3. Toca "Red de datos móviles"
4. Configura APN:

📋 Datos APN:
• APN: ${config.apn}
• Usuario: ${config.username || '(vacío)'}
• Contraseña: ${config.password || '(vacío)'}

¿Quieres abrir Configuración ahora?`,
        [
          { text: 'Más tarde', style: 'cancel', onPress: () => resolve(false) },
          {
            text: 'Abrir Configuración',
            onPress: async () => {
              try {
                await Linking.openSettings();
                resolve(true);
              } catch (error) {
                console.error('Cannot open settings:', error);
                resolve(false);
              }
            },
          },
        ]
      );
    });
  }

  private static async configureAPNAndroid(config: APNConfig, esim: any): Promise<boolean> {
    return new Promise((resolve) => {
      Alert.alert(
        '🤖 Configuración Android',
        `Para configurar automáticamente tu eSIM en Android:

1. Ve a Configuración → Conexiones → Redes móviles
2. Selecciona tu eSIM: "${esim.plan.name}"
3. Toca "Nombres de puntos de acceso (APN)"
4. Toca el botón "+" para agregar nuevo APN
5. Configura:

📋 Datos APN:
• Nombre: ${config.name}
• APN: ${config.apn}
• Usuario: ${config.username || '(no requerido)'}
• Contraseña: ${config.password || '(no requerido)'}
• Tipo de autenticación: ${config.authType?.toUpperCase()}
• Protocolo APN: ${config.protocol?.toUpperCase()}

¿Quieres abrir Configuración de red ahora?`,
        [
          { text: 'Más tarde', style: 'cancel', onPress: () => resolve(false) },
          {
            text: 'Abrir Configuración',
            onPress: async () => {
              try {
                // Try to open network settings
                await Linking.sendIntent('android.settings.DATA_ROAMING_SETTINGS');
                resolve(true);
              } catch (error) {
                try {
                  // Fallback to general settings
                  await Linking.openSettings();
                  resolve(true);
                } catch (fallbackError) {
                  console.error('Cannot open settings:', fallbackError);
                  resolve(false);
                }
              }
            },
          },
        ]
      );
    });
  }

  static async generateMobileConfig(esim: any): Promise<string> {
    const apnConfig = this.getAPNConfig('esimpro', esim.plan.countries[0]?.code || 'ES');
    
    // Generate iOS Mobile Configuration profile (simplified)
    const mobileConfig = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>PayloadContent</key>
    <array>
        <dict>
            <key>PayloadDescription</key>
            <string>Configures APN settings for ${esim.plan.name}</string>
            <key>PayloadDisplayName</key>
            <string>${apnConfig.name}</string>
            <key>PayloadIdentifier</key>
            <string>com.esimpro.apn.${esim.id}</string>
            <key>PayloadType</key>
            <string>com.apple.cellular</string>
            <key>PayloadUUID</key>
            <string>${esim.iccid}</string>
            <key>PayloadVersion</key>
            <integer>1</integer>
            <key>APNs</key>
            <array>
                <dict>
                    <key>Name</key>
                    <string>${apnConfig.name}</string>
                    <key>APN</key>
                    <string>${apnConfig.apn}</string>
                    <key>Username</key>
                    <string>${apnConfig.username || ''}</string>
                    <key>Password</key>
                    <string>${apnConfig.password || ''}</string>
                    <key>ProxyServer</key>
                    <string>${apnConfig.proxy || ''}</string>
                    <key>ProxyPort</key>
                    <integer>${apnConfig.port ? parseInt(apnConfig.port) : 0}</integer>
                </dict>
            </array>
        </dict>
    </array>
    <key>PayloadDescription</key>
    <string>eSIM Pro APN Configuration for ${esim.plan.name}</string>
    <key>PayloadDisplayName</key>
    <string>eSIM Pro - ${esim.plan.name}</string>
    <key>PayloadIdentifier</key>
    <string>com.esimpro.configuration.${esim.id}</string>
    <key>PayloadRemovalDisallowed</key>
    <false/>
    <key>PayloadType</key>
    <string>Configuration</string>
    <key>PayloadUUID</key>
    <string>${esim.iccid}-config</string>
    <key>PayloadVersion</key>
    <integer>1</integer>
</dict>
</plist>`;

    return mobileConfig;
  }

  static showAPNInstructions(esim: any): void {
    const apnConfig = this.getAPNConfig('esimpro', esim.plan.countries[0]?.code || 'ES');
    
    const instructions = Platform.OS === 'ios' 
      ? `📱 CONFIGURACIÓN iOS

1. Ve a Configuración → Celular
2. Selecciona "${esim.plan.name}"
3. Toca "Red de datos móviles"
4. En la sección "DATOS MÓVILES":

📋 Configuración APN:
• APN: ${apnConfig.apn}
• Usuario: ${apnConfig.username || '(dejar vacío)'}
• Contraseña: ${apnConfig.password || '(dejar vacío)'}

5. Guarda la configuración
6. Asegúrate de que "Roaming de datos" esté activado`

      : `🤖 CONFIGURACIÓN ANDROID

1. Ve a Configuración → Conexiones
2. Toca "Redes móviles"
3. Selecciona tu eSIM "${esim.plan.name}"
4. Toca "Nombres de puntos de acceso"
5. Toca el botón "+" para agregar

📋 Configuración APN:
• Nombre: ${apnConfig.name}
• APN: ${apnConfig.apn}
• Usuario: ${apnConfig.username || '(dejar vacío)'}
• Contraseña: ${apnConfig.password || '(dejar vacío)'}
• Tipo de autenticación: ${apnConfig.authType?.toUpperCase()}
• Protocolo APN: ${apnConfig.protocol?.toUpperCase()}

6. Guarda y selecciona el nuevo APN
7. Activa "Roaming de datos"`;

    Alert.alert(
      'Configuración Manual APN',
      instructions,
      [
        { text: 'Copiar APN', onPress: () => this.copyAPNToClipboard(apnConfig.apn) },
        { text: 'Entendido', style: 'default' },
      ]
    );
  }

  private static copyAPNToClipboard(apn: string): void {
    // In a real app, you would use @react-native-clipboard/clipboard
    Alert.alert('APN Copiado', `APN "${apn}" copiado al portapapeles`);
  }

  static async testConnection(esim: any): Promise<boolean> {
    // Simulate connection test
    return new Promise((resolve) => {
      Alert.alert(
        '🔍 Probando Conexión',
        'Verificando conectividad de tu eSIM...',
        []
      );

      setTimeout(() => {
        const isConnected = Math.random() > 0.3; // 70% success rate in demo
        
        if (isConnected) {
          Alert.alert(
            '✅ Conexión Exitosa',
            `Tu eSIM "${esim.plan.name}" está funcionando correctamente.\n\n📶 Señal: Excelente\n🌐 Red: Vodafone ES\n📍 Ubicación: Madrid, España`,
            [{ text: 'Perfecto!' }]
          );
        } else {
          Alert.alert(
            '❌ Error de Conexión',
            'No se pudo establecer conexión. Verifica:\n\n• Configuración APN\n• Roaming de datos activado\n• Cobertura en tu área',
            [
              { text: 'Revisar APN', onPress: () => this.showAPNInstructions(esim) },
              { text: 'Intentar después' },
            ]
          );
        }
        
        resolve(isConnected);
      }, 2000);
    });
  }
}

export default APNService;
