import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Clipboard,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../constants';
import { PurchasedESIM } from '../services/ESIMService';

interface ESIMDetailsScreenProps {
  navigation: any;
  route: {
    params: {
      esim: PurchasedESIM;
    };
  };
}

const ESIMDetailsScreen = ({ navigation, route }: ESIMDetailsScreenProps) => {
  const { esim } = route.params;
  const [isPaused, setIsPaused] = useState(false);

  const copyToClipboard = async (text: string, label: string) => {
    Clipboard.setString(text);
    Alert.alert('Copiado', `${label} copiado al portapapeles`);
  };

  const handlePauseToggle = () => {
    Alert.alert(
      isPaused ? 'Reanudar eSIM' : 'Pausar eSIM',
      isPaused 
        ? '¿Quieres reanudar este plan de datos?' 
        : '¿Quieres pausar temporalmente este plan de datos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: isPaused ? 'Reanudar' : 'Pausar',
          onPress: () => {
            setIsPaused(!isPaused);
            Alert.alert(
              'Estado actualizado',
              isPaused ? 'Tu eSIM ha sido reanudada' : 'Tu eSIM ha sido pausada'
            );
          },
        },
      ]
    );
  };

  const handleRenew = () => {
    Alert.alert(
      'Renovar Plan',
      `¿Quieres renovar tu plan ${esim.planName}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Renovar',
          onPress: () => {
            // Aquí iría la lógica de renovación
            Alert.alert('Plan renovado', 'Tu plan ha sido renovado exitosamente');
          },
        },
      ]
    );
  };

  const handleShowQR = () => {
    navigation.navigate('QRCodeView', { esim });
  };

  const handleInstallationGuide = () => {
    navigation.navigate('ESIMGuide', { esim });
  };

  const handleChatSupport = () => {
    // Preparar la información del eSIM para el chat
    const esimInfo = {
      iccid: esim.iccid,
      planName: esim.planName,
      status: esim.status,
      dataUsed: esim.dataUsed,
      dataTotal: esim.dataTotal,
      validUntil: esim.validUntil,
      purchaseDate: esim.purchaseDate,
      planCountries: esim.planCountries
    };

    navigation.navigate('LiveChat', { 
      esimContext: esimInfo,
      preloadMessage: `Hola, necesito asistencia con mi eSIM:\n\n📱 Plan: ${esim.planName}\n🔢 ICCID: ${esim.iccid}\n📊 Estado: ${getStatusText()}\n📈 Datos: ${esim.dataUsed}GB / ${esim.dataTotal}GB\n📅 Válida hasta: ${esim.validUntil}\n🌍 Cobertura: ${esim.planCountries}\n\n¿Podrían ayudarme?`
    });
  };

  const getStatusColor = () => {
    switch (esim.status) {
      case 'active': return '#10B981';
      case 'expired': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusText = () => {
    switch (esim.status) {
      case 'active': return 'Activa';
      case 'expired': return 'Expirada';
      default: return 'Inactiva';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalles del eSIM</Text>
        <TouchableOpacity onPress={handleInstallationGuide}>
          <Ionicons name="help-circle-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* eSIM Card */}
        <View style={styles.esimCardContainer}>
          <LinearGradient
            colors={esim.status === 'active' 
              ? ['#667eea', '#764ba2'] 
              : ['#8E8E93', '#6D6D70']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.esimCard}
          >
            {/* Decorative elements */}
            <View style={styles.backgroundDecoration}>
              <View style={[styles.circle, styles.circle1]} />
              <View style={[styles.circle, styles.circle2]} />
            </View>

            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardCountry}>{esim.planFlag}</Text>
                <Text style={styles.cardName}>{esim.planName}</Text>
                <Text style={styles.cardRegion}>{esim.planCountries}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
                <Text style={styles.statusText}>{getStatusText()}</Text>
              </View>
            </View>

            <View style={styles.cardBody}>
              <View style={styles.dataProgress}>
                <Text style={styles.dataLabel}>Datos utilizados</Text>
                <Text style={styles.dataValue}>{esim.dataUsed}GB / {esim.dataTotal}GB</Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${Math.min((esim.dataUsed / esim.dataTotal) * 100, 100)}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  {Math.round((esim.dataUsed / esim.dataTotal) * 100)}% utilizado
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Chat Support Banner */}
        <View style={styles.chatBanner}>
          <View style={styles.chatBannerContent}>
            <Ionicons name="chatbubbles" size={24} color={COLORS.primary} />
            <View style={styles.chatBannerText}>
              <Text style={styles.chatBannerTitle}>Soporte Especializado</Text>
              <Text style={styles.chatBannerSubtitle}>
                ¿Problemas con este eSIM? Nuestro chat incluirá automáticamente toda la información técnica.
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.chatBannerButton} onPress={handleChatSupport}>
            <Text style={styles.chatBannerButtonText}>Contactar Soporte</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleShowQR}>
            <Ionicons name="qr-code" size={24} color={COLORS.primary} />
            <Text style={styles.actionText}>Ver QR</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleRenew}>
            <Ionicons name="refresh" size={24} color={COLORS.primary} />
            <Text style={styles.actionText}>Renovar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleInstallationGuide}>
            <Ionicons name="book" size={24} color={COLORS.primary} />
            <Text style={styles.actionText}>Guía</Text>
          </TouchableOpacity>
        </View>

        {/* Pause/Resume Control */}
        <View style={styles.controlSection}>
          <View style={styles.controlItem}>
            <View style={styles.controlInfo}>
              <Text style={styles.controlTitle}>
                {isPaused ? 'eSIM Pausada' : 'eSIM Activa'}
              </Text>
              <Text style={styles.controlSubtitle}>
                {isPaused 
                  ? 'El plan está pausado temporalmente' 
                  : 'El plan está funcionando normalmente'
                }
              </Text>
            </View>
            <Switch
              value={!isPaused}
              onValueChange={() => handlePauseToggle()}
              trackColor={{ false: COLORS.gray[300], true: COLORS.primary }}
              thumbColor={isPaused ? COLORS.gray[500] : COLORS.white}
            />
          </View>
        </View>

        {/* Details Section */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Información Técnica</Text>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>ICCID</Text>
            <TouchableOpacity 
              style={styles.copyableField}
              onPress={() => copyToClipboard(esim.iccid, 'ICCID')}
            >
              <Text style={styles.detailValue}>{esim.iccid}</Text>
              <Ionicons name="copy-outline" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Plan de Datos</Text>
            <Text style={styles.detailValue}>{esim.planData}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Validez</Text>
            <Text style={styles.detailValue}>{esim.planValidity}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Válida hasta</Text>
            <Text style={styles.detailValue}>{esim.validUntil}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Fecha de compra</Text>
            <Text style={styles.detailValue}>{esim.purchaseDate}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Precio</Text>
            <Text style={styles.detailValue}>${esim.planPrice}</Text>
          </View>
        </View>

        {/* Usage Statistics */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Estadísticas de Uso</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="download" size={20} color={COLORS.primary} />
              <Text style={styles.statValue}>{esim.dataUsed}GB</Text>
              <Text style={styles.statLabel}>Utilizados</Text>
            </View>
            
            <View style={styles.statCard}>
              <Ionicons name="cloud" size={20} color={COLORS.success} />
              <Text style={styles.statValue}>{esim.dataTotal - esim.dataUsed}GB</Text>
              <Text style={styles.statLabel}>Restantes</Text>
            </View>
            
            <View style={styles.statCard}>
              <Ionicons name="time" size={20} color={COLORS.warning} />
              <Text style={styles.statValue}>
                {Math.ceil((new Date(esim.validUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
              </Text>
              <Text style={styles.statLabel}>Días restantes</Text>
            </View>
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.supportSection}>
          <Text style={styles.sectionTitle}>¿Necesitas ayuda?</Text>
          <Text style={styles.supportText}>
            Si tienes problemas con este eSIM o necesitas asistencia técnica específica, nuestro equipo de soporte está aquí para ayudarte.
          </Text>
          
          <View style={styles.supportButtons}>
            <TouchableOpacity style={styles.supportButton} onPress={handleInstallationGuide}>
              <Ionicons name="book" size={20} color={COLORS.white} />
              <Text style={styles.supportButtonText}>Ver Guía</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.supportButton, styles.chatButton]} onPress={handleChatSupport}>
              <Ionicons name="chatbubble-ellipses" size={20} color={COLORS.white} />
              <Text style={styles.supportButtonText}>Chat de Soporte</Text>
            </TouchableOpacity>
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
    paddingHorizontal: SPACING.md,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.black,
  },
  content: {
    flex: 1,
  },
  esimCardContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
  },
  esimCard: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    overflow: 'hidden',
  },
  backgroundDecoration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  circle: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 50,
  },
  circle1: {
    width: 100,
    height: 100,
    top: -30,
    right: -20,
  },
  circle2: {
    width: 60,
    height: 60,
    bottom: -10,
    left: -10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  cardCountry: {
    fontSize: 24,
    marginBottom: 4,
  },
  cardName: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 4,
  },
  cardRegion: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
  cardBody: {
    marginTop: SPACING.md,
  },
  dataProgress: {
    marginBottom: SPACING.md,
  },
  dataLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  dataValue: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: SPACING.sm,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    marginHorizontal: 4,
    borderRadius: BORDER_RADIUS.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionText: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.primary,
  },
  controlSection: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  controlItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlInfo: {
    flex: 1,
  },
  controlTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 2,
  },
  controlSubtitle: {
    fontSize: 14,
    color: COLORS.gray[600],
  },
  detailsSection: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: SPACING.md,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.gray[600],
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.black,
    textAlign: 'right',
    flex: 2,
  },
  copyableField: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
    justifyContent: 'flex-end',
  },
  statsSection: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.black,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray[600],
    marginTop: 2,
  },
  supportSection: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.xxl,
  },
  supportText: {
    fontSize: 14,
    color: COLORS.gray[600],
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  supportButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  supportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.md,
  },
  chatButton: {
    backgroundColor: COLORS.success,
  },
  supportButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  chatBanner: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.primary + '20',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chatBannerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  chatBannerText: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  chatBannerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 4,
  },
  chatBannerSubtitle: {
    fontSize: 14,
    color: COLORS.gray[600],
    lineHeight: 20,
  },
  chatBannerButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: BORDER_RADIUS.md,
    alignSelf: 'flex-start',
  },
  chatBannerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default ESIMDetailsScreen;
