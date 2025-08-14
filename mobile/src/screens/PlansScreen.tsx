import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../constants';
import { RootStackParamList } from '../types/navigation';

type PlansScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface Props {
  navigation: PlansScreenNavigationProp;
}

const PlansScreen: React.FC<Props> = ({ navigation }) => {
  const plans = [
    {
      id: 1,
      name: 'Europa',
      countries: '30+ países',
      data: '5GB',
      validity: '7 días',
      price: 19,
      currency: 'USD',
      popular: false,
      features: ['4G/5G velocidad', 'Sin roaming', 'Activación instantánea'],
      flag: '🇪🇺',
    },
    {
      id: 2,
      name: 'Asia',
      countries: '15+ países',
      data: '10GB',
      validity: '15 días',
      price: 29,
      currency: 'USD',
      popular: true,
      features: ['4G/5G velocidad', 'Sin roaming', 'Soporte 24/7', 'Datos ilimitados'],
      flag: '🌏',
    },
    {
      id: 3,
      name: 'Global',
      countries: '190+ países',
      data: '20GB',
      validity: '30 días',
      price: 49,
      currency: 'USD',
      popular: false,
      features: ['4G/5G velocidad', 'Sin roaming', 'Soporte premium', 'Renovación automática'],
      flag: '🌍',
    },
    {
      id: 4,
      name: 'América',
      countries: '25+ países',
      data: '8GB',
      validity: '14 días',
      price: 24,
      currency: 'USD',
      popular: false,
      features: ['4G/5G velocidad', 'Sin roaming', 'Activación rápida'],
      flag: '🌎',
    },
  ];

  const handlePurchase = (plan: any) => {
    // Navigate to checkout screen with plan data
    navigation.navigate('Checkout', { plan });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Planes de Datos</Text>
          <Text style={styles.headerSubtitle}>
            Elige el plan perfecto para tu viaje
          </Text>
        </LinearGradient>

        {/* Plans Grid */}
        <View style={styles.plansContainer}>
          {plans.map((plan) => (
            <View key={plan.id} style={styles.planCard}>
              {plan.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>MÁS POPULAR</Text>
                </View>
              )}

              <View style={styles.planHeader}>
                <Text style={styles.planFlag}>{plan.flag}</Text>
                <Text style={styles.planName}>{plan.name}</Text>
                <Text style={styles.planCountries}>{plan.countries}</Text>
              </View>

              <View style={styles.planPricing}>
                <Text style={styles.planPrice}>
                  ${plan.price}
                  <Text style={styles.planCurrency}>/{plan.validity}</Text>
                </Text>
              </View>

              <View style={styles.planDetails}>
                <View style={styles.planDetailItem}>
                  <Ionicons name="cellular" size={16} color={COLORS.primary} />
                  <Text style={styles.planDetailText}>{plan.data} de datos</Text>
                </View>
                <View style={styles.planDetailItem}>
                  <Ionicons name="time" size={16} color={COLORS.primary} />
                  <Text style={styles.planDetailText}>Válido por {plan.validity}</Text>
                </View>
              </View>

              <View style={styles.planFeatures}>
                {plan.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={[
                  styles.purchaseButton,
                  plan.popular && styles.purchaseButtonPopular,
                ]}
                onPress={() => handlePurchase(plan)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.purchaseButtonText,
                    plan.popular && styles.purchaseButtonTextPopular,
                  ]}
                >
                  Comprar Ahora
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>¿Cómo funciona?</Text>
          
          <View style={styles.stepContainer}>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepText}>Selecciona tu plan de datos</Text>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepText}>Completa el pago seguro</Text>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepText}>Escanea el código QR y conéctate</Text>
            </View>
          </View>
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
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xxl,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.white,
    marginBottom: SPACING.sm,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.white,
    opacity: 0.9,
    textAlign: 'center',
  },
  plansContainer: {
    paddingHorizontal: SPACING.lg,
    marginTop: -SPACING.lg,
  },
  planCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    left: SPACING.lg,
    backgroundColor: COLORS.warning,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  popularText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.white,
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  planFlag: {
    fontSize: 40,
    marginBottom: SPACING.sm,
  },
  planName: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.black,
    marginBottom: SPACING.xs,
  },
  planCountries: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[600],
  },
  planPricing: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  planPrice: {
    fontSize: TYPOGRAPHY.sizes.xxxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
  },
  planCurrency: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.normal,
    color: COLORS.gray[600],
  },
  planDetails: {
    marginBottom: SPACING.lg,
  },
  planDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  planDetailText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.black,
    marginLeft: SPACING.sm,
  },
  planFeatures: {
    marginBottom: SPACING.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  featureText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[700],
    marginLeft: SPACING.sm,
  },
  purchaseButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    minWidth: 120, // Ancho mínimo para evitar botones estrechos
  },
  purchaseButtonPopular: {
    backgroundColor: COLORS.secondary,
  },
  purchaseButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.white,
  },
  purchaseButtonTextPopular: {
    color: COLORS.white,
  },
  infoSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.gray[50],
    marginTop: SPACING.lg,
  },
  infoTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  stepContainer: {
    paddingHorizontal: SPACING.md,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  stepNumberText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.white,
  },
  stepText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.gray[700],
    flex: 1,
  },
});

export default PlansScreen;
