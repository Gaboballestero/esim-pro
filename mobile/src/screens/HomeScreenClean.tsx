import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  Alert,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainTabParamList, RootStackParamList } from '../types/navigation';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../constants';
import { AuthService } from '../services/AuthService';
import ESIMService from '../services/ESIMService';

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  StackNavigationProp<RootStackParamList>
>;

const HomeScreenClean: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [userData, setUserData] = useState({
    name: 'Usuario',
    activeESIMs: 0,
    totalDataUsed: '0 GB',
    remainingData: '0 GB',
  });

  useEffect(() => {
    loadUserData();
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await AuthService.getCurrentUser();
      if (user) {
        const displayName = user.first_name && user.last_name 
          ? `${user.first_name} ${user.last_name}`
          : user.email?.split('@')[0] || 'Usuario';
        
        const esims = await ESIMService.getPurchasedESIMs();
        const activeESIMs = esims.filter((esim: any) => esim.status === 'active').length;
        
        let totalUsed = 0;
        let totalRemaining = 0;
        
        esims.forEach((esim: any) => {
          const used = typeof esim.dataUsed === 'string' 
            ? parseFloat(esim.dataUsed.replace(' GB', '')) 
            : esim.dataUsed || 0;
          const total = esim.dataTotal || 5;
          totalUsed += used;
          totalRemaining += (total - used);
        });

        setUserData({
          name: displayName,
          activeESIMs: activeESIMs,
          totalDataUsed: `${totalUsed.toFixed(1)} GB`,
          remainingData: `${totalRemaining.toFixed(1)} GB`,
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  }, []);

  // Principales acciones - Solo las más importantes
  const primaryActions = [
    {
      id: 1,
      title: 'Comprar Plan',
      subtitle: 'Explora destinos',
      icon: 'add-circle-outline',
      color: COLORS.primary,
      onPress: () => navigation.navigate('Plans'),
    },
    {
      id: 2,
      title: 'Mis eSIMs',
      subtitle: 'Gestionar',
      icon: 'card-outline',
      color: COLORS.success,
      onPress: () => navigation.navigate('MyESIMs'),
    },
  ];

  // Funciones avanzadas - Menos prominentes
  const advancedFeatures = [
    {
      id: 1,
      title: 'Dashboard Pro',
      icon: 'analytics-outline',
      color: COLORS.warning,
      onPress: () => navigation.navigate('AdvancedDashboard'),
      isNew: true,
    },
    {
      id: 2,
      title: 'Planes Flexibles',
      icon: 'options-outline',
      color: COLORS.info,
      onPress: () => navigation.navigate('FlexiblePlans'),
      isNew: true,
    },
    {
      id: 3,
      title: 'Recompensas',
      icon: 'gift-outline',
      color: COLORS.secondary,
      onPress: () => navigation.navigate('Rewards'),
      isNew: true,
    },
    {
      id: 4,
      title: 'Smart Location',
      icon: 'location-outline',
      color: COLORS.primary,
      onPress: () => navigation.navigate('Geolocation'),
      isNew: true,
    },
  ];

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View style={styles.greetingSection}>
          <Text style={styles.greeting}>Hola, {userData.name} 👋</Text>
          <Text style={styles.subGreeting}>Gestiona tus conexiones globales</Text>
        </View>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons name="person-circle-outline" size={28} color={COLORS.gray[600]} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSummaryCard = () => (
    <Animated.View style={[styles.summaryCard, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.summaryGradient}
      >
        <View style={styles.summaryContent}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Ionicons name="card-outline" size={20} color={COLORS.white} />
              <Text style={styles.summaryNumber}>{userData.activeESIMs}</Text>
              <Text style={styles.summaryLabel}>eSIMs Activas</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Ionicons name="cellular-outline" size={20} color={COLORS.white} />
              <Text style={styles.summaryNumber}>{userData.totalDataUsed}</Text>
              <Text style={styles.summaryLabel}>Datos Usados</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Ionicons name="analytics-outline" size={20} color={COLORS.white} />
              <Text style={styles.summaryNumber}>{userData.remainingData}</Text>
              <Text style={styles.summaryLabel}>Disponibles</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderPrimaryActions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Acciones Principales</Text>
      <View style={styles.primaryActionsContainer}>
        {primaryActions.map((action, index) => (
          <Animated.View
            key={action.id}
            style={[
              styles.primaryActionWrapper,
              {
                opacity: fadeAnim,
                transform: [{
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                }],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.primaryActionCard}
              onPress={action.onPress}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[action.color, `${action.color}E6`]}
                style={styles.primaryActionGradient}
              >
                <Ionicons name={action.icon as any} size={28} color={COLORS.white} />
                <Text style={styles.primaryActionTitle}>{action.title}</Text>
                <Text style={styles.primaryActionSubtitle}>{action.subtitle}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </View>
  );

  const renderAdvancedFeatures = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Funciones Avanzadas</Text>
        <View style={styles.newFeatureBadge}>
          <Text style={styles.newFeatureText}>NUEVO</Text>
        </View>
      </View>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.advancedFeaturesContainer}
      >
        {advancedFeatures.map((feature, index) => (
          <Animated.View
            key={feature.id}
            style={[
              styles.advancedFeatureCard,
              {
                opacity: fadeAnim,
                transform: [{
                  translateX: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                }],
              },
            ]}
          >
            <TouchableOpacity
              onPress={feature.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.advancedFeatureContent}>
                {feature.isNew && (
                  <View style={styles.featureNewBadge}>
                    <Text style={styles.featureNewText}>NEW</Text>
                  </View>
                )}
                <View style={[styles.advancedFeatureIcon, { backgroundColor: `${feature.color}20` }]}>
                  <Ionicons name={feature.icon as any} size={24} color={feature.color} />
                </View>
                <Text style={styles.advancedFeatureTitle}>{feature.title}</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );

  const renderPromoBanner = () => (
    <Animated.View 
      style={[
        styles.promoBanner,
        {
          opacity: fadeAnim,
          transform: [{
            scale: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.95, 1],
            }),
          }],
        },
      ]}
    >
      <LinearGradient
        colors={['#FF6B6B', '#FF8E8E']}
        style={styles.promoGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.promoContent}>
          <View style={styles.promoTextSection}>
            <Text style={styles.promoTitle}>🎉 Oferta Especial</Text>
            <Text style={styles.promoDescription}>
              20% OFF en planes globales
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.promoButton}
            onPress={() => navigation.navigate('Plans')}
          >
            <Text style={styles.promoButtonText}>Ver Ofertas</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}
        {renderSummaryCard()}
        {renderPrimaryActions()}
        {renderAdvancedFeatures()}
        {renderPromoBanner()}
        
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Floating QR Scanner Button */}
      <Animated.View
        style={[
          styles.floatingButton,
          {
            opacity: fadeAnim,
            transform: [{
              scale: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
              }),
            }],
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => Alert.alert('Función no disponible', 'El escáner QR no está disponible en Expo Go. Usa un development build.')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            style={styles.floatingButtonGradient}
          >
            <Ionicons name="qr-code-outline" size={24} color={COLORS.white} />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
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
  
  // Header
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.background,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingSection: {
    flex: 1,
  },
  greeting: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: SPACING.xs,
  },
  subGreeting: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.gray[600],
    fontWeight: '400',
  },
  profileButton: {
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.gray[100],
  },
  
  // Summary Card
  summaryCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    borderRadius: BORDER_RADIUS.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  summaryGradient: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
  },
  summaryContent: {
    alignItems: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: COLORS.white,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  summaryLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    fontWeight: '500',
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: SPACING.md,
  },
  
  // Sections
  section: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: COLORS.black,
  },
  newFeatureBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  newFeatureText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  
  // Primary Actions
  primaryActionsContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  primaryActionWrapper: {
    flex: 1,
  },
  primaryActionCard: {
    borderRadius: BORDER_RADIUS.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryActionGradient: {
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    minHeight: 140,
    justifyContent: 'center',
  },
  primaryActionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: COLORS.white,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  primaryActionSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  
  // Advanced Features
  advancedFeaturesContainer: {
    paddingRight: SPACING.lg,
    gap: SPACING.md,
  },
  advancedFeatureCard: {
    width: 120,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  advancedFeatureContent: {
    padding: SPACING.lg,
    alignItems: 'center',
    position: 'relative',
  },
  advancedFeatureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  advancedFeatureTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: COLORS.black,
    textAlign: 'center',
  },
  featureNewBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: COLORS.error,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 8,
  },
  featureNewText: {
    fontSize: 8,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.3,
  },
  
  // Promo Banner
  promoBanner: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    borderRadius: BORDER_RADIUS.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  promoGradient: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
  },
  promoContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  promoTextSection: {
    flex: 1,
  },
  promoTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  promoDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.9)',
  },
  promoButton: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  promoButtonText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  
  // Floating Button
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    elevation: 8,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  floatingButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  bottomSpacer: {
    height: 100,
  },
});

export default HomeScreenClean;
