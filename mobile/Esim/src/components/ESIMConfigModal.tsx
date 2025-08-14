import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { ESIMOrder } from '../services/ESIMService';
import APNService from '../services/APNService';

interface ESIMConfigModalProps {
  visible: boolean;
  onClose: () => void;
  esim: ESIMOrder | null;
}

export default function ESIMConfigModal({ visible, onClose, esim }: ESIMConfigModalProps) {
  const [dataRoaming, setDataRoaming] = useState(true);
  const [autoRenewal, setAutoRenewal] = useState(false);
  const [notifications, setNotifications] = useState(true);

  if (!esim) return null;

  const handleActivateESIM = () => {
    Alert.alert(
      'Activar eSIM',
      '¿Estás seguro de que deseas activar esta eSIM? Una vez activada, comenzará el período de validez.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Activar',
          onPress: () => {
            // TODO: Implement actual activation logic
            Alert.alert('eSIM Activada', 'Tu eSIM ha sido activada exitosamente');
            onClose();
          },
        },
      ]
    );
  };

  const handleDeactivateESIM = () => {
    Alert.alert(
      'Desactivar eSIM',
      '¿Estás seguro de que deseas desactivar esta eSIM? Podrás reactivarla más tarde.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desactivar',
          style: 'destructive',
          onPress: () => {
            Alert.alert('eSIM Desactivada', 'Tu eSIM ha sido desactivada');
            onClose();
          },
        },
      ]
    );
  };

  const ConfigItem = ({ 
    icon, 
    title, 
    subtitle, 
    value, 
    onValueChange, 
    onPress,
    type = 'switch' 
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    value?: boolean;
    onValueChange?: (value: boolean) => void;
    onPress?: () => void;
    type?: 'switch' | 'button';
  }) => (
    <TouchableOpacity 
      style={styles.configItem}
      onPress={type === 'button' ? onPress : undefined}
      disabled={type === 'switch'}
    >
      <View style={styles.configItemLeft}>
        <View style={styles.configIcon}>
          <Ionicons name={icon as any} size={20} color={COLORS.primary} />
        </View>
        <View style={styles.configContent}>
          <Text style={styles.configTitle}>{title}</Text>
          {subtitle && <Text style={styles.configSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {type === 'switch' && (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: COLORS.border, true: COLORS.primary }}
          thumbColor={value ? COLORS.surface : '#f4f3f4'}
        />
      )}
      {type === 'button' && (
        <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
      )}
    </TouchableOpacity>
  );

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
            <Text style={styles.title}>Configuración eSIM</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
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

            {/* Network Settings */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🌐 Configuración de Red</Text>
              
              <ConfigItem
                icon="cellular"
                title="Roaming de Datos"
                subtitle="Permitir uso de datos en el extranjero"
                value={dataRoaming}
                onValueChange={setDataRoaming}
              />
              
              <ConfigItem
                icon="settings"
                title="Configuración APN"
                subtitle="Configurar puntos de acceso automáticamente"
                type="button"
                onPress={() => APNService.configureAPN(esim)}
              />
            </View>

            {/* Plan Management */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📋 Gestión del Plan</Text>
              
              <ConfigItem
                icon="refresh"
                title="Renovación Automática"
                subtitle="Renovar automáticamente antes de expirar"
                value={autoRenewal}
                onValueChange={setAutoRenewal}
              />
              
              <ConfigItem
                icon="notifications"
                title="Notificaciones"
                subtitle="Alertas de uso y vencimiento"
                value={notifications}
                onValueChange={setNotifications}
              />
            </View>

            {/* Device Settings */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📱 Configuración del Dispositivo</Text>
              
              <ConfigItem
                icon="download"
                title="Perfil de Red"
                subtitle="Descargar configuración automática"
                type="button"
                onPress={() => Alert.alert('Perfil de Red', 'Descargando configuración automática...')}
              />
              
              <ConfigItem
                icon="information-circle"
                title="Información Técnica"
                subtitle="ICCID, APN, configuración avanzada"
                type="button"
                onPress={() => APNService.showAPNInstructions(esim)}
              />

              <ConfigItem
                icon="wifi"
                title="Probar Conexión"
                subtitle="Verificar conectividad de la eSIM"
                type="button"
                onPress={() => APNService.testConnection(esim)}
              />
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              {esim.status === 'paid' && (
                <TouchableOpacity style={styles.activateButton} onPress={handleActivateESIM}>
                  <Ionicons name="play" size={20} color={COLORS.surface} />
                  <Text style={styles.activateButtonText}>Activar eSIM</Text>
                </TouchableOpacity>
              )}
              
              {esim.status === 'activated' && (
                <TouchableOpacity style={styles.deactivateButton} onPress={handleDeactivateESIM}>
                  <Ionicons name="pause" size={20} color="#dc3545" />
                  <Text style={styles.deactivateButtonText}>Desactivar eSIM</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity style={styles.helpButton}>
                <Ionicons name="help-circle" size={20} color={COLORS.primary} />
                <Text style={styles.helpButtonText}>Centro de Ayuda</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
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
    marginBottom: 24,
    padding: 16,
    backgroundColor: COLORS.background,
    borderRadius: 12,
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  configItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    marginBottom: 8,
  },
  configItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  configIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  configContent: {
    flex: 1,
  },
  configTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 2,
  },
  configSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  actions: {
    marginTop: 20,
    marginBottom: 10,
  },
  activateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#28a745',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    marginBottom: 12,
  },
  activateButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  deactivateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#dc3545',
  },
  deactivateButtonText: {
    color: '#dc3545',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
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
