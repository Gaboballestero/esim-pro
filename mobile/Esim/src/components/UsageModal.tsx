import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { ESIMOrder } from '../services/ESIMService';

interface UsageModalProps {
  visible: boolean;
  onClose: () => void;
  esim: ESIMOrder | null;
}

export default function UsageModal({ visible, onClose, esim }: UsageModalProps) {
  const [timeRange, setTimeRange] = useState('7d'); // 7d, 30d, 90d
  const [usageData, setUsageData] = useState({
    daily: [0.2, 0.45, 0.28, 0.80, 0.99, 0.43, 0.83],
    labels: ['L', 'M', 'M', 'J', 'V', 'S', 'D'],
  });

  if (!esim) return null;

  const dataUsedGB = (esim.data_used_mb / 1024).toFixed(2);
  const dataRemainingGB = (esim.data_remaining_mb / 1024).toFixed(2);
  const dataTotalGB = ((esim.data_used_mb + esim.data_remaining_mb) / 1024).toFixed(0);
  const usagePercentage = (esim.data_used_mb / (esim.data_used_mb + esim.data_remaining_mb)) * 100;

  const chartConfig = {
    backgroundColor: COLORS.surface,
    backgroundGradientFrom: COLORS.surface,
    backgroundGradientTo: COLORS.surface,
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(46, 125, 190, ${opacity})`,
    labelColor: (opacity = 1) => COLORS.textSecondary,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: COLORS.primary,
    },
  };

  const UsageStat = ({ icon, label, value, unit, color = COLORS.primary }: any) => (
    <View style={styles.usageStat}>
      <View style={[styles.usageStatIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={20} color={COLORS.surface} />
      </View>
      <View style={styles.usageStatContent}>
        <Text style={styles.usageStatValue}>
          {value}
          <Text style={styles.usageStatUnit}> {unit}</Text>
        </Text>
        <Text style={styles.usageStatLabel}>{label}</Text>
      </View>
    </View>
  );

  const TimeRangeButton = ({ range, label }: { range: string; label: string }) => (
    <TouchableOpacity
      style={[
        styles.timeRangeButton,
        timeRange === range && styles.timeRangeButtonActive,
      ]}
      onPress={() => setTimeRange(range)}
    >
      <Text
        style={[
          styles.timeRangeButtonText,
          timeRange === range && styles.timeRangeButtonTextActive,
        ]}
      >
        {label}
      </Text>
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
            <Text style={styles.title}>Uso de Datos</Text>
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

            {/* Usage Overview */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📊 Resumen de Uso</Text>
              
              <View style={styles.progressContainer}>
                <View style={styles.progressInfo}>
                  <Text style={styles.progressUsed}>{dataUsedGB} GB</Text>
                  <Text style={styles.progressTotal}>de {dataTotalGB} GB</Text>
                </View>
                <View style={styles.progressBar}>
                  <View 
                    style={[styles.progressFill, { width: `${Math.min(usagePercentage, 100)}%` }]} 
                  />
                </View>
                <Text style={styles.progressPercentage}>{usagePercentage.toFixed(0)}%</Text>
              </View>

              <View style={styles.usageStats}>
                <UsageStat
                  icon="cloud-download"
                  label="Usado"
                  value={dataUsedGB}
                  unit="GB"
                  color="#2e7dbe"
                />
                <UsageStat
                  icon="cloud"
                  label="Restante"
                  value={dataRemainingGB}
                  unit="GB"
                  color="#28a745"
                />
                <UsageStat
                  icon="time"
                  label="Días restantes"
                  value="15"
                  unit="días"
                  color="#ffa500"
                />
              </View>
            </View>

            {/* Time Range Selector */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📈 Uso por Período</Text>
              
              <View style={styles.timeRangeSelector}>
                <TimeRangeButton range="7d" label="7 días" />
                <TimeRangeButton range="30d" label="30 días" />
                <TimeRangeButton range="90d" label="90 días" />
              </View>
            </View>

            {/* Usage Chart Placeholder */}
            <View style={styles.chartContainer}>
              <View style={styles.chartPlaceholder}>
                <Ionicons name="bar-chart" size={48} color={COLORS.primary} />
                <Text style={styles.chartPlaceholderText}>
                  Gráfico de uso diario
                </Text>
                <Text style={styles.chartPlaceholderSubtext}>
                  Próximamente: gráficos detallados de consumo
                </Text>
              </View>
            </View>

            {/* Usage Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📱 Detalles de Conexión</Text>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Última conexión</Text>
                <Text style={styles.detailValue}>Hace 2 horas</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Red actual</Text>
                <Text style={styles.detailValue}>Vodafone ES</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Velocidad promedio</Text>
                <Text style={styles.detailValue}>25.3 Mbps</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Localización</Text>
                <Text style={styles.detailValue}>Madrid, España</Text>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="refresh" size={20} color={COLORS.primary} />
                <Text style={styles.actionButtonText}>Actualizar Datos</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="download" size={20} color={COLORS.primary} />
                <Text style={styles.actionButtonText}>Exportar Reporte</Text>
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
    maxHeight: '95%',
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
  progressContainer: {
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressUsed: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  progressTotal: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
  },
  usageStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  usageStat: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  usageStatIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  usageStatContent: {
    alignItems: 'center',
  },
  usageStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  usageStatUnit: {
    fontSize: 12,
    fontWeight: 'normal',
    color: COLORS.textSecondary,
  },
  usageStatLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  timeRangeSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  timeRangeButtonActive: {
    backgroundColor: COLORS.primary,
  },
  timeRangeButtonText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  timeRangeButtonTextActive: {
    color: COLORS.surface,
    fontWeight: '600',
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  chartPlaceholder: {
    backgroundColor: COLORS.background,
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  chartPlaceholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 12,
    marginBottom: 4,
  },
  chartPlaceholderSubtext: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});
