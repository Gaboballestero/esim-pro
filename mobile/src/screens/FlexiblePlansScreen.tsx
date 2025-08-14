import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  FlatList,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import FlexiblePlansService from '../services/FlexiblePlansService';

const { width } = Dimensions.get('window');

interface PlanCategory {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
}

interface FlexiblePlan {
  id: number;
  name: string;
  description: string;
  category: number;
  data_amount_gb?: number;
  is_unlimited: boolean;
  duration_value: number;
  duration_unit: string;
  plan_type: string;
  base_price: number;
  currency: string;
  features: string[];
  is_featured: boolean;
  is_popular: boolean;
}

const FlexiblePlansScreen: React.FC = () => {
  const [categories, setCategories] = useState<PlanCategory[]>([]);
  const [plans, setPlans] = useState<FlexiblePlan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<FlexiblePlan[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [selectedPlansForComparison, setSelectedPlansForComparison] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<'browse' | 'featured' | 'custom'>('browse');

  const flexiblePlansService = FlexiblePlansService.getInstance();

  useEffect(() => {
    loadPlansData();
  }, []);

  useEffect(() => {
    filterPlansByCategory();
  }, [selectedCategory, plans]);

  const loadPlansData = async () => {
    try {
      setIsLoading(true);
      
      // Simular datos de categorías
      const mockCategories = [
        { id: 1, name: 'Viajero', description: 'Para tus aventuras', icon: '✈️', color: '#3B82F6' },
        { id: 2, name: 'Negocios', description: 'Profesional', icon: '💼', color: '#10B981' },
        { id: 3, name: 'Familiar', description: 'Para toda la familia', icon: '👨‍👩‍👧‍👦', color: '#F59E0B' },
        { id: 4, name: 'Estudiante', description: 'Planes económicos', icon: '🎓', color: '#8B5CF6' },
        { id: 5, name: 'Corporativo', description: 'Empresas', icon: '🏢', color: '#EF4444' },
      ];
      setCategories(mockCategories);
      
      // Simular planes flexibles
      const mockPlans = [
        {
          id: 1, name: 'Viajero Express', description: 'Perfecto para viajes cortos',
          category: 1, data_amount_gb: 5, is_unlimited: false, duration_value: 7,
          duration_unit: 'days', plan_type: 'travel', base_price: 25.00, currency: 'USD',
          features: ['4G/5G', 'Hotspot', 'Cobertura Global'], is_featured: true, is_popular: false
        },
        {
          id: 2, name: 'Business Pro', description: 'Para profesionales en movimiento',
          category: 2, data_amount_gb: 15, is_unlimited: false, duration_value: 30,
          duration_unit: 'days', plan_type: 'business', base_price: 89.99, currency: 'USD',
          features: ['5G Premium', 'VoIP', 'Soporte 24/7'], is_featured: false, is_popular: true
        },
        {
          id: 3, name: 'Familia Connect', description: 'Plan familiar compartido',
          category: 3, data_amount_gb: 50, is_unlimited: false, duration_value: 30,
          duration_unit: 'days', plan_type: 'family', base_price: 149.99, currency: 'USD',
          features: ['Hasta 5 dispositivos', 'Control parental', 'Dashboard familiar'], is_featured: true, is_popular: true
        },
        {
          id: 4, name: 'Estudiante Basic', description: 'Económico y eficiente',
          category: 4, data_amount_gb: 3, is_unlimited: false, duration_value: 30,
          duration_unit: 'days', plan_type: 'student', base_price: 15.99, currency: 'USD',
          features: ['4G', 'Aplicaciones educativas gratis'], is_featured: false, is_popular: false
        },
        {
          id: 5, name: 'Ilimitado Premium', description: 'Sin límites de datos',
          category: 1, is_unlimited: true, duration_value: 30,
          duration_unit: 'days', plan_type: 'unlimited', base_price: 199.99, currency: 'USD',
          features: ['Datos ilimitados', '5G Ultra', 'Prioridad de red'], is_featured: true, is_popular: true
        }
      ];
      setPlans(mockPlans);
      setFilteredPlans(mockPlans);
      
    } catch (error) {
      console.error('Error loading plans data:', error);
      Alert.alert('Error', 'No se pudieron cargar los planes');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPlansData();
    setRefreshing(false);
  };

  const filterPlansByCategory = () => {
    if (!selectedCategory) {
      setFilteredPlans(plans);
    } else {
      const filtered = plans.filter(plan => plan.category === selectedCategory);
      setFilteredPlans(filtered);
    }
  };

  const togglePlanComparison = (planId: number) => {
    if (selectedPlansForComparison.includes(planId)) {
      setSelectedPlansForComparison(prev => prev.filter(id => id !== planId));
    } else if (selectedPlansForComparison.length < 3) {
      setSelectedPlansForComparison(prev => [...prev, planId]);
    } else {
      Alert.alert('Límite alcanzado', 'Solo puedes comparar hasta 3 planes');
    }
  };

  const clearComparison = () => {
    setSelectedPlansForComparison([]);
  };

  const formatDuration = (value: number, unit: string): string => {
    const unitMap: { [key: string]: { singular: string; plural: string } } = {
      days: { singular: 'día', plural: 'días' },
      weeks: { singular: 'semana', plural: 'semanas' },
      months: { singular: 'mes', plural: 'meses' },
    };
    
    const unitText = value === 1 ? unitMap[unit]?.singular : unitMap[unit]?.plural;
    return `${value} ${unitText || unit}`;
  };

  const formatData = (amountGB?: number, isUnlimited = false): string => {
    if (isUnlimited) return 'Ilimitado';
    if (!amountGB) return 'Personalizado';
    return `${amountGB} GB`;
  };

  const formatPrice = (price: number, currency = 'USD'): string => {
    return `$${price.toFixed(2)}`;
  };

  const getPlanTypeColor = (type: string): string => {
    const colors: { [key: string]: string } = {
      travel: '#3B82F6',
      business: '#10B981',
      family: '#F59E0B',
      student: '#8B5CF6',
      unlimited: '#EF4444',
    };
    return colors[type] || '#6B7280';
  };

  const renderCategorySelector = () => (
    <View style={styles.categoryContainer}>
      <Text style={styles.sectionTitle}>Categorías</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity
          style={[
            styles.categoryItem,
            !selectedCategory && styles.categoryItemActive
          ]}
          onPress={() => setSelectedCategory(null)}
        >
          <Text style={styles.categoryIcon}>🌍</Text>
          <Text style={[
            styles.categoryText,
            !selectedCategory && styles.categoryTextActive
          ]}>
            Todos
          </Text>
        </TouchableOpacity>
        
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryItem,
              selectedCategory === category.id && styles.categoryItemActive
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text style={[
              styles.categoryText,
              selectedCategory === category.id && styles.categoryTextActive
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderPlanCard = (plan: FlexiblePlan) => (
    <View key={plan.id} style={styles.planCard}>
      {(plan.is_featured || plan.is_popular) && (
        <View style={styles.planBadges}>
          {plan.is_featured && (
            <View style={[styles.badge, styles.featuredBadge]}>
              <Text style={styles.badgeText}>TOP</Text>
            </View>
          )}
          {plan.is_popular && (
            <View style={[styles.badge, styles.popularBadge]}>
              <Text style={styles.badgeText}>Popular</Text>
            </View>
          )}
        </View>
      )}
      
      <View style={styles.planHeader}>
        <View style={styles.planInfo}>
          <Text style={styles.planName}>{plan.name}</Text>
          <Text style={styles.planDescription}>{plan.description}</Text>
        </View>
        <TouchableOpacity
          onPress={() => togglePlanComparison(plan.id)}
          style={[
            styles.compareButton,
            selectedPlansForComparison.includes(plan.id) && styles.compareButtonActive
          ]}
        >
          <Ionicons 
            name={selectedPlansForComparison.includes(plan.id) ? "checkmark" : "add"} 
            size={16} 
            color={selectedPlansForComparison.includes(plan.id) ? "white" : "#667eea"} 
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.planDetails}>
        <View style={styles.planSpec}>
          <Ionicons name="cellular" size={16} color="#6B7280" />
          <Text style={styles.planSpecText}>{formatData(plan.data_amount_gb, plan.is_unlimited)}</Text>
        </View>
        
        <View style={styles.planSpec}>
          <Ionicons name="time" size={16} color="#6B7280" />
          <Text style={styles.planSpecText}>{formatDuration(plan.duration_value, plan.duration_unit)}</Text>
        </View>
        
        <View style={styles.planSpec}>
          <Ionicons name="card" size={16} color="#6B7280" />
          <Text style={styles.planSpecText}>{formatPrice(plan.base_price)}</Text>
        </View>
      </View>
      
      <View style={styles.planFeatures}>
        {plan.features.slice(0, 3).map((feature, index) => (
          <View key={index} style={styles.feature}>
            <Ionicons name="checkmark-circle" size={14} color="#10B981" />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
        {plan.features.length > 3 && (
          <Text style={styles.moreFeatures}>+{plan.features.length - 3} más</Text>
        )}
      </View>
      
      <TouchableOpacity style={styles.selectPlanButton}>
        <Text style={styles.selectPlanButtonText}>Seleccionar Plan</Text>
        <Ionicons name="arrow-forward" size={16} color="white" />
      </TouchableOpacity>
    </View>
  );

  const renderFeaturedPlans = () => {
    const featuredPlans = plans.filter(plan => plan.is_featured);
    
    return (
      <ScrollView style={styles.tabContent}>
        <Text style={styles.sectionTitle}>Planes Top</Text>
        <Text style={styles.sectionSubtitle}>Los mejores planes seleccionados para ti</Text>
        
        {featuredPlans.map(renderPlanCard)}
      </ScrollView>
    );
  };

  const renderBrowsePlans = () => (
    <ScrollView style={styles.tabContent}>
      {renderCategorySelector()}
      
      <View style={styles.plansGrid}>
        <Text style={styles.sectionTitle}>
          {selectedCategory 
            ? `Planes de ${categories.find(c => c.id === selectedCategory)?.name}`
            : 'Todos los Planes'
          }
        </Text>
        <Text style={styles.resultsCount}>{filteredPlans.length} planes disponibles</Text>
        
        {filteredPlans.map(renderPlanCard)}
      </View>
    </ScrollView>
  );

  const renderCustomPlanBuilder = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.customPlanCard}>
        <Text style={styles.sectionTitle}>Crear Plan a Medida</Text>
        <Text style={styles.sectionSubtitle}>
          Diseña un plan que se ajuste perfectamente a tus necesidades
        </Text>
        
        <View style={styles.comingSoonContainer}>
          <Ionicons name="construct" size={48} color="#9CA3AF" />
          <Text style={styles.comingSoonText}>Próximamente</Text>
          <Text style={styles.comingSoonSubtext}>
            El constructor de planes personalizados estará disponible pronto
          </Text>
        </View>
        
        <TouchableOpacity style={styles.notifyButton}>
          <Ionicons name="notifications" size={16} color="#667eea" />
          <Text style={styles.notifyButtonText}>Notificarme cuando esté listo</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderComparisonModal = () => {
    const selectedPlans = plans.filter(plan => selectedPlansForComparison.includes(plan.id));
    
    return (
      <Modal
        visible={showCompareModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Comparar Planes</Text>
            <TouchableOpacity onPress={() => setShowCompareModal(false)}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.comparisonTable}>
              {selectedPlans.map((plan, index) => (
                <View key={plan.id} style={styles.comparisonColumn}>
                  <Text style={styles.comparisonPlanName}>{plan.name}</Text>
                  
                  <View style={styles.comparisonRow}>
                    <Text style={styles.comparisonLabel}>Datos</Text>
                    <Text style={styles.comparisonValue}>
                      {formatData(plan.data_amount_gb, plan.is_unlimited)}
                    </Text>
                  </View>
                  
                  <View style={styles.comparisonRow}>
                    <Text style={styles.comparisonLabel}>Duración</Text>
                    <Text style={styles.comparisonValue}>
                      {formatDuration(plan.duration_value, plan.duration_unit)}
                    </Text>
                  </View>
                  
                  <View style={styles.comparisonRow}>
                    <Text style={styles.comparisonLabel}>Precio</Text>
                    <Text style={styles.comparisonValue}>{formatPrice(plan.base_price)}</Text>
                  </View>
                  
                  <View style={styles.comparisonFeatures}>
                    <Text style={styles.comparisonLabel}>Características</Text>
                    {plan.features.map((feature, i) => (
                      <Text key={i} style={styles.comparisonFeature}>• {feature}</Text>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </Modal>
    );
  };

  const renderTabButton = (tab: 'browse' | 'featured' | 'custom', title: string, icon: string) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
      onPress={() => setActiveTab(tab)}
    >
      <Ionicons 
        name={icon as any} 
        size={18} 
        color={activeTab === tab ? '#667eea' : '#9CA3AF'} 
      />
      <Text style={[styles.tabButtonText, activeTab === tab && styles.tabButtonTextActive]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando planes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {renderTabButton('browse', 'Explorar', 'grid')}
        {renderTabButton('featured', 'Top', 'star')}
        {renderTabButton('custom', 'A Medida', 'construct')}
      </View>
      
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === 'browse' && renderBrowsePlans()}
        {activeTab === 'featured' && renderFeaturedPlans()}
        {activeTab === 'custom' && renderCustomPlanBuilder()}
      </ScrollView>
      
      {selectedPlansForComparison.length > 0 && (
        <View style={styles.comparisonBar}>
          <Text style={styles.comparisonText}>
            {selectedPlansForComparison.length} planes seleccionados
          </Text>
          <View style={styles.comparisonActions}>
            <TouchableOpacity onPress={clearComparison} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Limpiar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setShowCompareModal(true)}
              style={styles.compareActionButton}
              disabled={selectedPlansForComparison.length < 2}
            >
              <Text style={styles.compareActionButtonText}>Comparar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {renderComparisonModal()}
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 12, // Reducido de 16 a 12
    paddingHorizontal: 16, // Reducido de 20 a 16  
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8, // Reducido de 12 a 8
    borderRadius: 20,
    minWidth: 0, // Permite que el contenido se comprima
  },
  tabButtonActive: {
    backgroundColor: '#EEF2FF',
  },
  tabButtonText: {
    marginLeft: 6, // Reducido de 8 a 6
    fontSize: 13, // Reducido de 14 a 13
    fontWeight: '500',
    color: '#9CA3AF',
    flexShrink: 1, // Permite que el texto se ajuste
    textAlign: 'center',
  },
  tabButtonTextActive: {
    color: '#667eea',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },
  categoryContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  categoryItem: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryItemActive: {
    borderColor: '#667eea',
    backgroundColor: '#EEF2FF',
  },
  categoryIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  categoryTextActive: {
    color: '#667eea',
  },
  plansGrid: {
    marginBottom: 20,
  },
  resultsCount: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  planCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  planBadges: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  featuredBadge: {
    backgroundColor: '#FEF3C7',
  },
  popularBadge: {
    backgroundColor: '#DBEAFE',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#92400E',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  planDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  compareButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#667eea',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compareButtonActive: {
    backgroundColor: '#667eea',
  },
  planDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  planSpec: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planSpecText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginLeft: 4,
  },
  planFeatures: {
    marginBottom: 16,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  featureText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
  },
  moreFeatures: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  selectPlanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#667eea',
    borderRadius: 8,
    padding: 12,
  },
  selectPlanButtonText: {
    color: 'white',
    fontWeight: '600',
    marginRight: 8,
  },
  customPlanCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  comingSoonContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  comingSoonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
  },
  comingSoonSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
  },
  notifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#667eea',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  notifyButtonText: {
    color: '#667eea',
    fontWeight: '600',
    marginLeft: 8,
  },
  comparisonBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  comparisonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  comparisonActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  clearButtonText: {
    color: '#6B7280',
    fontWeight: '500',
  },
  compareActionButton: {
    backgroundColor: '#667eea',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  compareActionButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  comparisonTable: {
    flexDirection: 'row',
    padding: 20,
  },
  comparisonColumn: {
    width: width * 0.7,
    marginRight: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  comparisonPlanName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  comparisonRow: {
    marginBottom: 12,
  },
  comparisonLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 4,
  },
  comparisonValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  comparisonFeatures: {
    marginTop: 8,
  },
  comparisonFeature: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
});

export default FlexiblePlansScreen;
