import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DashboardService from '../services/DashboardService';

const { width } = Dimensions.get('window');

interface UsageStats {
  total_data_used_gb: number;
  total_data_purchased_gb: number;
  usage_percentage: number;
  current_period_usage: number;
  previous_period_usage: number;
  usage_trend: 'increasing' | 'decreasing' | 'stable';
  countries_visited: number;
  active_plans: number;
  total_spent: number;
  currency: string;
}

interface Insight {
  id: number;
  type: string;
  title: string;
  message: string;
  action_text?: string;
  priority: 'low' | 'medium' | 'high';
  is_actionable: boolean;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  action: string;
}

const AdvancedDashboardScreen: React.FC = () => {
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [usageHistory, setUsageHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month');

  const dashboardService = DashboardService.getInstance();

  useEffect(() => {
    loadDashboardData();
  }, [selectedPeriod]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Simular datos del dashboard
      const mockUsageStats = {
        total_data_used_gb: 23.5,
        total_data_purchased_gb: 50,
        usage_percentage: 47,
        current_period_usage: 23.5,
        previous_period_usage: 18.2,
        usage_trend: 'increasing' as const,
        countries_visited: 3,
        active_plans: 2,
        total_spent: 145.99,
        currency: 'USD'
      };
      setUsageStats(mockUsageStats);
      
      // Simular insights
      const mockInsights = [
        {
          id: 1,
          type: 'cost_saving',
          title: 'Optimización de Costos',
          message: 'Cambiando al plan Business Pro podrías ahorrar $25/mes',
          action_text: 'Ver Plan',
          priority: 'high' as const,
          is_actionable: true
        },
        {
          id: 2,
          type: 'usage_pattern',
          title: 'Patrón de Uso',
          message: 'Tu uso de datos aumenta 30% los fines de semana',
          priority: 'medium' as const,
          is_actionable: false
        },
        {
          id: 3,
          type: 'travel_tip',
          title: 'Consejo de Viaje',
          message: 'Para tu próximo viaje a España, considera el plan Europeo',
          action_text: 'Ver Planes',
          priority: 'low' as const,
          is_actionable: true
        }
      ];
      setInsights(mockInsights);
      
      // Simular acciones rápidas
      const mockQuickActions = [
        {
          id: 'topup',
          title: 'Recargar Datos',
          description: 'Añadir más GB a tu plan actual',
          icon: 'add-circle',
          color: '#10B981',
          action: 'topup'
        },
        {
          id: 'new_plan',
          title: 'Nuevo Plan',
          description: 'Activar plan para otro país',
          icon: 'globe',
          color: '#3B82F6',
          action: 'new_plan'
        },
        {
          id: 'support',
          title: 'Soporte',
          description: 'Contactar atención al cliente',
          icon: 'help-circle',
          color: '#F59E0B',
          action: 'support'
        },
        {
          id: 'rewards',
          title: 'Recompensas',
          description: 'Ver puntos y canjes disponibles',
          icon: 'gift',
          color: '#EF4444',
          action: 'rewards'
        }
      ];
      setQuickActions(mockQuickActions);
      
      // Simular historial de uso
      const mockHistory = Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        data_used_mb: Math.floor(Math.random() * 2000) + 200,
        cost: Math.floor(Math.random() * 10) + 2
      }));
      setUsageHistory(mockHistory);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos del dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const executeQuickAction = async (actionId: string) => {
    try {
      Alert.alert(
        'Acción Rápida',
        `Ejecutando: ${quickActions.find(a => a.id === actionId)?.title}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error executing quick action:', error);
    }
  };

  const formatData = (mb: number): string => {
    if (mb >= 1000) {
      return `${(mb / 1000).toFixed(1)} GB`;
    }
    return `${mb} MB`;
  };

  const formatCurrency = (amount: number, currency = 'USD'): string => {
    return `$${amount.toFixed(2)}`;
  };

  const getUsageHealthColor = (percentage: number): string => {
    if (percentage < 60) return '#10B981';
    if (percentage < 80) return '#F59E0B';
    return '#EF4444';
  };

  const getTrendIcon = (trend: string): string => {
    const icons = {
      increasing: '📈',
      decreasing: '📉',
      stable: '➡️'
    };
    return icons[trend as keyof typeof icons] || '➡️';
  };

  const getPriorityColor = (priority: string): string => {
    const colors = {
      low: '#10B981',
      medium: '#F59E0B',
      high: '#EF4444'
    };
    return colors[priority as keyof typeof colors] || '#6B7280';
  };

  const renderOverviewCard = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.overviewCard}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Text style={styles.overviewTitle}>Resumen del {selectedPeriod === 'week' ? 'Semana' : selectedPeriod === 'month' ? 'Mes' : 'Trimestre'}</Text>
      
      <View style={styles.overviewStats}>
        <View style={styles.overviewStat}>
          <Text style={styles.overviewStatValue}>
            {formatData(usageStats?.current_period_usage ? usageStats.current_period_usage * 1000 : 0)}
          </Text>
          <Text style={styles.overviewStatLabel}>Datos Usados</Text>
        </View>
        
        <View style={styles.overviewStat}>
          <Text style={styles.overviewStatValue}>{usageStats?.countries_visited || 0}</Text>
          <Text style={styles.overviewStatLabel}>Países</Text>
        </View>
        
        <View style={styles.overviewStat}>
          <Text style={styles.overviewStatValue}>
            {formatCurrency(usageStats?.total_spent || 0)}
          </Text>
          <Text style={styles.overviewStatLabel}>Gastado</Text>
        </View>
      </View>
      
      <View style={styles.trendIndicator}>
        <Text style={styles.trendIcon}>{getTrendIcon(usageStats?.usage_trend || 'stable')}</Text>
        <Text style={styles.trendText}>
          Tendencia: {usageStats?.usage_trend === 'increasing' ? 'Aumentando' : 
                      usageStats?.usage_trend === 'decreasing' ? 'Disminuyendo' : 'Estable'}
        </Text>
      </View>
    </LinearGradient>
  );

  const renderUsageProgress = () => (
    <View style={styles.progressCard}>
      <Text style={styles.cardTitle}>Uso de Datos</Text>
      
      <View style={styles.progressHeader}>
        <Text style={styles.progressText}>
          {formatData((usageStats?.total_data_used_gb || 0) * 1000)} de {formatData((usageStats?.total_data_purchased_gb || 0) * 1000)}
        </Text>
        <Text style={[styles.progressPercentage, { color: getUsageHealthColor(usageStats?.usage_percentage || 0) }]}>
          {usageStats?.usage_percentage || 0}%
        </Text>
      </View>
      
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill, 
            { 
              width: `${Math.min(100, usageStats?.usage_percentage || 0)}%`,
              backgroundColor: getUsageHealthColor(usageStats?.usage_percentage || 0)
            }
          ]} 
        />
      </View>
      
      <View style={styles.progressFooter}>
        <Text style={styles.progressFooterText}>
          {usageStats?.usage_percentage && usageStats.usage_percentage > 80 
            ? '⚠️ Considera recargar datos'
            : '✅ Uso normal'
          }
        </Text>
      </View>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsCard}>
      <Text style={styles.cardTitle}>Acciones Rápidas</Text>
      
      <View style={styles.quickActionsGrid}>
        {quickActions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={[styles.quickActionItem, { borderLeftColor: action.color }]}
            onPress={() => executeQuickAction(action.id)}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: action.color }]}>
              <Ionicons name={action.icon as any} size={20} color="white" />
            </View>
            <View style={styles.quickActionContent}>
              <Text style={styles.quickActionTitle}>{action.title}</Text>
              <Text style={styles.quickActionDescription}>{action.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderInsights = () => (
    <View style={styles.insightsCard}>
      <Text style={styles.cardTitle}>Insights Personalizados</Text>
      
      {insights.map((insight) => (
        <View key={insight.id} style={styles.insightItem}>
          <View style={styles.insightHeader}>
            <View style={[styles.insightPriority, { backgroundColor: getPriorityColor(insight.priority) }]} />
            <Text style={styles.insightTitle}>{insight.title}</Text>
            {insight.is_actionable && (
              <Ionicons name="arrow-forward" size={16} color="#667eea" />
            )}
          </View>
          
          <Text style={styles.insightMessage}>{insight.message}</Text>
          
          {insight.action_text && (
            <TouchableOpacity style={styles.insightAction}>
              <Text style={styles.insightActionText}>{insight.action_text}</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>
  );

  const renderUsageChart = () => {
    const chartData = usageHistory.slice(-7);

    return (
      <View style={styles.chartCard}>
        <Text style={styles.cardTitle}>Uso Diario (Últimos 7 días)</Text>
        
        <View style={styles.chartContainer}>
          {chartData.map((item, index) => {
            const date = new Date(item.date);
            const dayName = date.toLocaleDateString('es', { weekday: 'short' });
            const usage = item.data_used_mb / 1000;
            const maxUsage = Math.max(...chartData.map(d => d.data_used_mb / 1000));
            const height = Math.max(20, (usage / maxUsage) * 120);
            
            return (
              <View key={index} style={styles.chartBar}>
                <Text style={styles.chartValue}>{usage.toFixed(1)}</Text>
                <View style={[styles.chartBarFill, { height, backgroundColor: '#667eea' }]} />
                <Text style={styles.chartLabel}>{dayName}</Text>
              </View>
            );
          })}
        </View>
        
        <Text style={styles.chartFooter}>Datos en GB por día</Text>
      </View>
    );
  };

  const renderPeriodSelector = () => (
    <View style={styles.periodSelector}>
      {(['week', 'month', 'quarter'] as const).map((period) => (
        <TouchableOpacity
          key={period}
          style={[
            styles.periodButton,
            selectedPeriod === period && styles.periodButtonActive
          ]}
          onPress={() => setSelectedPeriod(period)}
        >
          <Text style={[
            styles.periodButtonText,
            selectedPeriod === period && styles.periodButtonTextActive
          ]}>
            {period === 'week' ? 'Semana' : period === 'month' ? 'Mes' : 'Trimestre'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderPeriodSelector()}
      
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderOverviewCard()}
        {renderUsageProgress()}
        {renderQuickActions()}
        {renderUsageChart()}
        {renderInsights()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  periodButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  periodButtonActive: {
    backgroundColor: '#EEF2FF',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  periodButtonTextActive: {
    color: '#667eea',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  overviewCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 20,
  },
  overviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  overviewStat: {
    alignItems: 'center',
  },
  overviewStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  overviewStatLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 12,
  },
  trendIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  trendText: {
    fontSize: 14,
    color: 'white',
  },
  progressCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressText: {
    fontSize: 16,
    color: '#1F2937',
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressFooter: {
    alignItems: 'center',
  },
  progressFooterText: {
    fontSize: 14,
    color: '#6B7280',
  },
  quickActionsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  quickActionsGrid: {
    gap: 12,
  },
  quickActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  quickActionDescription: {
    fontSize: 12,
    color: '#6B7280',
  },
  insightsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  insightItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightPriority: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  insightTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  insightMessage: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  insightAction: {
    alignSelf: 'flex-start',
  },
  insightActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
  },
  chartCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
    marginVertical: 16,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  chartValue: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  chartBarFill: {
    width: '80%',
    borderRadius: 2,
    marginBottom: 4,
  },
  chartLabel: {
    fontSize: 10,
    color: '#6B7280',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  chartFooter: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default AdvancedDashboardScreen;
