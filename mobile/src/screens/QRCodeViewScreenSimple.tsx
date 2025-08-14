import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
  Linking,
  Clipboard,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../constants/theme';

const { width: screenWidth } = Dimensions.get('window');

interface QRCodeViewScreenProps {
  navigation: any;
  route: {
    params: {
      esim: any;
      provider?: string;
    };
  };
}

const QRCodeViewScreen = ({ navigation, route }: QRCodeViewScreenProps) => {
  const { esim, provider = 'hablaris' } = route.params;
  const [showActivationCode, setShowActivationCode] = useState(false);

  // Generar QR code demo si no existe
  const qrData = esim?.qr_code || esim?.activation_code || generateDemoQRData();

  function generateDemoQRData() {
    return `LPA:1$sm-dp.example.com$DEMO-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  const providerInstructions = {
    hablaris: {
      name: 'Hablaris',
      color: COLORS.primary,
      instructions: [
        'Escanea este código QR con tu dispositivo',
        'O usa el código de activación manual',
        'La eSIM se configurará automáticamente',
        'Activa solo al llegar a tu destino',
      ],
    },
    '1global': {
      name: '1Global',
      color: '#00A3FF',
      instructions: [
        'Abre Configuración > Celular en iOS',
        'Toca "Agregar Plan Celular"',
        'Escanea este código QR',
        'Sigue las instrucciones de 1Global',
      ],
    },
    airalo: {
      name: 'Airalo',
      color: '#FF6B6B',
      instructions: [
        'Descarga la app Airalo',
        'Ve a "Mis eSIMs" > "Instalar eSIM"',
        'Escanea este código QR',
        'Confirma la instalación',
      ],
    },
    truphone: {
      name: 'Truphone',
      color: '#7B68EE',
      instructions: [
        'Ve a Configuración de red móvil',
        'Selecciona "Agregar operador"',
        'Escanea el código QR de Truphone',
        'Acepta los términos y condiciones',
      ],
    },
  };

  const currentProvider = providerInstructions[provider as keyof typeof providerInstructions] || providerInstructions.hablaris;

  const copyActivationCode = async () => {
    const code = esim?.activation_code || qrData;
    Clipboard.setString(code);
    Alert.alert('Copiado', 'Código de activación copiado al portapapeles');
  };

  const openGuide = () => {
    navigation.navigate('ESIMGuide', { esim, provider });
  };

  const openSettings = () => {
    Alert.alert(
      '📱 Configuración de eSIM',
      Platform.OS === 'ios' 
        ? 'Para instalar tu eSIM:\n\n1. Ve a Configuración\n2. Toca "Celular" o "Móvil"\n3. Toca "Agregar Plan Celular"\n4. Escanea el código QR mostrado arriba\n\n¿Quieres abrir Configuración ahora?'
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

  const getActivationInstructions = () => {
    const platform = Platform.OS;
    
    if (platform === 'ios') {
      return [
        '1. Ve a Configuración > Celular',
        '2. Toca "Agregar Plan Celular"',
        '3. Usa la cámara para escanear este QR',
        '4. Sigue las instrucciones en pantalla',
        '5. Etiqueta tu eSIM para identificarla',
      ];
    } else {
      return [
        '1. Ve a Configuración > Conexiones',
        '2. Toca "Gestores de SIM"',
        '3. Selecciona "Agregar plan móvil"',
        '4. Escanea este código QR',
        '5. Confirma la descarga del plan',
      ];
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Código QR eSIM</Text>
        <TouchableOpacity onPress={openGuide}>
          <Ionicons name="help-circle" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* eSIM Info */}
        <View style={styles.esimInfo}>
          <View style={[styles.providerBadge, { backgroundColor: currentProvider.color }]}>
            <Text style={styles.providerText}>{currentProvider.name}</Text>
          </View>
          <Text style={styles.planName}>{esim?.planName || esim?.plan?.name || 'Plan de Datos'}</Text>
          <Text style={styles.planDetails}>
            {esim?.planData || esim?.plan?.data_amount_gb + 'GB'} • {esim?.planCountries || esim?.plan?.countries?.length + ' países'}
          </Text>
          <Text style={styles.iccid}>ICCID: {esim?.iccid}</Text>
        </View>

        {/* QR Code Placeholder */}
        <View style={styles.qrContainer}>
          <View style={styles.qrCodeContainer}>
            <View style={styles.qrPlaceholder}>
              <Ionicons name="qr-code" size={120} color={COLORS.gray[400]} />
              <Text style={styles.qrPlaceholderText}>Código QR eSIM</Text>
              <Text style={styles.qrSubText}>Usa la cámara de tu teléfono para escanear</Text>
            </View>
          </View>
          
          <Text style={styles.qrLabel}>Código QR eSIM - {currentProvider.name}</Text>
          <Text style={styles.qrSubLabel}>Escanea con la cámara de tu dispositivo</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => setShowActivationCode(!showActivationCode)}
          >
            <Ionicons name="code" size={24} color={COLORS.primary} />
            <Text style={styles.actionText}>Código{'\n'}Manual</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={openSettings}>
            <Ionicons name="settings" size={24} color={COLORS.primary} />
            <Text style={styles.actionText}>Configuración</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={openGuide}>
            <Ionicons name="book" size={24} color={COLORS.primary} />
            <Text style={styles.actionText}>Guía</Text>
          </TouchableOpacity>
        </View>

        {/* Activation Code */}
        {showActivationCode && (
          <View style={styles.activationSection}>
            <Text style={styles.activationTitle}>Código de Activación Manual</Text>
            <Text style={styles.activationSubtitle}>
              Si no puedes escanear el QR, usa este código:
            </Text>
            
            <TouchableOpacity style={styles.codeContainer} onPress={copyActivationCode}>
              <Text style={styles.activationCode}>
                {esim?.activation_code || qrData}
              </Text>
              <Ionicons name="copy" size={16} color={COLORS.primary} />
            </TouchableOpacity>
            
            <Text style={styles.codeHint}>Toca para copiar</Text>
          </View>
        )}

        {/* Installation Instructions */}
        <View style={styles.instructionsSection}>
          <Text style={styles.instructionsTitle}>Instrucciones de Instalación</Text>
          
          <View style={styles.platformIndicator}>
            <Ionicons 
              name={Platform.OS === 'ios' ? 'logo-apple' : 'logo-android'} 
              size={16} 
              color={COLORS.primary} 
            />
            <Text style={styles.platformText}>
              {Platform.OS === 'ios' ? 'iOS/iPhone' : 'Android'}
            </Text>
          </View>

          {getActivationInstructions().map((instruction, index) => (
            <View key={index} style={styles.instructionItem}>
              <Text style={styles.instructionBullet}>•</Text>
              <Text style={styles.instructionText}>{instruction}</Text>
            </View>
          ))}

          <TouchableOpacity style={styles.guideButton} onPress={openGuide}>
            <Ionicons name="book" size={20} color={COLORS.white} />
            <Text style={styles.guideButtonText}>Ver Guía Completa</Text>
          </TouchableOpacity>
        </View>

        {/* Important Note */}
        <View style={styles.warningContainer}>
          <Ionicons name="warning" size={20} color={COLORS.warning} />
          <Text style={styles.warningText}>
            ⚠️ Instala la eSIM antes del viaje, pero NO la actives hasta llegar a tu destino
          </Text>
        </View>

        {/* Provider Specific Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>💡 Consejos para {currentProvider.name}</Text>
          {currentProvider.instructions.map((tip, index) => (
            <View key={index} style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
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
  content: {
    flex: 1,
  },
  esimInfo: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: SPACING.md,
  },
  providerBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  providerText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
  planName: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: 4,
  },
  planDetails: {
    fontSize: 14,
    color: COLORS.gray[600],
    marginBottom: 8,
  },
  iccid: {
    fontSize: 12,
    color: COLORS.gray[500],
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  qrContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  qrCodeContainer: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  qrPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    width: screenWidth * 0.65,
    height: screenWidth * 0.65,
  },
  qrPlaceholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray[600],
    marginTop: 8,
  },
  qrSubText: {
    fontSize: 12,
    color: COLORS.gray[500],
    textAlign: 'center',
    marginTop: 4,
  },
  qrLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
    marginTop: 16,
  },
  qrSubLabel: {
    fontSize: 12,
    color: COLORS.gray[600],
    marginTop: 4,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    marginBottom: 20,
    gap: 8,
  },
  actionButton: {
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
  actionText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.primary,
    textAlign: 'center',
    lineHeight: 16,
  },
  activationSection: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  activationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 4,
  },
  activationSubtitle: {
    fontSize: 14,
    color: COLORS.gray[600],
    marginBottom: 12,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.gray[50],
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  activationCode: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    flex: 1,
  },
  codeHint: {
    fontSize: 12,
    color: COLORS.gray[500],
    textAlign: 'center',
    marginTop: 8,
  },
  instructionsSection: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 12,
  },
  platformIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  platformText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  instructionBullet: {
    fontSize: 16,
    color: COLORS.primary,
    marginRight: 8,
    marginTop: 2,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.black,
  },
  guideButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  guideButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: `${COLORS.warning}15`,
    marginHorizontal: SPACING.md,
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    color: COLORS.black,
    marginLeft: 8,
  },
  tipsSection: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tipBullet: {
    fontSize: 16,
    color: COLORS.primary,
    marginRight: 8,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.gray[700],
  },
});

export default QRCodeViewScreen;
