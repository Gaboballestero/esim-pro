import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../types/navigation';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../constants';

type HomeScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState({
    name: 'Usuario',
    activeESIMs: 2,
    totalDataUsed: '15.2 GB',
    remainingData: '4.8 GB',
  });

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const quickActions = [
    {
      id: 1,
      title: 'Comprar Plan',
      icon: 'add-circle-outline',
      color: COLORS.success,
      onPress: () => navigation.navigate('Plans'),
    },
    {
      id: 2,
      title: 'Escanear QR',
      icon: 'qr-code-outline',
      color: COLORS.primary,
      onPress: () => navigation.navigate('QRScanner'),
    },
    {
      id: 3,
      title: 'Mis eSIMs',
      icon: 'sim-outline',
      color: COLORS.info,
      onPress: () => navigation.navigate('MyESIMs'),
    },
    {
      id: 4,
      title: 'Soporte',
      icon: 'help-circle-outline',
      color: COLORS.warning,
      onPress: () => {},
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>¡Hola, {userData.name}!</Text>
              <Text style={styles.subGreeting}>
                Gestiona tus eSIMs fácilmente
              </Text>
            </View>
            <TouchableOpacity style={styles.profileButton}>
              <Ionicons name="person-circle-outline" size={32} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsCard}>
            <Text style={styles.statsNumber}>{userData.activeESIMs}</Text>
            <Text style={styles.statsLabel}>eSIMs Activas</Text>
            <Ionicons name="sim" size={24} color={COLORS.primary} />
          </View>

          <View style={styles.statsCard}>
            <Text style={styles.statsNumber}>{userData.totalDataUsed}</Text>
            <Text style={styles.statsLabel}>Datos Usados</Text>
            <Ionicons name="cellular" size={24} color={COLORS.success} />
          </View>

          <View style={styles.statsCard}>
            <Text style={styles.statsNumber}>{userData.remainingData}</Text>
            <Text style={styles.statsLabel}>Datos Restantes</Text>
            <Ionicons name="analytics" size={24} color={COLORS.info} />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickActionCard}
                onPress={action.onPress}
                activeOpacity={0.7}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: action.color }]}>
                  <Ionicons name={action.icon as any} size={24} color={COLORS.white} />
                </View>
                <Text style={styles.quickActionText}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actividad Reciente</Text>
          <View style={styles.activityContainer}>
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>eSIM Europa activada</Text>
                <Text style={styles.activityTime}>Hace 2 horas</Text>
              </View>
            </View>

            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons name="download" size={20} color={COLORS.info} />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Plan Asia descargado</Text>
                <Text style={styles.activityTime}>Ayer</Text>
              </View>
            </View>

            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons name="card" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Pago procesado - $29.99</Text>
                <Text style={styles.activityTime}>Hace 3 días</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Promotional Banner */}
        <View style={styles.section}>
          <LinearGradient
            colors={[COLORS.secondary, COLORS.primary]}
            style={styles.promoBanner}
          >
            <View style={styles.promoContent}>
              <Text style={styles.promoTitle}>🎉 Oferta Especial</Text>
              <Text style={styles.promoText}>
                20% de descuento en planes globales
              </Text>
              <TouchableOpacity style={styles.promoButton}>
                <Text style={styles.promoButtonText}>Ver Ofertas</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
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
    paddingVertical: SPACING.xl,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.white,
  },
  subGreeting: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: SPACING.xs,
  },
  profileButton: {
    padding: SPACING.sm,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginTop: -SPACING.lg,
    marginBottom: SPACING.lg,
  },
  statsCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.xs,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsNumber: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.black,
    marginBottom: SPACING.xs,
  },
  statsLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[600],
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.black,
    marginBottom: SPACING.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  quickActionText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.black,
    textAlign: 'center',
  },
  activityContainer: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  activityIcon: {
    marginRight: SPACING.md,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.black,
  },
  activityTime: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[600],
    marginTop: SPACING.xs,
  },
  promoBanner: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
  },
  promoContent: {
    alignItems: 'center',
  },
  promoTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.white,
    marginBottom: SPACING.sm,
  },
  promoText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.white,
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  promoButton: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  promoButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.primary,
  },
});

export default HomeScreen;
