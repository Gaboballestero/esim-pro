import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants';
import QRScanner from '../components/QRScanner';
import { ESIMService } from '../services/ESIMService';

const QRScannerScreen: React.FC = () => {
  const [showScanner, setShowScanner] = useState(true);

  const handleQRScan = async (qrData: string) => {
    try {
      // Procesar el código QR escaneado
      Alert.alert(
        'eSIM Detectada',
        'Procesando código QR...',
        [{ text: 'OK' }]
      );
      
      // Aquí podrías llamar a un servicio para procesar el QR
      console.log('QR Data:', qrData);
      
      // Simular procesamiento exitoso
      setTimeout(() => {
        Alert.alert(
          '¡Éxito!',
          'eSIM agregada exitosamente a tu cuenta.',
          [{ text: 'OK', onPress: () => setShowScanner(false) }]
        );
      }, 2000);
      
    } catch (error) {
      Alert.alert('Error', 'No se pudo procesar el código QR');
    }
  };

  if (showScanner) {
    return (
      <QRScanner
        onClose={() => setShowScanner(false)}
        onScan={handleQRScan}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Escáner QR</Text>
        <Text style={styles.subtitle}>
          Escanea el código QR para activar tu eSIM
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.black,
    marginBottom: SPACING.md,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.gray[600],
    textAlign: 'center',
  },
});

export default QRScannerScreen;
