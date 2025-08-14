import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../constants';

const { width } = Dimensions.get('window');

interface Country {
  name: string;
  code: string;
  coverage: 'excellent' | 'good' | 'limited';
  operators: string[];
  popular: boolean;
}

const CoverageMapScreen: React.FC = () => {
  const navigation = useNavigation();
  const [countries, setCountries] = useState<Country[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Mock data - replace with API call
    setCountries([
      {
        name: 'Estados Unidos',
        code: 'US',
        coverage: 'excellent',
        operators: ['Verizon', 'AT&T', 'T-Mobile'],
        popular: true,
      },
      {
        name: 'España',
        code: 'ES',
        coverage: 'excellent',
        operators: ['Vodafone', 'Orange', 'Movistar'],
        popular: true,
      },
      {
        name: 'Reino Unido',
        code: 'GB',
        coverage: 'excellent',
        operators: ['EE', 'O2', 'Three'],
        popular: true,
      },
      {
        name: 'Francia',
        code: 'FR',
        coverage: 'good',
        operators: ['Orange', 'SFR', 'Bouygues'],
        popular: true,
      },
      // Add more countries...
    ]);
  }, []);

  const getCoverageColor = (coverage: string) => {
    switch (coverage) {
      case 'excellent':
        return COLORS.success;
      case 'good':
        return COLORS.warning;
      case 'limited':
        return COLORS.error;
      default:
        return COLORS.gray[400];
    }
  };

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
        <Text style={styles.headerTitle}>Mapa de Cobertura</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>200+</Text>
            <Text style={styles.statLabel}>Países</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>500+</Text>
            <Text style={styles.statLabel}>Operadores</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>99.9%</Text>
            <Text style={styles.statLabel}>Uptime</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Países Populares</Text>
        
        {countries.filter(country => country.popular).map((country, index) => (
          <TouchableOpacity key={index} style={styles.countryCard}>
            <View style={styles.countryInfo}>
              <Text style={styles.countryName}>{country.name}</Text>
              <Text style={styles.operators}>
                {country.operators.join(', ')}
              </Text>
            </View>
            <View style={[
              styles.coverageBadge,
              { backgroundColor: getCoverageColor(country.coverage) }
            ]}>
              <Text style={styles.coverageText}>
                {country.coverage === 'excellent' ? 'Excelente' :
                 country.coverage === 'good' ? 'Buena' : 'Limitada'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[600],
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: COLORS.gray[900],
    marginBottom: SPACING.lg,
  },
  countryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  countryInfo: {
    flex: 1,
  },
  countryName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    color: COLORS.gray[900],
    marginBottom: SPACING.xs,
  },
  operators: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[600],
  },
  coverageBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  coverageText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default CoverageMapScreen;
