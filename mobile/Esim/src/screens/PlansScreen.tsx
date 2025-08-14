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
import { PlansService, DataPlan } from '../services/PlansService';
import { PaymentService } from '../services/PaymentService';
import { ESIMService } from '../services/ESIMService';

export default function PlansScreen() {
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [plans, setPlans] = useState<DataPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const plansData = await PlansService.getPlans();
      setPlans(plansData);
    } catch (error) {
      console.error('Error loading plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlans = plans.filter(plan => {
    if (selectedRegion === 'all') return true;
    if (selectedRegion === 'europa') return plan.plan_type === 'regional' && plan.name.toLowerCase().includes('europa');
    if (selectedRegion === 'america') return plan.plan_type === 'regional' && plan.name.toLowerCase().includes('america');
    if (selectedRegion === 'asia') return plan.plan_type === 'regional' && plan.name.toLowerCase().includes('asia');
    return true;
  });

  const handlePurchase = async (plan: DataPlan) => {
    try {
      setLoading(true);
      
      // Step 1: Create payment intent
      const paymentIntent = await PaymentService.createPaymentIntent(plan.price_usd, 'USD');

      // Step 2: In a real app, you would show a payment screen here
      // For demo, we'll simulate payment confirmation
      console.log('Payment intent created:', paymentIntent.id);
      
      // Step 3: Confirm payment (in demo mode this is automatic)
      const confirmedPayment = await PaymentService.confirmPayment(paymentIntent.id, 'demo_card_success');

      if (confirmedPayment.status === 'succeeded') {
        // Step 4: Purchase eSIM
        const esimOrder = await ESIMService.purchaseESIM(plan.id);
        console.log('eSIM purchased successfully:', esimOrder);
        
        // You could navigate to MyESIMsScreen or show success message
        alert(`¡Compra exitosa! Tu eSIM ${plan.name} está listo.`);
      }
    } catch (error) {
      console.error('Error purchasing plan:', error);
      alert('Error en la compra. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const PlanCard = ({ plan }: { plan: DataPlan }) => (
    <View style={[styles.planCard, plan.is_featured && styles.popularPlan]}>
      {plan.is_featured && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>Más Popular</Text>
        </View>
      )}
      <View style={styles.planHeader}>
        <Text style={styles.planName}>{plan.name}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.currency}>$</Text>
          <Text style={styles.price}>{plan.price_usd}</Text>
        </View>
      </View>
      <Text style={styles.planDescription}>{plan.description}</Text>
      <View style={styles.countriesContainer}>
        <Ionicons name="location" size={16} color={COLORS.textSecondary} />
        <Text style={styles.countriesText}>
          {plan.countries.map(c => c.name).join(', ')}
        </Text>
      </View>
      <TouchableOpacity 
        style={styles.buyButton}
        onPress={() => handlePurchase(plan)}
        disabled={loading}
      >
        <Text style={styles.buyButtonText}>
          {loading ? 'Procesando...' : 'Comprar Plan'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Planes de Datos</Text>
        <Text style={styles.subtitle}>Elige el plan perfecto para tu viaje</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Region Filter */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['all', 'europa', 'america', 'asia'].map((region) => (
              <TouchableOpacity
                key={region}
                style={[
                  styles.filterButton,
                  selectedRegion === region && styles.filterButtonActive,
                ]}
                onPress={() => setSelectedRegion(region)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    selectedRegion === region && styles.filterButtonTextActive,
                  ]}
                >
                  {region === 'all' ? 'Todos' : region.charAt(0).toUpperCase() + region.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Plans List */}
        <View style={styles.plansContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Cargando planes...</Text>
            </View>
          ) : (
            filteredPlans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))
          )}
        </View>
      </ScrollView>
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
  filterContainer: {
    paddingHorizontal: SIZES.padding,
    marginBottom: 20,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: COLORS.surface,
  },
  plansContainer: {
    paddingHorizontal: SIZES.padding,
  },
  planCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    ...SHADOWS.light,
    position: 'relative',
  },
  popularPlan: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    right: 20,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    fontSize: 12,
    color: COLORS.surface,
    fontWeight: '600',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  currency: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  planDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  countriesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  countriesText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  buyButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.surface,
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
});
