import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../constants';

interface PlanPause {
  id: string;
  planName: string;
  pausedDate: string;
  resumeDate?: string;
  dataRemaining: number;
}

const PlanManagementScreen: React.FC = () => {
  const navigation = useNavigation();
  const [autoRenewal, setAutoRenewal] = useState(true);
  const [lowDataAlerts, setLowDataAlerts] = useState(true);
  const [roamingAlerts, setRoamingAlerts] = useState(true);
  const [pausedPlans, setPausedPlans] = useState<PlanPause[]>([]);

  useEffect(() => {
    // Mock data
    setPausedPlans([
      {
        id: '1',
        planName: 'España 5GB',
        pausedDate: '2025-01-20',
        dataRemaining: 3.2,
      },
    ]);
  }, []);

  const handlePausePlan = () => {
    Alert.alert(
      'Pausar Plan',
      'Tu plan se pausará inmediatamente. Podrás reactivarlo cuando quieras sin perder datos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Pausar', onPress: () => console.log('Plan pausado') },
      ]
    );
  };

  const handleResumePlan = (planId: string) => {
    Alert.alert(
      'Reanudar Plan',
      '¿Deseas reanudar este plan? Se activará inmediatamente.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Reanudar', onPress: () => console.log('Plan reanudado') },
      ]
    );
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
        <Text style={styles.headerTitle}>Gestión de Planes</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Auto-renewal Settings */}
        <View style={styles.settingsCard}>
          <Text style={styles.cardTitle}>Configuración Automática</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Renovación Automática</Text>
              <Text style={styles.settingDescription}>
                Renueva automáticamente tus planes antes de que expiren
              </Text>
            </View>
            <Switch
              value={autoRenewal}
              onValueChange={setAutoRenewal}
              trackColor={{ false: COLORS.gray[300], true: COLORS.primary }}
              thumbColor={autoRenewal ? COLORS.white : COLORS.gray[500]}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Alertas de Datos Bajos</Text>
              <Text style={styles.settingDescription}>
                Recibe notificaciones cuando te queden menos de 500MB
              </Text>
            </View>
            <Switch
              value={lowDataAlerts}
              onValueChange={setLowDataAlerts}
              trackColor={{ false: COLORS.gray[300], true: COLORS.primary }}
              thumbColor={lowDataAlerts ? COLORS.white : COLORS.gray[500]}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Alertas de Roaming</Text>
              <Text style={styles.settingDescription}>
                Te avisamos cuando estés usando roaming internacional
              </Text>
            </View>
            <Switch
              value={roamingAlerts}
              onValueChange={setRoamingAlerts}
              trackColor={{ false: COLORS.gray[300], true: COLORS.primary }}
              thumbColor={roamingAlerts ? COLORS.white : COLORS.gray[500]}
            />
          </View>
        </View>

        {/* Plan Control */}
        <View style={styles.controlCard}>
          <Text style={styles.cardTitle}>Control de Planes</Text>
          
          <TouchableOpacity style={styles.controlButton} onPress={handlePausePlan}>
            <View style={styles.controlButtonContent}>
              <Ionicons name="pause-circle" size={24} color={COLORS.warning} />
              <View style={styles.controlButtonText}>
                <Text style={styles.controlTitle}>Pausar Plan Actual</Text>
                <Text style={styles.controlDescription}>
                  Pausa tu plan y conserva los datos para más tarde
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton}>
            <View style={styles.controlButtonContent}>
              <Ionicons name="swap-horizontal" size={24} color={COLORS.primary} />
              <View style={styles.controlButtonText}>
                <Text style={styles.controlTitle}>Cambiar Plan</Text>
                <Text style={styles.controlDescription}>
                  Upgrade o downgrade tu plan actual
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton}>
            <View style={styles.controlButtonContent}>
              <Ionicons name="gift" size={24} color={COLORS.success} />
              <View style={styles.controlButtonText}>
                <Text style={styles.controlTitle}>Transferir Datos</Text>
                <Text style={styles.controlDescription}>
                  Comparte datos con otros usuarios
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Paused Plans */}
        {pausedPlans.length > 0 && (
          <View style={styles.pausedCard}>
            <Text style={styles.cardTitle}>Planes Pausados</Text>
            
            {pausedPlans.map((plan) => (
              <View key={plan.id} style={styles.pausedPlan}>
                <View style={styles.pausedPlanInfo}>
                  <Text style={styles.pausedPlanName}>{plan.planName}</Text>
                  <Text style={styles.pausedPlanData}>
                    {plan.dataRemaining.toFixed(1)} GB restantes
                  </Text>
                  <Text style={styles.pausedDate}>
                    Pausado desde {new Date(plan.pausedDate).toLocaleDateString('es-ES')}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.resumeButton}
                  onPress={() => handleResumePlan(plan.id)}
                >
                  <Ionicons name="play-circle" size={20} color={COLORS.white} />
                  <Text style={styles.resumeButtonText}>Reanudar</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Emergency Features */}
        <View style={styles.emergencyCard}>
          <Text style={styles.cardTitle}>Funciones de Emergencia</Text>
          
          <TouchableOpacity style={styles.emergencyButton}>
            <Ionicons name="flash" size={24} color={COLORS.error} />
            <View style={styles.emergencyButtonText}>
              <Text style={styles.emergencyTitle}>Datos de Emergencia</Text>
              <Text style={styles.emergencyDescription}>
                100MB gratis para emergencias (1 vez por mes)
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.emergencyButton}>
            <Ionicons name="call" size={24} color={COLORS.error} />
            <View style={styles.emergencyButtonText}>
              <Text style={styles.emergencyTitle}>Soporte 24/7</Text>
              <Text style={styles.emergencyDescription}>
                Chat o llamada de emergencia
              </Text>
            </View>
          </TouchableOpacity>
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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  settingsCard: {
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
  controlCard: {
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
  pausedCard: {
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
  emergencyCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: COLORS.gray[900],
    marginBottom: SPACING.lg,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  settingInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  settingTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    color: COLORS.gray[900],
    marginBottom: SPACING.xs,
  },
  settingDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[600],
    lineHeight: 18,
  },
  controlButton: {
    marginBottom: SPACING.md,
  },
  controlButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS.lg,
  },
  controlButtonText: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  controlTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    color: COLORS.gray[900],
    marginBottom: SPACING.xs,
  },
  controlDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[600],
  },
  pausedPlan: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  pausedPlanInfo: {
    flex: 1,
  },
  pausedPlanName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    color: COLORS.gray[900],
    marginBottom: SPACING.xs,
  },
  pausedPlanData: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.primary,
    fontWeight: '500',
    marginBottom: SPACING.xs,
  },
  pausedDate: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[600],
  },
  resumeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  resumeButtonText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: COLORS.white,
    marginLeft: SPACING.xs,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
  },
  emergencyButtonText: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  emergencyTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    color: COLORS.error,
    marginBottom: SPACING.xs,
  },
  emergencyDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[700],
  },
});

export default PlanManagementScreen;
