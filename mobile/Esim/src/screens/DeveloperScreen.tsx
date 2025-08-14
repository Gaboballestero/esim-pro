import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONFIG, saveAppConfig } from '../config/app';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

export default function DeveloperScreen() {
  const [config, setConfig] = useState(APP_CONFIG);

  const updateConfig = async (key: string, value: boolean) => {
    if (key === 'USE_REAL_API') {
      APP_CONFIG.USE_REAL_API = value;
    } else if (key.startsWith('FEATURES.')) {
      const featureKey = key.replace('FEATURES.', '') as keyof typeof APP_CONFIG.FEATURES;
      APP_CONFIG.FEATURES[featureKey] = value;
    }
    
    setConfig({ ...APP_CONFIG });
    
    // Save to AsyncStorage for persistence
    await saveAppConfig();
  };

  const resetToDemo = async () => {
    Alert.alert(
      'Resetear a Demo',
      '¿Quieres volver al modo demo completo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Resetear',
          onPress: async () => {
            APP_CONFIG.USE_REAL_API = false;
            Object.keys(APP_CONFIG.FEATURES).forEach(key => {
              APP_CONFIG.FEATURES[key as keyof typeof APP_CONFIG.FEATURES] = false;
            });
            setConfig({ ...APP_CONFIG });
            await saveAppConfig();
          }
        }
      ]
    );
  };

  const clearUserData = async () => {
    Alert.alert(
      'Limpiar Datos',
      '¿Quieres eliminar todos los datos del usuario?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpiar',
          onPress: async () => {
            await AsyncStorage.multiRemove([
              'authToken',
              'refreshToken', 
              'userData',
              'userMode',
              'hasLaunched'
            ]);
            Alert.alert('Listo', 'Datos eliminados. Reinicia la app.');
          }
        }
      ]
    );
  };

  const ConfigItem = ({ 
    title, 
    description, 
    configKey, 
    isFeature = false 
  }: {
    title: string;
    description: string;
    configKey: string;
    isFeature?: boolean;
  }) => (
    <View style={styles.configItem}>
      <View style={styles.configContent}>
        <Text style={styles.configTitle}>{title}</Text>
        <Text style={styles.configDescription}>{description}</Text>
      </View>
      <Switch
        value={isFeature 
          ? (config.FEATURES as any)[configKey] 
          : (config as any)[configKey]
        }
        onValueChange={(value) => updateConfig(isFeature ? `FEATURES.${configKey}` : configKey, value)}
        trackColor={{ false: COLORS.border, true: COLORS.primary }}
        thumbColor={COLORS.surface}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🛠️ Configuración de Desarrollo</Text>
        <Text style={styles.subtitle}>Controla qué funcionalidades probar</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* API Configuration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔗 Conexión API</Text>
          <View style={styles.sectionContent}>
            <ConfigItem
              title="Usar API Real"
              description="Conectar al backend Django en lugar de datos simulados"
              configKey="USE_REAL_API"
            />
            <View style={styles.apiInfo}>
              <Text style={styles.apiInfoText}>
                {config.USE_REAL_API ? `📡 ${config.getApiUrl()}` : '🎭 Modo Demo'}
              </Text>
            </View>
          </View>
        </View>

        {/* Feature Flags */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Funcionalidades</Text>
          <View style={styles.sectionContent}>
            <ConfigItem
              title="Autenticación Real"
              description="Login/registro con backend real"
              configKey="REAL_AUTH"
              isFeature={true}
            />
            <ConfigItem
              title="Planes Reales"
              description="Cargar planes desde el backend"
              configKey="REAL_PLANS"
              isFeature={true}
            />
            <ConfigItem
              title="eSIMs Reales"
              description="Gestión real de eSIMs"
              configKey="REAL_ESIMS"
              isFeature={true}
            />
            <ConfigItem
              title="Sistema de Pagos"
              description="Integración con Stripe/PayPal"
              configKey="PAYMENTS"
              isFeature={true}
            />
            <ConfigItem
              title="Notificaciones Push"
              description="Notificaciones en tiempo real"
              configKey="PUSH_NOTIFICATIONS"
              isFeature={true}
            />
          </View>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔧 Acciones</Text>
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={resetToDemo}>
              <Ionicons name="refresh" size={16} color={COLORS.warning} />
              <Text style={[styles.actionButtonText, { color: COLORS.warning }]}>
                Resetear a Demo
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={clearUserData}>
              <Ionicons name="trash" size={16} color={COLORS.error} />
              <Text style={[styles.actionButtonText, { color: COLORS.error }]}>
                Limpiar Datos
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Current Status */}
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Estado Actual</Text>
          <Text style={styles.statusText}>
            Modo: {config.USE_REAL_API ? '🔴 Producción' : '🟡 Demo'}
          </Text>
          <Text style={styles.statusText}>
            Funciones activas: {Object.values(config.FEATURES).filter(Boolean).length}/5
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SIZES.padding,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  scrollContent: {
    paddingHorizontal: SIZES.padding,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  sectionContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    ...SHADOWS.light,
  },
  configItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  configContent: {
    flex: 1,
    marginRight: 12,
  },
  configTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 4,
  },
  configDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  apiInfo: {
    padding: 16,
    backgroundColor: COLORS.background,
    margin: 16,
    borderRadius: 8,
  },
  apiInfoText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
  },
  actionsContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    ...SHADOWS.light,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  statusCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.surface,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
});
