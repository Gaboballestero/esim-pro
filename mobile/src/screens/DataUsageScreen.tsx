import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../constants';

type DataUsageScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface DataUsage {
  date: string;
  used: number;
  total: number;
  cost: number;
}

interface ESIMDetails {
  id: string;
  country: string;
  operator: string;
  plan: string;
  dataRemaining: number;
  totalData: number;
  expiryDate: string;
  status: 'active' | 'expired' | 'inactive';
  dailyUsage: DataUsage[];
}

const DataUsageScreen: React.FC = () => {
  const navigation = useNavigation<DataUsageScreenNavigationProp>();
  const [esimData, setEsimData] = useState<ESIMDetails | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

  useEffect(() => {
    // Mock data - replace with API call
    setEsimData({
      id: 'esim_123',
      country: 'España',
      operator: 'Vodafone',
      plan: '5GB - 30 días',
      dataRemaining: 3.2,
      totalData: 5,
      expiryDate: '2025-02-15',
      status: 'active',
      dailyUsage: [
        { date: '2025-01-30', used: 0.5, total: 5, cost: 0.8 },
        { date: '2025-01-31', used: 0.3, total: 5, cost: 0.5 },
        { date: '2025-02-01', used: 0.7, total: 5, cost: 1.1 },
        { date: '2025-02-02', used: 0.2, total: 5, cost: 0.3 },
        { date: '2025-02-03', used: 0.4, total: 5, cost: 0.6 },
        { date: '2025-02-04', used: 0.6, total: 5, cost: 0.9 },
        { date: '2025-02-05', used: 0.1, total: 5, cost: 0.2 },
      ],
    });
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return COLORS.success;
      case 'expired':
        return COLORS.error;
      case 'inactive':
        return COLORS.warning;
      default:
        return COLORS.gray[400];
    }
  };

  const getUsagePercentage = () => {
    if (!esimData) return 0;
    return ((esimData.totalData - esimData.dataRemaining) / esimData.totalData) * 100;
  };

  const handleTopUp = () => {
    Alert.alert(
      'Recargar Datos',
      '¿Deseas agregar más datos a tu eSIM?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Recargar', onPress: () => navigation.navigate('Shop') },
      ]
    );
  };

  if (!esimData) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Cargando...</Text>
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
        <Text style={styles.headerTitle}>Uso de Datos</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Current Usage Overview */}
        <View style={styles.usageCard}>
          <View style={styles.usageHeader}>
            <Text style={styles.countryName}>{esimData.country}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(esimData.status) }]}>
              <Text style={styles.statusText}>
                {esimData.status === 'active' ? 'Activo' : 
                 esimData.status === 'expired' ? 'Expirado' : 'Inactivo'}
              </Text>
            </View>
          </View>
          
          <Text style={styles.operatorText}>{esimData.operator} • {esimData.plan}</Text>
          
          <View style={styles.dataUsageContainer}>
            <View style={styles.dataUsageInfo}>
              <Text style={styles.dataRemaining}>{esimData.dataRemaining.toFixed(1)} GB</Text>
              <Text style={styles.dataTotal}>de {esimData.totalData} GB restantes</Text>
            </View>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${getUsagePercentage()}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>{getUsagePercentage().toFixed(0)}% usado</Text>
            </View>
          </View>

          <View style={styles.expiryContainer}>
            <Ionicons name="time-outline" size={16} color={COLORS.gray[600]} />
            <Text style={styles.expiryText}>Expira el {esimData.expiryDate}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.topUpButton} onPress={handleTopUp}>
            <Ionicons name="add-circle" size={20} color={COLORS.white} />
            <Text style={styles.topUpButtonText}>Recargar Datos</Text>
          </TouchableOpacity>
        </View>

        {/* Usage Timeline */}
        <View style={styles.timelineCard}>
          <View style={styles.timelineHeader}>
            <Text style={styles.timelineTitle}>Historial de Uso</Text>
            <View style={styles.timeRangeSelector}>
              {(['7d', '30d', '90d'] as const).map((range) => (
                <TouchableOpacity
                  key={range}
                  style={[
                    styles.timeRangeButton,
                    timeRange === range && styles.timeRangeButtonActive,
                  ]}
                  onPress={() => setTimeRange(range)}
                >
                  <Text style={[
                    styles.timeRangeText,
                    timeRange === range && styles.timeRangeTextActive,
                  ]}>
                    {range === '7d' ? '7 días' : range === '30d' ? '30 días' : '90 días'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {esimData.dailyUsage.map((usage, index) => (
            <View key={index} style={styles.usageItem}>
              <View style={styles.usageDate}>
                <Text style={styles.usageDateText}>
                  {new Date(usage.date).toLocaleDateString('es-ES', { 
                    day: 'numeric', 
                    month: 'short' 
                  })}
                </Text>
              </View>
              <View style={styles.usageDetails}>
                <Text style={styles.usageAmount}>{usage.used.toFixed(1)} GB</Text>
                <Text style={styles.usageCost}>${usage.cost.toFixed(2)}</Text>
              </View>
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
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  usageCard: {
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
  usageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  countryName: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: COLORS.gray[900],
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  statusText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
    color: COLORS.white,
  },
  operatorText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[600],
    marginBottom: SPACING.lg,
  },
  dataUsageContainer: {
    marginBottom: SPACING.lg,
  },
  dataUsageInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: SPACING.md,
  },
  dataRemaining: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: '800',
    color: COLORS.primary,
    marginRight: SPACING.sm,
  },
  dataTotal: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.gray[600],
  },
  progressContainer: {
    marginBottom: SPACING.sm,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.gray[200],
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: SPACING.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  progressText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[600],
    textAlign: 'right',
  },
  expiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expiryText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[600],
    marginLeft: SPACING.xs,
  },
  actionButtons: {
    marginBottom: SPACING.lg,
  },
  topUpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  topUpButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
    color: COLORS.white,
    marginLeft: SPACING.sm,
  },
  timelineCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  timelineTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: COLORS.gray[900],
  },
  timeRangeSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.gray[100],
    borderRadius: BORDER_RADIUS.md,
    padding: 2,
  },
  timeRangeButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  timeRangeButtonActive: {
    backgroundColor: COLORS.white,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  timeRangeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[600],
    fontWeight: '500',
  },
  timeRangeTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  usageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  usageDate: {
    flex: 1,
  },
  usageDateText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[700],
    fontWeight: '500',
  },
  usageDetails: {
    alignItems: 'flex-end',
  },
  usageAmount: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    color: COLORS.gray[900],
  },
  usageCost: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[600],
  },
});

export default DataUsageScreen;
