import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../constants';

interface ConfigurationStep {
  title: string;
  description: string;
  action?: () => void;
  actionText?: string;
  status?: 'pending' | 'completed' | 'error';
}

const OAuthConfigScreen: React.FC = () => {
  const googleSteps: ConfigurationStep[] = [
    {
      title: '1. Google Cloud Console',
      description: 'Crear proyecto en Google Cloud Console y habilitar Google+ API',
      action: () => Linking.openURL('https://console.cloud.google.com/'),
      actionText: 'Abrir Console',
      status: 'pending',
    },
    {
      title: '2. Crear credenciales OAuth 2.0',
      description: 'Configurar URLs autorizadas y descargar archivo de configuración',
      status: 'pending',
    },
    {
      title: '3. Configurar aplicación móvil',
      description: 'Actualizar CLIENT_ID en OAuthService.ts',
      status: 'pending',
    },
  ];

  const appleSteps: ConfigurationStep[] = [
    {
      title: '1. Apple Developer Console',
      description: 'Crear App ID con Sign In with Apple habilitado',
      action: () => Linking.openURL('https://developer.apple.com/'),
      actionText: 'Abrir Developer',
      status: 'pending',
    },
    {
      title: '2. Crear Service ID',
      description: 'Configurar dominios y URLs de retorno para web',
      status: 'pending',
    },
    {
      title: '3. Generar clave privada',
      description: 'Descargar archivo .p8 para verificación de tokens',
      status: 'pending',
    },
  ];

  const showConfigInstructions = () => {
    Alert.alert(
      'Configuración OAuth',
      'Para usar autenticación social, necesitas:\n\n' +
      '🔹 Google: Client ID desde Google Cloud Console\n' +
      '🔹 Apple: Bundle ID y certificados desde Apple Developer\n\n' +
      'Ver documentación completa en OAUTH_SETUP.md',
      [
        { text: 'Entendido', style: 'default' },
        { 
          text: 'Ver Documentación', 
          onPress: () => {
            // Aquí podrías abrir la documentación local o un enlace
            Alert.alert('Documentación', 'Ver archivo OAUTH_SETUP.md en la carpeta backend');
          }
        },
      ]
    );
  };

  const renderSteps = (steps: ConfigurationStep[], title: string, icon: string) => (
    <View style={styles.providerSection}>
      <View style={styles.providerHeader}>
        <Ionicons name={icon as any} size={24} color={COLORS.primary} />
        <Text style={styles.providerTitle}>{title}</Text>
      </View>
      
      {steps.map((step, index) => (
        <View key={index} style={styles.stepContainer}>
          <View style={styles.stepHeader}>
            <View style={[
              styles.stepIndicator, 
              step.status === 'completed' ? styles.status_completed :
              step.status === 'error' ? styles.status_error : 
              styles.status_pending
            ]}>
              {step.status === 'completed' ? (
                <Ionicons name="checkmark" size={16} color={COLORS.white} />
              ) : step.status === 'error' ? (
                <Ionicons name="close" size={16} color={COLORS.white} />
              ) : (
                <Text style={styles.stepNumber}>{index + 1}</Text>
              )}
            </View>
            <Text style={styles.stepTitle}>{step.title}</Text>
          </View>
          
          <Text style={styles.stepDescription}>{step.description}</Text>
          
          {step.action && step.actionText && (
            <TouchableOpacity style={styles.stepAction} onPress={step.action}>
              <Text style={styles.stepActionText}>{step.actionText}</Text>
              <Ionicons name="open-outline" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Ionicons name="settings-outline" size={32} color={COLORS.primary} />
        <Text style={styles.title}>Configuración OAuth</Text>
        <Text style={styles.subtitle}>
          Configura Google y Apple Sign In para tu aplicación
        </Text>
      </View>

      <TouchableOpacity style={styles.infoButton} onPress={showConfigInstructions}>
        <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
        <Text style={styles.infoButtonText}>Ver instrucciones completas</Text>
      </TouchableOpacity>

      {renderSteps(googleSteps, 'Google Sign In', 'logo-google')}
      {renderSteps(appleSteps, 'Apple Sign In', 'logo-apple')}

      <View style={styles.warningBox}>
        <Ionicons name="warning-outline" size={24} color={COLORS.warning} />
        <View style={styles.warningContent}>
          <Text style={styles.warningTitle}>Importante</Text>
          <Text style={styles.warningText}>
            Los botones OAuth no funcionarán hasta completar la configuración.
            Actualiza las constantes en OAuthService.ts con tus credenciales reales.
          </Text>
        </View>
      </View>

      <View style={styles.codeExample}>
        <Text style={styles.codeTitle}>Ejemplo de configuración:</Text>
        <View style={styles.codeBlock}>
          <Text style={styles.codeText}>
            {`// En OAuthService.ts
GoogleSignin.configure({
  webClientId: 'tu-client-id.apps.googleusercontent.com',
  iosClientId: 'tu-ios-client-id.apps.googleusercontent.com',
});`}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: '800',
    color: COLORS.gray[900],
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.gray[600],
    textAlign: 'center',
    lineHeight: 22,
  },
  infoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary + '15',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.xl,
    gap: SPACING.xs,
  },
  infoButtonText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  providerSection: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  providerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  providerTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: COLORS.gray[900],
  },
  stepContainer: {
    marginBottom: SPACING.lg,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  stepIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  status_pending: {
    backgroundColor: COLORS.gray[400],
  },
  status_completed: {
    backgroundColor: COLORS.success,
  },
  status_error: {
    backgroundColor: COLORS.error,
  },
  stepNumber: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '700',
    color: COLORS.white,
  },
  stepTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    color: COLORS.gray[900],
  },
  stepDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[600],
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  stepAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  stepActionText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.warning + '15',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '700',
    color: COLORS.warning,
    marginBottom: SPACING.xs,
  },
  warningText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[700],
    lineHeight: 18,
  },
  codeExample: {
    marginTop: SPACING.lg,
  },
  codeTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: COLORS.gray[700],
    marginBottom: SPACING.sm,
  },
  codeBlock: {
    backgroundColor: COLORS.gray[900],
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  codeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[100],
    fontFamily: 'monospace',
    lineHeight: 18,
  },
});

export default OAuthConfigScreen;
