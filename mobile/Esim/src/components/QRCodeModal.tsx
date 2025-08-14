import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { COLORS, SIZES } from '../constants/theme';
import { ESIMOrder } from '../services/ESIMService';

interface QRCodeModalProps {
  visible: boolean;
  onClose: () => void;
  esim: ESIMOrder | null;
}

export default function QRCodeModal({ visible, onClose, esim }: QRCodeModalProps) {
  if (!esim) return null;

  // Generate QR Code data for eSIM activation
  const generateQRData = () => {
    // Standard eSIM QR code format: LPA:1$rsp-server$activation-code
    return `LPA:1$esimpro.com$${esim.iccid}$${esim.activation_code || 'DEMO123'}`;
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `eSIM Activation Code\nPlan: ${esim.plan.name}\nICCID: ${esim.iccid}\nActivation: ${esim.activation_code || 'DEMO123'}`,
        title: 'eSIM Configuration',
      });
    } catch (error) {
      Alert.alert('Error', 'No se pudo compartir el código QR');
    }
  };

  const handleCopyICCID = () => {
    // In a real app, you would copy to clipboard
    Alert.alert(
      'ICCID Copiado',
      `ICCID: ${esim.iccid}\n\n¡Código copiado al portapapeles!`,
      [{ text: 'OK' }]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Código QR eSIM</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          {/* Plan Info */}
          <View style={styles.planInfo}>
            <Text style={styles.planName}>{esim.plan.name}</Text>
            <View style={styles.statusContainer}>
              <View style={[styles.statusDot, { 
                backgroundColor: esim.status === 'activated' ? '#28a745' : '#17a2b8' 
              }]} />
              <Text style={styles.statusText}>
                {esim.status === 'activated' ? 'Activo' : 'Pagado'}
              </Text>
            </View>
          </View>

          {/* QR Code */}
          <View style={styles.qrContainer}>
            <QRCode
              value={generateQRData()}
              size={200}
              backgroundColor={COLORS.surface}
              color={COLORS.text}
            />
          </View>

          {/* Instructions */}
          <View style={styles.instructions}>
            <Text style={styles.instructionTitle}>📱 Instrucciones de Activación</Text>
            <Text style={styles.instructionText}>
              1. Ve a Configuración → Celular/Móvil{'\n'}
              2. Toca "Agregar Plan Celular"{'\n'}
              3. Escanea este código QR{'\n'}
              4. Sigue las instrucciones en pantalla
            </Text>
          </View>

          {/* ICCID Info */}
          <TouchableOpacity style={styles.iccidContainer} onPress={handleCopyICCID}>
            <View style={styles.iccidInfo}>
              <Text style={styles.iccidLabel}>ICCID</Text>
              <Text style={styles.iccidValue}>{esim.iccid}</Text>
            </View>
            <Ionicons name="copy" size={20} color={COLORS.primary} />
          </TouchableOpacity>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <Ionicons name="share" size={20} color={COLORS.surface} />
              <Text style={styles.shareButtonText}>Compartir</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.helpButton}>
              <Ionicons name="help-circle" size={20} color={COLORS.primary} />
              <Text style={styles.helpButtonText}>Ayuda</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    margin: 20,
    width: '90%',
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  closeButton: {
    padding: 4,
  },
  planInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  qrContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  instructions: {
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  iccidContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  iccidInfo: {
    flex: 1,
  },
  iccidLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  iccidValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    justifyContent: 'center',
  },
  shareButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  helpButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
