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

  const qrSize = screenWidth * 0.65;

  // Generar QR code demo si no existe
  const qrData = esim?.qr_code || esim?.activation_code || generateDemoQRData();

  function generateDemoQRData() {
    return JSON.stringify({
      smdpAddress: 'sm-dp.example.com',
      activationCode: `DEMO-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      iccid: esim?.iccid || '8901260123456789012',
      provider: provider,
    });
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
    await Clipboard.setStringAsync(code);
    Alert.alert('Copiado', 'Código de activación copiado al portapapeles');
  };

  const saveQRCode = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos requeridos', 'Necesitamos acceso a la galería para guardar el QR');
        return;
      }

      const uri = await qrRef.current?.capture?.();
      if (uri) {
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert('Guardado', 'Código QR guardado en la galería');
      }
    } catch (error) {
      console.error('Error saving QR code:', error);
      Alert.alert('Error', 'No se pudo guardar el código QR');
    }
  };

  const shareQRCode = async () => {
    try {
      const uri = await qrRef.current?.capture?.();
      if (uri) {
        await Share.share({
          url: uri,
          message: `Mi código QR eSIM para ${esim?.planName || 'viaje'}`,
        });
      }
    } catch (error) {
      console.error('Error sharing QR code:', error);
    }
  };

  const openGuide = () => {
    navigation.navigate('ESIMGuide', { esim, provider });
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
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Código QR eSIM</Text>
        <TouchableOpacity onPress={openGuide}>
          <Ionicons name="help-circle" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* eSIM Info */}
      <View style={styles.esimInfo}>
        <View style={styles.providerBadge} style={[styles.providerBadge, { backgroundColor: currentProvider.color }]}>
          <Text style={styles.providerText}>{currentProvider.name}</Text>
        </View>
        <Text style={styles.planName}>{esim?.planName || esim?.plan?.name || 'Plan de Datos'}</Text>
        <Text style={styles.planDetails}>
          {esim?.planData || esim?.plan?.data_amount_gb + 'GB'} • {esim?.planCountries || esim?.plan?.countries?.length + ' países'}
        </Text>
        <Text style={styles.iccid}>ICCID: {esim?.iccid}</Text>
      </View>

      {/* QR Code */}
      <View style={styles.qrContainer}>
        <ViewShot ref={qrRef} style={styles.qrWrapper}>
          <View style={styles.qrCodeContainer}>
            <QRCode
              value={qrData}
              size={qrSize}
              color={COLORS.text}
              backgroundColor={COLORS.surface}
              logo={require('../assets/logo.png')} // Asegúrate de tener el logo
              logoSize={qrSize * 0.15}
              logoBackgroundColor={COLORS.surface}
              logoBorderRadius={8}
            />
          </View>
          
          <Text style={styles.qrLabel}>Código QR eSIM - {currentProvider.name}</Text>
          <Text style={styles.qrSubLabel}>Escanea con la cámara de tu dispositivo</Text>
        </ViewShot>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionButton} onPress={saveQRCode}>
          <Ionicons name="download" size={20} color={COLORS.primary} />
          <Text style={styles.actionText}>Guardar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={shareQRCode}>
          <Ionicons name="share" size={20} color={COLORS.primary} />
          <Text style={styles.actionText}>Compartir</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => setShowActivationCode(!showActivationCode)}
        >
          <Ionicons name="code" size={20} color={COLORS.primary} />
          <Text style={styles.actionText}>Código</Text>
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
              {esim?.activation_code || 'DEMO-' + Math.random().toString(36).substr(2, 9).toUpperCase()}
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
          <Ionicons name="book" size={20} color={COLORS.surface} />
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
    paddingHorizontal: SIZES.padding,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  esimInfo: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: SIZES.padding,
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
    color: COLORS.surface,
  },
  planName: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  planDetails: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  iccid: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  qrContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  qrWrapper: {
    alignItems: 'center',
  },
  qrCodeContainer: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  qrLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
  },
  qrSubLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.padding,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary,
  },
  activationSection: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SIZES.padding,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  activationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  activationSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activationCode: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  codeHint: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  instructionsSection: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SIZES.padding,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
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
    color: COLORS.text,
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
    color: COLORS.surface,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: `${COLORS.warning}15`,
    marginHorizontal: SIZES.padding,
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    color: COLORS.text,
    marginLeft: 8,
  },
});

export default QRCodeViewScreen;
