import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AccountSettingsScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface SecuritySettings {
  biometricLogin: boolean;
  twoFactorAuth: boolean;
  autoLock: boolean;
  autoLockTime: number; // minutes
  loginNotifications: boolean;
  deviceTracking: boolean;
}

interface PrivacySettings {
  dataCollection: boolean;
  analyticsSharing: boolean;
  marketingEmails: boolean;
  locationTracking: boolean;
  crashReports: boolean;
}

const AccountSettingsScreen: React.FC = () => {
  const navigation = useNavigation<AccountSettingsScreenNavigationProp>();
  const [loading, setLoading] = useState(true);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    biometricLogin: false,
    twoFactorAuth: false,
    autoLock: true,
    autoLockTime: 5,
    loginNotifications: true,
    deviceTracking: true,
  });
  
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    dataCollection: true,
    analyticsSharing: false,
    marketingEmails: true,
    locationTracking: true,
    crashReports: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [securityData, privacyData] = await Promise.all([
        AsyncStorage.getItem('security_settings'),
        AsyncStorage.getItem('privacy_settings'),
      ]);

      if (securityData) {
        setSecuritySettings(JSON.parse(securityData));
      }
      if (privacyData) {
        setPrivacySettings(JSON.parse(privacyData));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSecuritySettings = async (newSettings: SecuritySettings) => {
    try {
      await AsyncStorage.setItem('security_settings', JSON.stringify(newSettings));
      setSecuritySettings(newSettings);
    } catch (error) {
      console.error('Error saving security settings:', error);
      Alert.alert('Error', 'No se pudieron guardar las configuraciones de seguridad');
    }
  };

  const savePrivacySettings = async (newSettings: PrivacySettings) => {
    try {
      await AsyncStorage.setItem('privacy_settings', JSON.stringify(newSettings));
      setPrivacySettings(newSettings);
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      Alert.alert('Error', 'No se pudieron guardar las configuraciones de privacidad');
    }
  };

  const updateSecuritySetting = (key: keyof SecuritySettings, value: any) => {
    const newSettings = { ...securitySettings, [key]: value };
    saveSecuritySettings(newSettings);
  };

  const updatePrivacySetting = (key: keyof PrivacySettings, value: any) => {
    const newSettings = { ...privacySettings, [key]: value };
    savePrivacySettings(newSettings);
  };

  const handleTwoFactorSetup = () => {
    if (!securitySettings.twoFactorAuth) {
      Alert.alert(
        'Configurar Autenticación de Dos Factores',
        'Se enviará un código a tu email para configurar 2FA. ¿Continuar?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Continuar',
            onPress: () => {
              // Simulate 2FA setup
              updateSecuritySetting('twoFactorAuth', true);
              Alert.alert('Éxito', 'Autenticación de dos factores activada');
            }
          }
        ]
      );
    } else {
      Alert.alert(
        'Desactivar 2FA',
        '¿Estás seguro de que quieres desactivar la autenticación de dos factores?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Desactivar',
            style: 'destructive',
            onPress: () => updateSecuritySetting('twoFactorAuth', false)
          }
        ]
      );
    }
  };

  const handleDataExport = () => {
    Alert.alert(
      'Exportar Datos',
      'Se enviará un archivo con todos tus datos a tu email registrado. Este proceso puede tomar hasta 24 horas.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Solicitar',
          onPress: () => Alert.alert('Solicitud Enviada', 'Recibirás un email cuando tus datos estén listos para descargar.')
        }
      ]
    );
  };

  const handleAccountDeletion = () => {
    Alert.alert(
      '⚠️ Eliminar Cuenta',
      'Esta acción es irreversible. Se eliminarán todos tus eSIMs, pedidos e información personal. ¿Estás seguro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirmación Final',
              'Escribe "ELIMINAR" para confirmar la eliminación de tu cuenta.',
              [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Confirmar', style: 'destructive' }
              ]
            );
          }
        }
      ]
    );
  };

  const openUrl = (url: string) => {
    Linking.openURL(url).catch(err => console.error('Error opening URL:', err));
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando configuración...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configuración de Cuenta</Text>
        <View style={styles.headerSpacer} />
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔒 Seguridad</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Login Biométrico</Text>
              <Text style={styles.settingDescription}>
                Usa huella dactilar o Face ID para acceder
              </Text>
            </View>
            <Switch
              value={securitySettings.biometricLogin}
              onValueChange={(value) => updateSecuritySetting('biometricLogin', value)}
              trackColor={{ false: COLORS.gray[300], true: COLORS.primary }}
              thumbColor={securitySettings.biometricLogin ? COLORS.white : COLORS.gray[500]}
            />
          </View>

          <TouchableOpacity style={styles.settingItem} onPress={handleTwoFactorSetup}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Autenticación de Dos Factores</Text>
              <Text style={[
                styles.settingDescription,
                { color: securitySettings.twoFactorAuth ? COLORS.success : COLORS.gray[600] }
              ]}>
                {securitySettings.twoFactorAuth ? 'Activada' : 'Toca para configurar'}
              </Text>
            </View>
            <Ionicons 
              name={securitySettings.twoFactorAuth ? "shield-checkmark" : "shield-outline"} 
              size={24} 
              color={securitySettings.twoFactorAuth ? COLORS.success : COLORS.gray[400]} 
            />
          </TouchableOpacity>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Bloqueo Automático</Text>
              <Text style={styles.settingDescription}>
                Bloquear app después de {securitySettings.autoLockTime} minutos
              </Text>
            </View>
            <Switch
              value={securitySettings.autoLock}
              onValueChange={(value) => updateSecuritySetting('autoLock', value)}
              trackColor={{ false: COLORS.gray[300], true: COLORS.primary }}
              thumbColor={securitySettings.autoLock ? COLORS.white : COLORS.gray[500]}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Notificaciones de Login</Text>
              <Text style={styles.settingDescription}>
                Avísame cuando alguien acceda a mi cuenta
              </Text>
            </View>
            <Switch
              value={securitySettings.loginNotifications}
              onValueChange={(value) => updateSecuritySetting('loginNotifications', value)}
              trackColor={{ false: COLORS.gray[300], true: COLORS.primary }}
              thumbColor={securitySettings.loginNotifications ? COLORS.white : COLORS.gray[500]}
            />
          </View>
        </View>

        {/* Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔐 Privacidad</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Recopilación de Datos</Text>
              <Text style={styles.settingDescription}>
                Permitir recopilar datos para mejorar el servicio
              </Text>
            </View>
            <Switch
              value={privacySettings.dataCollection}
              onValueChange={(value) => updatePrivacySetting('dataCollection', value)}
              trackColor={{ false: COLORS.gray[300], true: COLORS.primary }}
              thumbColor={privacySettings.dataCollection ? COLORS.white : COLORS.gray[500]}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Análisis y Estadísticas</Text>
              <Text style={styles.settingDescription}>
                Compartir datos de uso para análisis
              </Text>
            </View>
            <Switch
              value={privacySettings.analyticsSharing}
              onValueChange={(value) => updatePrivacySetting('analyticsSharing', value)}
              trackColor={{ false: COLORS.gray[300], true: COLORS.primary }}
              thumbColor={privacySettings.analyticsSharing ? COLORS.white : COLORS.gray[500]}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Tracking de Ubicación</Text>
              <Text style={styles.settingDescription}>
                Detectar automáticamente cambios de país
              </Text>
            </View>
            <Switch
              value={privacySettings.locationTracking}
              onValueChange={(value) => updatePrivacySetting('locationTracking', value)}
              trackColor={{ false: COLORS.gray[300], true: COLORS.primary }}
              thumbColor={privacySettings.locationTracking ? COLORS.white : COLORS.gray[500]}
            />
          </View>
        </View>

        {/* Legal Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Legal</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => openUrl('https://tu-app.com/privacy')}
          >
            <Ionicons name="document-text-outline" size={24} color={COLORS.info} />
            <Text style={styles.menuItemText}>Política de Privacidad</Text>
            <Ionicons name="open-outline" size={16} color={COLORS.gray[400]} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => openUrl('https://tu-app.com/terms')}
          >
            <Ionicons name="document-outline" size={24} color={COLORS.info} />
            <Text style={styles.menuItemText}>Términos de Servicio</Text>
            <Ionicons name="open-outline" size={16} color={COLORS.gray[400]} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleDataExport}>
            <Ionicons name="download-outline" size={24} color={COLORS.warning} />
            <Text style={styles.menuItemText}>Exportar Mis Datos</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View style={styles.dangerSection}>
          <Text style={styles.dangerSectionTitle}>⚠️ Zona Peligrosa</Text>
          
          <TouchableOpacity style={styles.dangerItem} onPress={handleAccountDeletion}>
            <View style={styles.dangerInfo}>
              <Text style={styles.dangerTitle}>Eliminar Cuenta</Text>
              <Text style={styles.dangerDescription}>
                Eliminar permanentemente tu cuenta y todos los datos
              </Text>
            </View>
            <Ionicons name="trash-outline" size={24} color={COLORS.error} />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: COLORS.white,
  },
  headerSpacer: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.gray[600],
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: COLORS.gray[900],
    marginBottom: SPACING.lg,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  settingInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  settingTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    color: COLORS.gray[900],
    marginBottom: SPACING.xs,
  },
  settingDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[600],
    lineHeight: 18,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  menuItemText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.gray[900],
    marginLeft: SPACING.md,
    fontWeight: '500',
  },
  dangerSection: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.error,
    shadowColor: COLORS.error,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dangerSectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: COLORS.error,
    marginBottom: SPACING.lg,
  },
  dangerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  dangerInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  dangerTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    color: COLORS.error,
    marginBottom: SPACING.xs,
  },
  dangerDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[600],
    lineHeight: 18,
  },
  bottomSpacer: {
    height: SPACING.xl,
  },
});

export default AccountSettingsScreen;
