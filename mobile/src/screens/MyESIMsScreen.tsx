import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  RefreshControl 
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../types';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../constants';
import ESIMService, { PurchasedESIM } from '../services/ESIMService';
import MockAuthService from '../services/MockAuthService';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const MyESIMsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [esims, setESIMs] = useState<PurchasedESIM[]>([]);
  const [syncedESims, setSyncedESims] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'expired'>('active');

  // Cargar eSIMs cuando la pantalla se enfoca
  useFocusEffect(
    React.useCallback(() => {
      loadESIMs();
      loadSyncedESIMs();
    }, [])
  );

  const loadESIMs = async () => {
    try {
      const purchasedESIMs = await ESIMService.getPurchasedESIMs();
      setESIMs(purchasedESIMs);
    } catch (error) {
      console.error('Error loading eSIMs:', error);
    }
  };

  // Cargar eSIMs sincronizadas desde el servidor web
  const loadSyncedESIMs = async () => {
    try {
      console.log('⚡ Cargando eSIMs sincronizadas en tiempo real...');
      const syncedESIMsData = await MockAuthService.getUserESims();
      setSyncedESims(syncedESIMsData || []);
      console.log(`📱 ${syncedESIMsData.length} eSIMs sincronizadas cargadas`);
    } catch (error) {
      console.error('Error loading synced eSIMs:', error);
      setSyncedESims([]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadESIMs();
    await loadSyncedESIMs(); // Sincronización en tiempo real al hacer refresh
    setRefreshing(false);
  };

  // Filtrar eSIMs por tab activo
  const getFilteredESIMs = () => {
    return esims.filter(esim => esim.status === activeTab);
  };

  // Filtrar eSIMs sincronizadas por tab activo
  const getFilteredSyncedESIMs = () => {
    return syncedESims.filter(esim => esim.status === activeTab);
  };

  // Contar eSIMs por estado (locales + sincronizadas)
  const getActiveCount = () => {
    const localActive = esims.filter(esim => esim.status === 'active').length;
    const syncedActive = syncedESims.filter(esim => esim.status === 'active').length;
    return localActive + syncedActive;
  };
  
  const getExpiredCount = () => {
    const localExpired = esims.filter(esim => esim.status === 'expired').length;
    const syncedExpired = syncedESims.filter(esim => esim.status === 'expired').length;
    return localExpired + syncedExpired;
  };

  // Agregar eSIMs de demo si no hay ninguno (solo primera vez)
  useEffect(() => {
    const initializeDemoESIMs = async () => {
      await ESIMService.addDemoESIMs();
      loadESIMs();
    };
    
    initializeDemoESIMs();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return COLORS.success;
      case 'expired': return COLORS.error;
      default: return COLORS.gray[500];
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activa';
      case 'expired': return 'Expirada';
      default: return 'Inactiva';
    }
  };

  const handleESIMPress = (esim: PurchasedESIM) => {
    navigation.navigate('ESIMDetails', { esim });
  };

  const handleDeleteESIM = (esim: PurchasedESIM) => {
    Alert.alert(
      'Eliminar eSIM',
      `¿Estás seguro de que quieres eliminar la eSIM "${esim.planName}"?\n\nEsta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            try {
              await ESIMService.deleteESIM(esim.id);
              await loadESIMs(); // Recargar la lista
              Alert.alert('eSIM eliminada', 'La eSIM se ha eliminado correctamente.');
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar la eSIM. Inténtalo de nuevo.');
            }
          }
        },
      ]
    );
  };

  const renderESIM = (esim: PurchasedESIM) => (
    <TouchableOpacity 
      key={esim.id} 
      style={styles.esimCard}
      onPress={() => handleESIMPress(esim)}
      activeOpacity={0.95}
    >
      <View style={styles.cardShadow}>
        <LinearGradient
          colors={esim.status === 'active' 
            ? ['#667eea', '#764ba2'] 
            : ['#8E8E93', '#6D6D70']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.esimGradient}
        >
          {/* Decorative background elements */}
          <View style={styles.backgroundDecoration}>
            <View style={[styles.circle, styles.circle1]} />
            <View style={[styles.circle, styles.circle2]} />
            <View style={[styles.circle, styles.circle3]} />
          </View>

          <View style={styles.esimHeader}>
            <View style={styles.esimInfo}>
              <Text style={styles.esimCountry}>{esim.planFlag}</Text>
              <Text style={styles.esimName}>{esim.planName}</Text>
              <Text style={styles.esimRoaming}>{esim.planCountries}</Text>
            </View>
            <View style={styles.esimHeaderActions}>
              <View style={[styles.statusBadge, { 
                backgroundColor: esim.status === 'active' ? '#10B981' : '#EF4444',
                marginBottom: SPACING.xs,
              }]}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>{getStatusText(esim.status)}</Text>
              </View>
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={(e) => {
                  e.stopPropagation(); // Evitar que se active el onPress del card
                  handleDeleteESIM(esim);
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={18} color="rgba(255,255,255,0.8)" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.esimBody}>
            <View style={styles.iccidContainer}>
              <Text style={styles.iccidLabel}>ICCID</Text>
              <View style={styles.iccidChip}>
                <Ionicons name="hardware-chip" size={16} color="rgba(255,255,255,0.9)" />
                <Text style={styles.iccidValue}>{esim.iccid}</Text>
              </View>
            </View>
            
            <View style={styles.dataUsage}>
              <View style={styles.dataInfo}>
                <Text style={styles.dataLabel}>Datos utilizados</Text>
                <Text style={styles.dataValue}>{esim.dataUsed}GB / {esim.dataTotal}GB</Text>
              </View>
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${Math.min((esim.dataUsed / esim.dataTotal) * 100, 100)}%`,
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  {Math.round((esim.dataUsed / esim.dataTotal) * 100)}%
                </Text>
              </View>
            </View>

            <View style={styles.esimFooter}>
              <View style={styles.validityInfo}>
                <View style={styles.calendarIcon}>
                  <Ionicons name="calendar" size={14} color="rgba(255,255,255,0.9)" />
                </View>
                <Text style={styles.validityText}>Válida hasta {esim.validUntil}</Text>
              </View>
              <TouchableOpacity style={styles.qrButton} activeOpacity={0.7}>
                <View style={styles.qrButtonInner}>
                  <Ionicons name="qr-code" size={18} color="rgba(255,255,255,0.9)" />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );

  // Renderizar eSIMs sincronizadas desde el servidor web
  const renderSyncedESIM = (esim: any) => (
    <TouchableOpacity 
      key={`synced-${esim.id}`} 
      style={styles.esimCard}
      activeOpacity={0.95}
    >
      <View style={styles.cardShadow}>
        <LinearGradient
          colors={esim.status === 'active' 
            ? ['#10B981', '#047857'] 
            : ['#8E8E93', '#6D6D70']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.esimGradient}
        >
          {/* Badge para indicar que es del servidor web */}
          <View style={styles.syncBadge}>
            <Ionicons name="cloud" size={12} color="white" />
            <Text style={styles.syncBadgeText}>WEB</Text>
          </View>

          {/* Decorative background elements */}
          <View style={styles.backgroundDecoration}>
            <View style={[styles.circle, styles.circle1]} />
            <View style={[styles.circle, styles.circle2]} />
            <View style={[styles.circle, styles.circle3]} />
          </View>

          <View style={styles.esimHeader}>
            <View style={styles.esimInfo}>
              <Text style={styles.esimCountry}>{esim.countryCode}</Text>
              <Text style={styles.esimName}>{esim.planName}</Text>
              <Text style={styles.esimRoaming}>Plan sincronizado</Text>
            </View>
            <View style={styles.esimHeaderActions}>
              <View style={[styles.statusBadge, { 
                backgroundColor: esim.status === 'active' ? '#10B981' : '#EF4444',
                marginBottom: SPACING.xs,
              }]}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>{esim.status === 'active' ? 'Activa' : 'Inactiva'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.esimBody}>
            <View style={styles.iccidContainer}>
              <Text style={styles.iccidLabel}>ICCID</Text>
              <View style={styles.iccidChip}>
                <Ionicons name="hardware-chip" size={16} color="rgba(255,255,255,0.9)" />
                <Text style={styles.iccidValue}>{esim.iccid}</Text>
              </View>
            </View>
            
            <View style={styles.dataUsage}>
              <View style={styles.dataInfo}>
                <Text style={styles.dataLabel}>Límite de datos</Text>
                <Text style={styles.dataValue}>{(esim.dataLimit / (1024*1024*1024)).toFixed(1)}GB</Text>
              </View>
            </View>

            <View style={styles.esimFooter}>
              <View style={styles.validityInfo}>
                <View style={styles.calendarIcon}>
                  <Ionicons name="calendar" size={14} color="rgba(255,255,255,0.9)" />
                </View>
                <Text style={styles.validityText}>
                  Válida hasta {new Date(esim.validUntil).toLocaleDateString()}
                </Text>
              </View>
              <TouchableOpacity style={styles.qrButton} activeOpacity={0.7}>
                <View style={styles.qrButtonInner}>
                  <Ionicons name="qr-code" size={18} color="rgba(255,255,255,0.9)" />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <View style={styles.iconContainer}>
              <Ionicons name="phone-portrait" size={28} color={COLORS.primary} />
            </View>
            <Text style={styles.title}>Gestiona tus planes de datos</Text>
          </View>
          <Text style={styles.subtitle}>
            Controla y monitorea todas tus conexiones eSIM
          </Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'active' && styles.activeTab]}
            onPress={() => setActiveTab('active')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
              Activas
            </Text>
            {getActiveCount() > 0 && (
              <View style={[styles.tabBadge, activeTab === 'active' && styles.activeTabBadge]}>
                <Text style={[styles.tabBadgeText, activeTab === 'active' && styles.activeTabBadgeText]}>
                  {getActiveCount()}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'expired' && styles.activeTab]}
            onPress={() => setActiveTab('expired')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'expired' && styles.activeTabText]}>
              Expiradas
            </Text>
            {getExpiredCount() > 0 && (
              <View style={[styles.tabBadge, activeTab === 'expired' && styles.activeTabBadge]}>
                <Text style={[styles.tabBadgeText, activeTab === 'expired' && styles.activeTabBadgeText]}>
                  {getExpiredCount()}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* eSIMs List */}
        <View style={styles.esimsContainer}>
          {/* eSIMs locales */}
          {getFilteredESIMs().map(renderESIM)}
          
          {/* eSIMs sincronizadas del servidor web */}
          {getFilteredSyncedESIMs().map(renderSyncedESIM)}
          
          {/* Estado vacío */}
          {getFilteredESIMs().length === 0 && getFilteredSyncedESIMs().length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons 
                name={activeTab === 'active' ? "phone-portrait-outline" : "archive-outline"} 
                size={80} 
                color={COLORS.gray[400]} 
              />
              <Text style={styles.emptyTitle}>
                {activeTab === 'active' ? 'No tienes eSIMs activas' : 'No tienes eSIMs expiradas'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {activeTab === 'active' 
                  ? 'Compra un plan en la pestaña "Shop" para empezar a usar eSIMs'
                  : 'Las eSIMs expiradas aparecerán aquí cuando lleguen a su fecha límite'
                }
              </Text>
              <TouchableOpacity 
                style={styles.syncButton}
                onPress={async () => {
                  setRefreshing(true);
                  await loadSyncedESIMs();
                  setRefreshing(false);
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="refresh" size={20} color={COLORS.primary} />
                <Text style={styles.syncButtonText}>Sincronizar con servidor</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Demo Badge */}
        {esims.some(esim => esim.id.startsWith('demo')) && (
          <View style={styles.demoBadgeContainer}>
            <View style={styles.demoBadge}>
              <Ionicons name="information-circle" size={16} color={COLORS.info} />
              <Text style={styles.demoBadgeText}>
                Las eSIMs marcadas como "demo" son solo para demostración
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  iconContainer: {
    width: 44,
    height: 44,
    backgroundColor: `${COLORS.primary}15`,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: '700',
    color: COLORS.black,
    flex: 1,
    lineHeight: 28,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.gray[600],
    fontWeight: '500',
    lineHeight: 20,
    marginLeft: 56, // Align with title (44px icon + 12px margin)
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.gray[100],
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xs,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
  },
  activeTab: {
    backgroundColor: COLORS.white,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    color: COLORS.gray[600],
  },
  activeTabText: {
    color: COLORS.primary,
  },
  tabBadge: {
    backgroundColor: COLORS.gray[300],
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTabBadge: {
    backgroundColor: COLORS.primary,
  },
  tabBadgeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '700',
    color: COLORS.gray[600],
  },
  activeTabBadgeText: {
    color: COLORS.white,
  },
  esimsContainer: {
    paddingHorizontal: SPACING.lg,
  },
  esimCard: {
    marginBottom: SPACING.xl,
  },
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
    borderRadius: BORDER_RADIUS.xl,
  },
  esimGradient: {
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 200,
  },
  backgroundDecoration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  circle: {
    position: 'absolute',
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  circle1: {
    width: 120,
    height: 120,
    top: -60,
    right: -40,
  },
  circle2: {
    width: 80,
    height: 80,
    bottom: -30,
    left: -20,
  },
  circle3: {
    width: 60,
    height: 60,
    top: 40,
    left: -10,
  },
  esimHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
    zIndex: 1,
  },
  esimInfo: {
    flex: 1,
  },
  esimCountry: {
    fontSize: 40,
    marginBottom: SPACING.sm,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  esimName: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: SPACING.xs,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  esimRoaming: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  esimStatus: {
    alignItems: 'flex-end',
  },
  esimHeaderActions: {
    alignItems: 'flex-end',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.white,
    marginRight: SPACING.xs,
  },
  statusText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '700',
    color: COLORS.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  esimBody: {
    zIndex: 1,
  },
  iccidContainer: {
    marginBottom: SPACING.lg,
  },
  iccidLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: SPACING.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  iccidChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  iccidValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: COLORS.white,
    marginLeft: SPACING.sm,
    fontFamily: 'monospace',
  },
  dataUsage: {
    marginBottom: SPACING.lg,
  },
  dataInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  dataLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  dataValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '700',
    color: COLORS.white,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
    marginRight: SPACING.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.sm,
    shadowColor: COLORS.white,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  progressText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '700',
    color: COLORS.white,
    minWidth: 35,
    textAlign: 'right',
  },
  esimFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1,
  },
  validityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  calendarIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  validityText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  qrButton: {
    marginLeft: SPACING.md,
  },
  qrButtonInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl * 2,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '600',
    color: COLORS.black,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.gray[600],
    textAlign: 'center',
    lineHeight: 24,
  },
  demoBadgeContainer: {
    padding: SPACING.lg,
    paddingTop: 0,
  },
  demoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.info}15`,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: `${COLORS.info}30`,
  },
  demoBadgeText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.info,
    marginLeft: SPACING.sm,
    flex: 1,
    lineHeight: 20,
  },
  // Estilos para eSIMs sincronizadas
  syncBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    zIndex: 10,
  },
  syncBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.white,
    marginLeft: 4,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${COLORS.primary}15`,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: `${COLORS.primary}30`,
    marginTop: SPACING.lg,
  },
  syncButtonText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
});

export default MyESIMsScreen;
