import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants';

interface QRScannerProps {
  onClose: () => void;
  onScan: (data: string) => void;
}

export default function QRScanner({ onClose, onScan }: QRScannerProps) {
  const handleMockScan = () => {
    Alert.alert(
      'Escáner no disponible',
      'El escáner QR no está disponible en Expo Go. Necesitas un development build para usar la cámara.',
      [
        { text: 'OK', onPress: onClose }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={COLORS.white} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <Ionicons name="qr-code-outline" size={100} color={COLORS.gray[400]} />
        <Text style={styles.title}>Escáner QR</Text>
        <Text style={styles.subtitle}>
          Para usar el escáner QR necesitas un development build.
          En Expo Go esta funcionalidad no está disponible.
        </Text>
        
        <TouchableOpacity style={styles.mockButton} onPress={handleMockScan}>
          <Text style={styles.mockButtonText}>Simular Escaneo</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  closeButton: {
    padding: SPACING.sm,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.white,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.gray[300],
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  mockButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 8,
  },
  mockButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});
