import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../constants/theme';

interface GuideStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  details: string[];
  platform?: 'ios' | 'android' | 'both';
}

const ESIMGuideScreenSimple = ({ navigation, route }: any) => {
  const { esim } = route.params || {};
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [currentPlatform, setCurrentPlatform] = useState<'ios' | 'android'>(
    Platform.OS as 'ios' | 'android'
  );

  const guideSteps: GuideStep[] = [
    {
      id: 'compatibility',
      title: 'Verificar Compatibilidad',
      description: 'Confirma que tu dispositivo soporta eSIM',
      icon: 'phone-portrait',
      details: [
        'iPhone XS, XR y modelos posteriores',
        'Google Pixel 3 y modelos posteriores',
        'Samsung Galaxy S20 y modelos posteriores',
        'Huawei P40 y modelos posteriores',
        'Para verificar: Configuración > Celular > Agregar Plan Celular',
      ],
      platform: 'both',
    },
    {
      id: 'backup',
      title: 'Respaldar SIM Principal',
      description: 'Guarda la configuración de tu SIM actual',
      icon: 'shield-checkmark',
      details: [
        'Ve a Configuración > Celular',
        'Anota el nombre de tu operador principal',
        'Verifica que "Roaming de datos" esté desactivado para tu SIM principal',
        'Esto evitará cargos inesperados durante el viaje',
      ],
      platform: 'both',
    },
    {
      id: 'install-ios',
      title: 'Instalar eSIM en iOS',
      description: 'Proceso paso a paso para iPhone/iPad',
      icon: 'logo-apple',
      details: [
        '1. Ve a Configuración > Celular',
        '2. Toca "Agregar Plan Celular"',
        '3. Usa la cámara para escanear el código QR',
        '4. O toca "Introducir detalles manualmente"',
        '5. Ingresa el código de activación si no tienes QR',
        '6. Sigue las instrucciones en pantalla',
        '7. Etiqueta tu eSIM (ej: "Viaje Europa")',
        '8. Elige qué línea usar para datos',
      ],
      platform: 'ios',
    },
    {
      id: 'install-android',
      title: 'Instalar eSIM en Android',
      description: 'Proceso paso a paso para Android',
      icon: 'logo-android',
      details: [
        '1. Ve a Configuración > Conexiones > Gestores de SIM',
        '2. Toca "Agregar plan móvil"',
        '3. Escanea el código QR con la cámara',
        '4. O toca "¿No tienes un código QR?"',
        '5. Ingresa el código de activación manualmente',
        '6. Confirma la descarga del plan',
        '7. Activa la eSIM cuando sea necesario',
        '8. Configura la eSIM como línea de datos',
      ],
      platform: 'android',
    },
    {
      id: 'activation',
      title: 'Activar tu eSIM',
      description: 'Activa tu plan de datos al llegar a destino',
      icon: 'radio',
      details: [
        'IMPORTANTE: Solo activa al llegar a tu destino',
        'Ve a Configuración > Celular (iOS) o Gestores de SIM (Android)',
        'Selecciona tu eSIM de viaje',
        'Activa "Activar esta línea"',
        'Configura como línea predeterminada para datos',
        'Activa "Roaming de datos" para la eSIM',
        'Desactiva "Roaming de datos" para tu SIM principal',
      ],
      platform: 'both',
    },
    {
      id: 'troubleshooting',
      title: 'Solución de Problemas',
      description: 'Qué hacer si algo no funciona',
      icon: 'help-circle',
      details: [
        'No hay señal: Reinicia el dispositivo',
        'No hay internet: Verifica configuración APN',
        'Velocidad lenta: Verifica cobertura en tu área',
        'No puedes activar: Verifica que tengas internet WiFi',
        'Error de QR: Verifica que el código esté completo',
        'Contacta soporte 24/7 desde la app',
      ],
      platform: 'both',
    },
  ];

  const filteredSteps = guideSteps.filter(
    step => step.platform === 'both' || step.platform === currentPlatform
  );

  const toggleStep = (stepId: string) => {
    setActiveStep(activeStep === stepId ? null : stepId);
  };

  const contactSupport = () => {
    Alert.alert(
      'Soporte 24/7',
      '¿Necesitas ayuda con tu eSIM?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Email', onPress: () => Linking.openURL('mailto:support@hablaris.com') },
      ]
    );
  };

  const openSettings = () => {
    Alert.alert(
      '📱 Configuración de eSIM',
      Platform.OS === 'ios' 
        ? 'Para instalar tu eSIM:\n\n1. Ve a Configuración\n2. Toca "Celular" o "Móvil"\n3. Toca "Agregar Plan Celular"\n4. Escanea el código QR\n\n¿Quieres abrir Configuración ahora?'
        : 'Para instalar tu eSIM:\n\n1. Ve a Configuración\n2. Busca "Conexiones" o "Red móvil"\n3. Toca "Gestores de SIM"\n4. Toca "Agregar plan móvil"\n5. Escanea el código QR\n\n¿Quieres abrir Configuración ahora?',
      [
        { text: 'Ahora no', style: 'cancel' },
        { 
          text: 'Abrir Configuración', 
          onPress: () => Linking.openSettings(),
          style: 'default'
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Guía de Instalación eSIM</Text>
        <TouchableOpacity onPress={contactSupport}>
          <Ionicons name="headset" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Platform Toggle */}
      <View style={styles.platformToggle}>
        <TouchableOpacity
          style={[
            styles.platformButton,
            currentPlatform === 'ios' && styles.platformButtonActive,
          ]}
          onPress={() => setCurrentPlatform('ios')}
        >
          <Ionicons 
            name="logo-apple" 
            size={20} 
            color={currentPlatform === 'ios' ? COLORS.white : COLORS.gray[600]} 
          />
          <Text style={[
            styles.platformText,
            currentPlatform === 'ios' && styles.platformTextActive,
          ]}>
            iOS
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.platformButton,
            currentPlatform === 'android' && styles.platformButtonActive,
          ]}
          onPress={() => setCurrentPlatform('android')}
        >
          <Ionicons 
            name="logo-android" 
            size={20} 
            color={currentPlatform === 'android' ? COLORS.white : COLORS.gray[600]} 
          />
          <Text style={[
            styles.platformText,
            currentPlatform === 'android' && styles.platformTextActive,
          ]}>
            Android
          </Text>
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickActionButton} onPress={() => navigation.navigate('QRCodeView', { esim })}>
          <Ionicons name="qr-code" size={24} color={COLORS.primary} />
          <Text style={styles.quickActionText}>Ver QR</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickActionButton} onPress={openSettings}>
          <Ionicons name="settings" size={24} color={COLORS.primary} />
          <Text style={styles.quickActionText}>Configuración</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickActionButton} onPress={contactSupport}>
          <Ionicons name="chatbubble" size={24} color={COLORS.primary} />
          <Text style={styles.quickActionText}>Ayuda</Text>
        </TouchableOpacity>
      </View>

      {/* Guide Steps */}
      <ScrollView style={styles.stepsContainer} showsVerticalScrollIndicator={false}>
        {filteredSteps.map((step, index) => (
          <View key={step.id} style={styles.stepCard}>
            <TouchableOpacity
              style={styles.stepHeader}
              onPress={() => toggleStep(step.id)}
            >
              <View style={styles.stepIcon}>
                <Ionicons name={step.icon as any} size={24} color={COLORS.primary} />
              </View>
              
              <View style={styles.stepInfo}>
                <View style={styles.stepTitleRow}>
                  <Text style={styles.stepNumber}>{index + 1}</Text>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                </View>
                <Text style={styles.stepDescription}>{step.description}</Text>
              </View>
              
              <Ionicons
                name={activeStep === step.id ? "chevron-up" : "chevron-down"}
                size={20}
                color={COLORS.gray[600]}
              />
            </TouchableOpacity>

            {activeStep === step.id && (
              <View style={styles.stepDetails}>
                {step.details.map((detail, detailIndex) => (
                  <View key={detailIndex} style={styles.detailItem}>
                    <Text style={styles.detailBullet}>•</Text>
                    <Text style={styles.detailText}>{detail}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}

        {/* Important Notes */}
        <View style={styles.importantNotes}>
          <View style={styles.noteHeader}>
            <Ionicons name="information-circle" size={24} color={COLORS.warning} />
            <Text style={styles.noteTitle}>Notas Importantes</Text>
          </View>
          
          <Text style={styles.noteText}>
            🔹 Tu eSIM se puede instalar antes del viaje, pero NO la actives hasta llegar a destino
          </Text>
          
          <Text style={styles.noteText}>
            🔹 Mantén activo WiFi o datos móviles durante la instalación
          </Text>
          
          <Text style={styles.noteText}>
            🔹 Una vez instalada, la eSIM no se puede transferir a otro dispositivo
          </Text>
          
          <Text style={styles.noteText}>
            🔹 Desactiva el roaming de datos de tu SIM principal para evitar cargos
          </Text>
        </View>

        {/* Support Section */}
        <View style={styles.supportSection}>
          <Text style={styles.supportTitle}>¿Necesitas ayuda?</Text>
          <Text style={styles.supportText}>
            Nuestro equipo de soporte está disponible 24/7 para ayudarte con cualquier problema.
          </Text>
          
          <TouchableOpacity style={styles.supportButton} onPress={contactSupport}>
            <Ionicons name="chatbubble-ellipses" size={20} color={COLORS.white} />
            <Text style={styles.supportButtonText}>Contactar Soporte</Text>
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
    paddingHorizontal: SPACING.md,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.black,
  },
  platformToggle: {
    flexDirection: 'row',
    marginHorizontal: SPACING.md,
    marginVertical: 16,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 4,
  },
  platformButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 6,
  },
  platformButtonActive: {
    backgroundColor: COLORS.primary,
  },
  platformText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.gray[600],
  },
  platformTextActive: {
    color: COLORS.white,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    marginBottom: 16,
    gap: 8,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    minHeight: 70,
  },
  quickActionText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.primary,
    textAlign: 'center',
    lineHeight: 16,
  },
  stepsContainer: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  stepCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  stepIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${COLORS.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepInfo: {
    flex: 1,
  },
  stepTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
    backgroundColor: COLORS.primary,
    width: 20,
    height: 20,
    borderRadius: 10,
    textAlign: 'center',
    lineHeight: 20,
    marginRight: 8,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
  },
  stepDescription: {
    fontSize: 14,
    color: COLORS.gray[600],
  },
  stepDetails: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 0,
  },
  detailItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailBullet: {
    fontSize: 16,
    color: COLORS.primary,
    marginRight: 8,
    marginTop: 2,
  },
  detailText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.black,
  },
  importantNotes: {
    backgroundColor: `${COLORS.warning}15`,
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.warning,
    marginLeft: 8,
  },
  noteText: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.black,
    marginBottom: 8,
  },
  supportSection: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  supportTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 8,
  },
  supportText: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.gray[600],
    marginBottom: 16,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
  },
  supportButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default ESIMGuideScreenSimple;
