import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../constants';

interface AIRecommendation {
  type: 'plan' | 'destination' | 'optimization';
  title: string;
  description: string;
  savings?: number;
  icon: string;
  action: string;
}

const AIAssistantScreen: React.FC = () => {
  const navigation = useNavigation();
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    // Mock AI recommendations
    setRecommendations([
      {
        type: 'optimization',
        title: 'Optimiza tu uso de datos',
        description: 'Detectamos que usas más datos entre 8-10 PM. Te recomendamos el plan nocturno para ahorrar 40%.',
        savings: 12.50,
        icon: 'bulb',
        action: 'Ver Plan Nocturno',
      },
      {
        type: 'destination',
        title: 'Próximo viaje detectado',
        description: 'Vemos que buscaste vuelos a Japón. Te sugerimos nuestro plan Asia 7GB por 30 días.',
        icon: 'airplane',
        action: 'Ver Plan Japón',
      },
      {
        type: 'plan',
        title: 'Upgrade recomendado',
        description: 'Has usado 90% de tus datos en 2 semanas. El plan superior te daría mejor value.',
        savings: 8.00,
        icon: 'trending-up',
        action: 'Upgrade Plan',
      },
    ]);
  }, []);

  const analyzeUsage = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      Alert.alert(
        'Análisis Completado',
        'Hemos encontrado 3 nuevas recomendaciones para optimizar tu experiencia.',
        [{ text: 'Ver Recomendaciones', onPress: () => {} }]
      );
    }, 2000);
  };

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case 'optimization':
        return COLORS.success;
      case 'destination':
        return COLORS.primary;
      case 'plan':
        return COLORS.warning;
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
        <Text style={styles.headerTitle}>Asistente IA</Text>
        <TouchableOpacity 
          style={styles.analyzeButton}
          onPress={analyzeUsage}
          disabled={isAnalyzing}
        >
          <Ionicons 
            name={isAnalyzing ? "hourglass" : "refresh"} 
            size={20} 
            color={COLORS.white} 
          />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* AI Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Ionicons name="bulb" size={32} color={COLORS.primary} />
            <View style={styles.statusInfo}>
              <Text style={styles.statusTitle}>eSIM AI Assistant</Text>
              <Text style={styles.statusDescription}>
                Analizando tu uso para mejorar tu experiencia
              </Text>
            </View>
          </View>
          
          <View style={styles.aiStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>$47</Text>
              <Text style={styles.statLabel}>Ahorrado este mes</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>94%</Text>
              <Text style={styles.statLabel}>Precisión IA</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Recomendaciones</Text>
            </View>
          </View>
        </View>

        {/* Recommendations */}
        <Text style={styles.sectionTitle}>Recomendaciones Personalizadas</Text>
        
        {recommendations.map((recommendation, index) => (
          <View key={index} style={styles.recommendationCard}>
            <View style={styles.recommendationHeader}>
              <View style={[
                styles.recommendationIcon,
                { backgroundColor: getRecommendationColor(recommendation.type) }
              ]}>
                <Ionicons 
                  name={recommendation.icon as any} 
                  size={20} 
                  color={COLORS.white} 
                />
              </View>
              <View style={styles.recommendationInfo}>
                <Text style={styles.recommendationTitle}>
                  {recommendation.title}
                </Text>
                {recommendation.savings && (
                  <Text style={styles.savingsText}>
                    Ahorra ${recommendation.savings.toFixed(2)}/mes
                  </Text>
                )}
              </View>
            </View>
            
            <Text style={styles.recommendationDescription}>
              {recommendation.description}
            </Text>
            
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>
                {recommendation.action}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        ))}

        {/* Smart Features */}
        <Text style={styles.sectionTitle}>Funciones Inteligentes</Text>
        
        <View style={styles.featuresGrid}>
          <TouchableOpacity style={styles.featureCard}>
            <Ionicons name="location" size={24} color={COLORS.primary} />
            <Text style={styles.featureTitle}>Auto-Switch</Text>
            <Text style={styles.featureDescription}>
              Cambia automáticamente a la mejor red disponible
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.featureCard}>
            <Ionicons name="shield-checkmark" size={24} color={COLORS.success} />
            <Text style={styles.featureTitle}>Fraud Protection</Text>
            <Text style={styles.featureDescription}>
              Detecta y bloquea uso sospechoso automáticamente
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.featureCard}>
            <Ionicons name="flash" size={24} color={COLORS.warning} />
            <Text style={styles.featureTitle}>Speed Optimizer</Text>
            <Text style={styles.featureDescription}>
              Optimiza velocidad según tu ubicación y hora
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.featureCard}>
            <Ionicons name="calendar" size={24} color={COLORS.info} />
            <Text style={styles.featureTitle}>Travel Planner</Text>
            <Text style={styles.featureDescription}>
              Planifica y pre-configura eSIMs para tus viajes
            </Text>
          </TouchableOpacity>
        </View>

        {/* AI Learning */}
        <View style={styles.learningCard}>
          <View style={styles.learningHeader}>
            <Ionicons name="school" size={24} color={COLORS.primary} />
            <Text style={styles.learningTitle}>El AI está aprendiendo</Text>
          </View>
          <Text style={styles.learningDescription}>
            Cuanto más uses la app, mejores serán nuestras recomendaciones. 
            Ya hemos analizado tus últimos 30 días de uso.
          </Text>
          <View style={styles.learningProgress}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '78%' }]} />
            </View>
            <Text style={styles.progressText}>78% completado</Text>
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
  analyzeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  statusCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  statusInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  statusTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: COLORS.gray[900],
    marginBottom: SPACING.xs,
  },
  statusDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[600],
  },
  aiStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[600],
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.gray[200],
    marginHorizontal: SPACING.sm,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: COLORS.gray[900],
    marginBottom: SPACING.lg,
  },
  recommendationCard: {
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
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  recommendationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  recommendationInfo: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    color: COLORS.gray[900],
    marginBottom: SPACING.xs,
  },
  savingsText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.success,
    fontWeight: '500',
  },
  recommendationDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[600],
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS.md,
  },
  actionButtonText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  featureCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  featureTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: COLORS.gray[900],
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[600],
    textAlign: 'center',
    lineHeight: 16,
  },
  learningCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  learningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  learningTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    color: COLORS.gray[900],
    marginLeft: SPACING.sm,
  },
  learningDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[600],
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  learningProgress: {
    marginTop: SPACING.sm,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.gray[200],
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: SPACING.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  progressText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[600],
    textAlign: 'right',
  },
});

export default AIAssistantScreen;
