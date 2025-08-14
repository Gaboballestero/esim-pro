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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

type NotificationSettingsScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface NotificationPreferences {
  dataAlerts: boolean;
  lowDataThreshold: number; // GB
  expiryAlerts: boolean;
  expiryDays: number; // days before expiry
  roamingAlerts: boolean;
  offers: boolean;
  smartSuggestions: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

const NotificationSettingsScreen: React.FC = () => {
  const navigation = useNavigation<NotificationSettingsScreenNavigationProp>();
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    dataAlerts: true,
    lowDataThreshold: 0.5,
    expiryAlerts: true,
    expiryDays: 3,
    roamingAlerts: true,
    offers: true,
    smartSuggestions: true,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
    },
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const saved = await AsyncStorage.getItem('notification_preferences');
      if (saved) {
        setPreferences(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async (newPreferences: NotificationPreferences) => {
    try {
      await AsyncStorage.setItem('notification_preferences', JSON.stringify(newPreferences));
      setPreferences(newPreferences);
    } catch (error) {
      console.error('Error saving preferences:', error);
      Alert.alert('Error', 'No se pudieron guardar las preferencias');
    }
  };

  const updatePreference = (key: keyof NotificationPreferences, value: any) => {
    const newPreferences = { ...preferences, [key]: value };
    savePreferences(newPreferences);
  };

  const updateQuietHours = (key: keyof NotificationPreferences['quietHours'], value: any) => {
    const newPreferences = {
      ...preferences,
      quietHours: { ...preferences.quietHours, [key]: value }
    };
    savePreferences(newPreferences);
  };

  const resetToDefaults = () => {
    Alert.alert(
      'Restaurar Configuración',
      '¿Estás seguro de que quieres restaurar la configuración por defecto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restaurar',
          onPress: () => {
            const defaultPrefs: NotificationPreferences = {
              dataAlerts: true,
              lowDataThreshold: 0.5,
              expiryAlerts: true,
              expiryDays: 3,
              roamingAlerts: true,
              offers: true,
              smartSuggestions: true,
              quietHours: {
                enabled: false,
                start: '22:00',
                end: '08:00',
              },
            };
            savePreferences(defaultPrefs);
          }
        }
      ]
    );
  };

  const testNotification = () => {
    Alert.alert(
      '🔔 Notificación de Prueba',
      'Esta es una notificación de prueba. Las notificaciones están funcionando correctamente.',
      [{ text: 'OK' }]
    );
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
        <Text style={styles.headerTitle}>Notificaciones</Text>
        <TouchableOpacity style={styles.testButton} onPress={testNotification}>
          <Ionicons name="notifications-outline" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Data Alerts Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alertas de Datos</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Alertas de Datos Bajos</Text>
              <Text style={styles.settingDescription}>
                Recibe alertas cuando tus datos estén por agotarse
              </Text>
            </View>
            <Switch
              value={preferences.dataAlerts}
              onValueChange={(value) => updatePreference('dataAlerts', value)}
              trackColor={{ false: COLORS.gray[300], true: COLORS.primary }}
              thumbColor={preferences.dataAlerts ? COLORS.white : COLORS.gray[500]}
            />
          </View>

          {preferences.dataAlerts && (
            <View style={styles.subSetting}>
              <Text style={styles.subSettingTitle}>Umbral de Alerta</Text>
              <View style={styles.thresholdOptions}>
                {[0.2, 0.5, 1.0].map((threshold) => (
                  <TouchableOpacity
                    key={threshold}
                    style={[
                      styles.thresholdOption,
                      preferences.lowDataThreshold === threshold && styles.thresholdOptionActive
                    ]}
                    onPress={() => updatePreference('lowDataThreshold', threshold)}
                  >
                    <Text style={[
                      styles.thresholdOptionText,
                      preferences.lowDataThreshold === threshold && styles.thresholdOptionTextActive
                    ]}>
                      {threshold}GB
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Expiry Alerts Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alertas de Expiración</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Alertas de Vencimiento</Text>
              <Text style={styles.settingDescription}>
                Te avisamos antes de que expire tu plan
              </Text>
            </View>
            <Switch
              value={preferences.expiryAlerts}
              onValueChange={(value) => updatePreference('expiryAlerts', value)}
              trackColor={{ false: COLORS.gray[300], true: COLORS.primary }}
              thumbColor={preferences.expiryAlerts ? COLORS.white : COLORS.gray[500]}
            />
          </View>

          {preferences.expiryAlerts && (
            <View style={styles.subSetting}>
              <Text style={styles.subSettingTitle}>Días de Anticipación</Text>
              <View style={styles.thresholdOptions}>
                {[1, 3, 7].map((days) => (
                  <TouchableOpacity
                    key={days}
                    style={[
                      styles.thresholdOption,
                      preferences.expiryDays === days && styles.thresholdOptionActive
                    ]}
                    onPress={() => updatePreference('expiryDays', days)}
                  >
                    <Text style={[
                      styles.thresholdOptionText,
                      preferences.expiryDays === days && styles.thresholdOptionTextActive
                    ]}>
                      {days} día{days > 1 ? 's' : ''}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Travel & Roaming Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Viajes y Roaming</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Alertas de Roaming</Text>
              <Text style={styles.settingDescription}>
                Confirma cuando detectemos que estás en el extranjero
              </Text>
            </View>
            <Switch
              value={preferences.roamingAlerts}
              onValueChange={(value) => updatePreference('roamingAlerts', value)}
              trackColor={{ false: COLORS.gray[300], true: COLORS.primary }}
              thumbColor={preferences.roamingAlerts ? COLORS.white : COLORS.gray[500]}
            />
          </View>
        </View>

        {/* Marketing & Offers Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ofertas y Promociones</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Ofertas Especiales</Text>
              <Text style={styles.settingDescription}>
                Recibe notificaciones sobre descuentos y promociones
              </Text>
            </View>
            <Switch
              value={preferences.offers}
              onValueChange={(value) => updatePreference('offers', value)}
              trackColor={{ false: COLORS.gray[300], true: COLORS.primary }}
              thumbColor={preferences.offers ? COLORS.white : COLORS.gray[500]}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Sugerencias Inteligentes</Text>
              <Text style={styles.settingDescription}>
                Recomendaciones basadas en tu comportamiento de uso
              </Text>
            </View>
            <Switch
              value={preferences.smartSuggestions}
              onValueChange={(value) => updatePreference('smartSuggestions', value)}
              trackColor={{ false: COLORS.gray[300], true: COLORS.primary }}
              thumbColor={preferences.smartSuggestions ? COLORS.white : COLORS.gray[500]}
            />
          </View>
        </View>

        {/* Quiet Hours Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Horas Silenciosas</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Modo Silencioso</Text>
              <Text style={styles.settingDescription}>
                No recibir notificaciones durante ciertas horas
              </Text>
            </View>
            <Switch
              value={preferences.quietHours.enabled}
              onValueChange={(value) => updateQuietHours('enabled', value)}
              trackColor={{ false: COLORS.gray[300], true: COLORS.primary }}
              thumbColor={preferences.quietHours.enabled ? COLORS.white : COLORS.gray[500]}
            />
          </View>

          {preferences.quietHours.enabled && (
            <View style={styles.subSetting}>
              <Text style={styles.subSettingTitle}>Horario Silencioso</Text>
              <View style={styles.timeRange}>
                <Text style={styles.timeText}>Desde {preferences.quietHours.start}</Text>
                <Text style={styles.timeText}>hasta {preferences.quietHours.end}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Reset Button */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.resetButton} onPress={resetToDefaults}>
            <Ionicons name="refresh-outline" size={20} color={COLORS.gray[600]} />
            <Text style={styles.resetButtonText}>Restaurar Configuración</Text>
          </TouchableOpacity>
        </View>
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
  testButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
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
  subSetting: {
    marginLeft: SPACING.md,
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
  },
  subSettingTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: COLORS.gray[700],
    marginBottom: SPACING.md,
  },
  thresholdOptions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  thresholdOption: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.gray[100],
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  thresholdOptionActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  thresholdOptionText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '500',
    color: COLORS.gray[700],
  },
  thresholdOptionTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  timeRange: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[700],
    backgroundColor: COLORS.gray[100],
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  resetButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.gray[600],
    marginLeft: SPACING.sm,
    fontWeight: '500',
  },
});

export default NotificationSettingsScreen;
