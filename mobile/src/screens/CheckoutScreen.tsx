import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, CommonActions } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../constants';
import { RootStackParamList } from '../types/navigation';
import ESIMService from '../services/ESIMService';
import HablarisNotificationService from '../services/HablarisNotificationService';

type CheckoutScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Checkout'>;
type CheckoutScreenRouteProp = RouteProp<RootStackParamList, 'Checkout'>;

interface Props {
  navigation: CheckoutScreenNavigationProp;
  route: CheckoutScreenRouteProp;
}

const CheckoutScreen: React.FC<Props> = ({ navigation, route }) => {
  const { plan } = route.params;
  const [loading, setLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('card');

  const paymentMethods = [
    { id: 'card', name: 'Tarjeta de Crédito', icon: 'card', demo: true },
    { id: 'paypal', name: 'PayPal', icon: 'logo-paypal', demo: true },
    { id: 'apple', name: 'Apple Pay', icon: 'logo-apple', demo: true },
    { id: 'google', name: 'Google Pay', icon: 'logo-google', demo: true },
  ];

  const handlePurchase = async () => {
    setLoading(true);
    
    try {
      // Simulamos una compra en modo demo
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Agregar el eSIM comprado al almacenamiento local
      const purchasedESIM = await ESIMService.addPurchasedESIM(plan);
      
      // Enviar notificación de compra exitosa
      try {
        await HablarisNotificationService.sendNotification({
          title: '🎉 ¡Compra Exitosa!',
          body: `Tu eSIM ${plan.name} ha sido activada. ICCID: ${purchasedESIM.iccid}`,
          data: {
            type: 'purchase_completed',
            planId: purchasedESIM.id,
            planName: purchasedESIM.planName,
            iccid: purchasedESIM.iccid,
          },
          sound: true,
        });
      } catch (error) {
        console.error('Error sending purchase notification:', error);
      }
      
      Alert.alert(
        '¡Compra Exitosa!',
        `Has comprado exitosamente el plan ${plan.name}.\n\nTu eSIM ha sido activada automáticamente:\nICCID: ${purchasedESIM.iccid}\nVálida hasta: ${purchasedESIM.validUntil}`,
        [
          {
            text: 'Ver mis eSIMs',
            onPress: () => {
              // Usamos CommonActions para navegar directamente a la pestaña específica
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [
                    {
                      name: 'Main',
                      state: {
                        routes: [
                          { name: 'Home' },
                          { name: 'Plans' },
                          { name: 'MyESIMs' },
                          { name: 'Profile' },
                        ],
                        index: 2, // Index 2 corresponde a MyESIMs
                      },
                    },
                  ],
                })
              );
            },
          },
        ]
      );
    } catch (error) {
      console.error('Checkout error:', error);
      
      let errorMessage = 'Hubo un problema procesando tu compra. Intenta nuevamente.';
      
      if (error instanceof Error) {
        if (error.message.includes('Plan data is required')) {
          errorMessage = 'Error: Los datos del plan son inválidos. Por favor, selecciona un plan nuevamente.';
        } else if (error.message.includes('Cannot read property')) {
          errorMessage = 'Error: Datos del plan incompletos. Por favor, regresa al catálogo y selecciona el plan nuevamente.';
        } else if (error.message.includes('Network')) {
          errorMessage = 'Error de conexión. Verifica tu internet e intenta nuevamente.';
        }
      }
      
      Alert.alert('Error en la compra', errorMessage, [
        {
          text: 'Volver al catálogo',
          onPress: () => navigation.goBack(),
        },
        {
          text: 'Reintentar',
          style: 'default',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const total = plan.price;
  const tax = Math.round(total * 0.1 * 100) / 100; // 10% tax
  const finalTotal = total + tax;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Plan Summary */}
        <View style={styles.planSummary}>
          <Text style={styles.sectionTitle}>Resumen del Plan</Text>
          <View style={styles.planCard}>
            <View style={styles.planHeader}>
              <Text style={styles.planFlag}>{plan.flag}</Text>
              <View style={styles.planInfo}>
                <Text style={styles.planName}>{plan.name}</Text>
                <Text style={styles.planDetails}>
                  {plan.data} • {plan.validity} • {plan.countries}
                </Text>
              </View>
              <Text style={styles.planPrice}>${plan.price}</Text>
            </View>
            
            <View style={styles.planFeatures}>
              {plan.features.map((feature: string, index: number) => (
                <View key={index} style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>Método de Pago</Text>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentMethod,
                selectedPayment === method.id && styles.selectedPayment,
              ]}
              onPress={() => setSelectedPayment(method.id)}
            >
              <View style={styles.paymentMethodContent}>
                <Ionicons 
                  name={method.icon as any} 
                  size={24} 
                  color={selectedPayment === method.id ? COLORS.primary : COLORS.gray[500]} 
                />
                <Text style={[
                  styles.paymentMethodText,
                  selectedPayment === method.id && styles.selectedPaymentText,
                ]}>
                  {method.name}
                </Text>
                {method.demo && (
                  <View style={styles.demoBadge}>
                    <Text style={styles.demoBadgeText}>DEMO</Text>
                  </View>
                )}
              </View>
              <View style={[
                styles.radioButton,
                selectedPayment === method.id && styles.radioButtonSelected,
              ]}>
                {selectedPayment === method.id && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Order Summary */}
        <View style={styles.orderSummary}>
          <Text style={styles.sectionTitle}>Resumen del Pedido</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal:</Text>
            <Text style={styles.summaryValue}>${total.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Impuestos:</Text>
            <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>${finalTotal.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Purchase Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.purchaseButton, loading && styles.purchaseButtonDisabled]}
          onPress={handlePurchase}
          disabled={loading}
        >
          <LinearGradient
            colors={loading ? [COLORS.gray[400], COLORS.gray[400]] : [COLORS.primary, COLORS.primaryDark]}
            style={styles.purchaseButtonGradient}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="card" size={20} color="white" />
                <Text style={styles.purchaseButtonText}>
                  Comprar por ${finalTotal.toFixed(2)}
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  backButton: {
    padding: SPACING.sm,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: '700',
    color: COLORS.black,
  },
  placeholder: {
    width: 40,
  },
  planSummary: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: SPACING.md,
  },
  planCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  planFlag: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: SPACING.xs,
  },
  planDetails: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[600],
  },
  planPrice: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  planFeatures: {
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
    paddingTop: SPACING.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  featureText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.black,
    marginLeft: SPACING.sm,
  },
  paymentSection: {
    padding: SPACING.lg,
  },
  paymentMethod: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedPayment: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}10`,
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.black,
    marginLeft: SPACING.md,
    flex: 1,
  },
  selectedPaymentText: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  demoBadge: {
    backgroundColor: COLORS.warning,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  demoBadgeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '700',
    color: 'white',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: COLORS.primary,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  orderSummary: {
    padding: SPACING.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  summaryLabel: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.gray[600],
  },
  summaryValue: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.black,
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
    paddingTop: SPACING.sm,
    marginTop: SPACING.sm,
  },
  totalLabel: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: COLORS.black,
  },
  totalValue: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: COLORS.primary,
  },
  bottomContainer: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
    backgroundColor: COLORS.white,
  },
  purchaseButton: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  purchaseButtonDisabled: {
    opacity: 0.6,
  },
  purchaseButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
  },
  purchaseButtonText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: 'white',
    marginLeft: SPACING.sm,
  },
});

export default CheckoutScreen;
