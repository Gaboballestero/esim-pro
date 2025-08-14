import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { ESIMService, ESIMOrder } from '../services/ESIMService';
import QRCodeModal from '../components/QRCodeModal';
import ESIMConfigModal from '../components/ESIMConfigModal';
import UsageModal from '../components/UsageModal';
import { NotificationService } from '../services/NotificationService';

export default function MyESIMsScreen() {
  const [loading, setLoading] = useState(true);
  const [esims, setEsims] = useState<ESIMOrder[]>([]);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [usageModalVisible, setUsageModalVisible] = useState(false);
  const [selectedESIM, setSelectedESIM] = useState<ESIMOrder | null>(null);

  useEffect(() => {
    loadESIMs();
  }, []);

  const loadESIMs = async () => {
    try {
      setLoading(true);
      const esimsData = await ESIMService.getMyESIMs();
      setEsims(esimsData);
      
      // Check usage and send notifications if needed
      await NotificationService.checkUsageAndNotify(esimsData);
    } catch (error) {
      console.error('Error loading eSIMs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQRCode = (esim: ESIMOrder) => {
    setSelectedESIM(esim);
    setQrModalVisible(true);
  };

  const handleConfig = (esim: ESIMOrder) => {
    setSelectedESIM(esim);
    setConfigModalVisible(true);
  };

  const handleUsageDetails = (esim: ESIMOrder) => {
    setSelectedESIM(esim);
    setUsageModalVisible(true);
  };

  const ESIMCard = ({ esim }: { esim: ESIMOrder }) => {
    const dataUsedGB = esim.data_used_mb / 1024;
    const dataRemainingGB = esim.data_remaining_mb / 1024;
    const dataTotalGB = (esim.data_used_mb + esim.data_remaining_mb) / 1024;
    const usagePercentage = (dataUsedGB / dataTotalGB) * 100;

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'activated':
          return '#28a745';
        case 'paid':
          return '#17a2b8';
        case 'pending':
          return '#ffc107';
        case 'expired':
          return '#dc3545';
        default:
          return COLORS.textSecondary;
      }
    };

    return (
      <View style={styles.esimCard}>
        <View style={styles.esimHeader}>
          <View style={styles.esimInfo}>
            <Text style={styles.esimPlan}>{esim.plan.name}</Text>
            <View style={styles.statusContainer}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(esim.status) }]} />
              <Text style={[styles.statusText, { color: getStatusColor(esim.status) }]}>
                {esim.status === 'activated' ? 'Activo' : 
                 esim.status === 'paid' ? 'Pagado' :
                 esim.status === 'pending' ? 'Pendiente' : 'Expirado'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.dataContainer}>
          <View style={styles.dataInfo}>
            <Text style={styles.dataUsed}>{dataUsedGB.toFixed(1)} GB</Text>
            <Text style={styles.dataTotal}>de {dataTotalGB.toFixed(0)} GB</Text>
          </View>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[styles.progressFill, { width: `${Math.min(usagePercentage, 100)}%` }]} 
              />
            </View>
            <Text style={styles.progressText}>{usagePercentage.toFixed(0)}%</Text>
          </View>
        </View>

        <View style={styles.esimDetails}>
          <Text style={styles.detailText}>📱 ICCID: {esim.iccid}</Text>
          <Text style={styles.detailText}>📅 Expira: {new Date(esim.expires_at).toLocaleDateString()}</Text>
        </View>

        <View style={styles.esimActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleQRCode(esim)}
          >
            <Ionicons name="qr-code" size={16} color={COLORS.primary} />
            <Text style={styles.actionButtonText}>QR Code</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleConfig(esim)}
          >
            <Ionicons name="settings" size={16} color={COLORS.primary} />
            <Text style={styles.actionButtonText}>Config</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleUsageDetails(esim)}
          >
            <Ionicons name="stats-chart" size={16} color={COLORS.primary} />
            <Text style={styles.actionButtonText}>Uso</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis eSIMs</Text>
        <Text style={styles.subtitle}>Gestiona tus eSIMs activos</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Cargando eSIMs...</Text>
          </View>
        ) : esims.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="phone-portrait" size={64} color={COLORS.textSecondary} />
            <Text style={styles.emptyTitle}>No tienes eSIMs</Text>
            <Text style={styles.emptySubtitle}>
              Compra tu primer plan de datos para comenzar
            </Text>
            <TouchableOpacity style={styles.buyFirstButton}>
              <Text style={styles.buyFirstButtonText}>Explorar Planes</Text>
            </TouchableOpacity>
          </View>
        ) : (
          esims.map((esim) => (
            <ESIMCard key={esim.id} esim={esim} />
          ))
        )}
      </ScrollView>

      {/* QR Code Modal */}
      <QRCodeModal
        visible={qrModalVisible}
        onClose={() => setQrModalVisible(false)}
        esim={selectedESIM}
      />

      {/* Config Modal */}
      <ESIMConfigModal
        visible={configModalVisible}
        onClose={() => setConfigModalVisible(false)}
        esim={selectedESIM}
      />

      {/* Usage Modal */}
      <UsageModal
        visible={usageModalVisible}
        onClose={() => setUsageModalVisible(false)}
        esim={selectedESIM}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SIZES.padding,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  buyFirstButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buyFirstButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  // eSIM Card Styles
  esimCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: SIZES.padding,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  esimHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  esimInfo: {
    flex: 1,
  },
  esimPlan: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
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
    fontWeight: '600',
  },
  dataContainer: {
    marginBottom: 12,
  },
  dataInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dataUsed: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  dataTotal: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  esimDetails: {
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  esimActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    marginHorizontal: 2,
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
});
