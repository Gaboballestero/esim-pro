import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Share,
  Clipboard,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import RewardsService from '../services/RewardsService';

const { width } = Dimensions.get('window');

interface RewardItem {
  id: number;
  name: string;
  description: string;
  points_required: number;
  reward_type: string;
  value: number;
  currency: string;
  is_available: boolean;
  category: string;
  image_url?: string;
}

interface UserRewards {
  total_points: number;
  points_earned_this_month: number;
  points_redeemed_this_month: number;
  current_tier: string;
  next_tier?: string;
  points_to_next_tier?: number;
  referral_code: string;
  successful_referrals: number;
  lifetime_earnings: number;
}

const RewardsScreen: React.FC = () => {
  const [userRewards, setUserRewards] = useState<UserRewards | null>(null);
  const [availableRewards, setAvailableRewards] = useState<RewardItem[]>([]);
  const [redeemedRewards, setRedeemedRewards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'earn' | 'redeem' | 'history'>('earn');

  const rewardsService = RewardsService.getInstance();

  useEffect(() => {
    loadRewardsData();
  }, []);

  const loadRewardsData = async () => {
    try {
      setIsLoading(true);
      const [userData, rewards, history] = await Promise.all([
        rewardsService.getUserRewards(),
        rewardsService.getAvailableRewards(),
        rewardsService.getRedemptionHistory(),
      ]);
      
      setUserRewards(userData);
      setAvailableRewards(rewards);
      setRedeemedRewards(history);
    } catch (error) {
      console.error('Error loading rewards data:', error);
      Alert.alert('Error', 'No se pudieron cargar las recompensas');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRewardsData();
    setRefreshing(false);
  };

  const shareReferralCode = async () => {
    if (!userRewards?.referral_code) return;
    
    try {
      await Share.share({
        message: `¡Únete a Hablaris con mi código de referido ${userRewards.referral_code} y obtén puntos gratis! 🎁`,
        title: 'Código de Referido Hablaris',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const copyReferralCode = () => {
    if (!userRewards?.referral_code) return;
    
    Clipboard.setString(userRewards.referral_code);
    Alert.alert('¡Copiado!', 'Código de referido copiado al portapapeles');
  };

  const redeemReward = async (rewardId: number) => {
    try {
      Alert.alert(
        'Confirmar Canje',
        '¿Estás seguro de que quieres canjear esta recompensa?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Canjear',
            style: 'default',
            onPress: async () => {
              const result = await rewardsService.redeemReward(rewardId);
              if (result.success) {
                Alert.alert('¡Éxito!', 'Recompensa canjeada exitosamente');
                loadRewardsData();
              } else {
                Alert.alert('Error', result.message || 'No se pudo canjear la recompensa');
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error redeeming reward:', error);
      Alert.alert('Error', 'Ocurrió un error al canjear la recompensa');
    }
  };

  const getTierColor = (tier: string): string => {
    const colors = {
      bronze: '#CD7F32',
      silver: '#C0C0C0',
      gold: '#FFD700',
      platinum: '#E5E4E2',
      diamond: '#B9F2FF',
    };
    return colors[tier.toLowerCase() as keyof typeof colors] || '#6B7280';
  };

  const getTierIcon = (tier: string): string => {
    const icons = {
      bronze: '🥉',
      silver: '🥈',
      gold: '🥇',
      platinum: '💎',
      diamond: '💠',
    };
    return icons[tier.toLowerCase() as keyof typeof icons] || '🏆';
  };

  const formatPoints = (points: number): string => {
    return points.toLocaleString();
  };

  const renderPointsCard = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.pointsCard}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.pointsHeader}>
        <Text style={styles.pointsTitle}>Mis Puntos</Text>
        <Text style={styles.pointsAmount}>{formatPoints(userRewards?.total_points || 0)}</Text>
      </View>
      
      <View style={styles.tierSection}>
        <View style={styles.tierInfo}>
          <Text style={styles.tierIcon}>{getTierIcon(userRewards?.current_tier || 'bronze')}</Text>
          <View>
            <Text style={styles.tierText}>Nivel {userRewards?.current_tier || 'Bronze'}</Text>
            {userRewards?.next_tier && (
              <Text style={styles.nextTierText}>
                {formatPoints(userRewards.points_to_next_tier || 0)} puntos para {userRewards.next_tier}
              </Text>
            )}
          </View>
        </View>
        
        {userRewards?.next_tier && (
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${Math.min(100, ((userRewards.total_points % 1000) / 1000) * 100)}%` 
                }
              ]} 
            />
          </View>
        )}
      </View>
    </LinearGradient>
  );

  const renderReferralCard = () => (
    <View style={styles.referralCard}>
      <View style={styles.referralHeader}>
        <Ionicons name="people" size={24} color="#667eea" />
        <Text style={styles.referralTitle}>Invita Amigos</Text>
      </View>
      
      <Text style={styles.referralDescription}>
        Comparte tu código y gana 100 puntos por cada amigo que se registre
      </Text>
      
      <View style={styles.referralCodeContainer}>
        <Text style={styles.referralCodeLabel}>Tu código:</Text>
        <View style={styles.referralCodeBox}>
          <Text style={styles.referralCode}>{userRewards?.referral_code}</Text>
          <TouchableOpacity onPress={copyReferralCode} style={styles.copyButton}>
            <Ionicons name="copy" size={20} color="#667eea" />
          </TouchableOpacity>
        </View>
      </View>
      
      <TouchableOpacity onPress={shareReferralCode} style={styles.shareButton}>
        <Ionicons name="share" size={20} color="white" />
        <Text style={styles.shareButtonText}>Compartir Código</Text>
      </TouchableOpacity>
      
      <View style={styles.referralStats}>
        <View style={styles.referralStat}>
          <Text style={styles.referralStatNumber}>{userRewards?.successful_referrals || 0}</Text>
          <Text style={styles.referralStatLabel}>Referidos</Text>
        </View>
        <View style={styles.referralStat}>
          <Text style={styles.referralStatNumber}>{formatPoints(userRewards?.lifetime_earnings || 0)}</Text>
          <Text style={styles.referralStatLabel}>Puntos Ganados</Text>
        </View>
      </View>
    </View>
  );

  const renderEarnTab = () => (
    <ScrollView style={styles.tabContent}>
      {renderPointsCard()}
      {renderReferralCard()}
      
      <View style={styles.earnMethodsCard}>
        <Text style={styles.cardTitle}>Formas de Ganar Puntos</Text>
        
        <View style={styles.earnMethod}>
          <Ionicons name="person-add" size={24} color="#10B981" />
          <View style={styles.earnMethodContent}>
            <Text style={styles.earnMethodTitle}>Invitar Amigos</Text>
            <Text style={styles.earnMethodDescription}>100 puntos por referido exitoso</Text>
          </View>
          <Text style={styles.earnMethodPoints}>+100</Text>
        </View>
        
        <View style={styles.earnMethod}>
          <Ionicons name="card" size={24} color="#3B82F6" />
          <View style={styles.earnMethodContent}>
            <Text style={styles.earnMethodTitle}>Comprar Planes</Text>
            <Text style={styles.earnMethodDescription}>1 punto por cada $1 gastado</Text>
          </View>
          <Text style={styles.earnMethodPoints}>+1/$</Text>
        </View>
        
        <View style={styles.earnMethod}>
          <Ionicons name="star" size={24} color="#F59E0B" />
          <View style={styles.earnMethodContent}>
            <Text style={styles.earnMethodTitle}>Reseñas</Text>
            <Text style={styles.earnMethodDescription}>50 puntos por reseña verificada</Text>
          </View>
          <Text style={styles.earnMethodPoints}>+50</Text>
        </View>
        
        <View style={styles.earnMethod}>
          <Ionicons name="calendar" size={24} color="#8B5CF6" />
          <View style={styles.earnMethodContent}>
            <Text style={styles.earnMethodTitle}>Uso Mensual</Text>
            <Text style={styles.earnMethodDescription}>20 puntos por mes activo</Text>
          </View>
          <Text style={styles.earnMethodPoints}>+20</Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderRedeemTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Recompensas Disponibles</Text>
      
      {availableRewards.map((reward) => (
        <View key={reward.id} style={styles.rewardCard}>
          <View style={styles.rewardHeader}>
            <Text style={styles.rewardName}>{reward.name}</Text>
            <View style={styles.rewardPoints}>
              <Ionicons name="star" size={16} color="#F59E0B" />
              <Text style={styles.rewardPointsText}>{formatPoints(reward.points_required)}</Text>
            </View>
          </View>
          
          <Text style={styles.rewardDescription}>{reward.description}</Text>
          
          {reward.reward_type === 'discount' && (
            <Text style={styles.rewardValue}>{reward.value}% de descuento</Text>
          )}
          
          {reward.reward_type === 'credit' && (
            <Text style={styles.rewardValue}>${reward.value} de crédito</Text>
          )}
          
          <TouchableOpacity
            style={[
              styles.redeemButton,
              !reward.is_available && styles.redeemButtonDisabled,
              (userRewards?.total_points || 0) < reward.points_required && styles.redeemButtonDisabled,
            ]}
            onPress={() => redeemReward(reward.id)}
            disabled={!reward.is_available || (userRewards?.total_points || 0) < reward.points_required}
          >
            <Text style={styles.redeemButtonText}>
              {!reward.is_available 
                ? 'No Disponible' 
                : (userRewards?.total_points || 0) < reward.points_required 
                  ? 'Puntos Insuficientes'
                  : 'Canjear'
              }
            </Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );

  const renderHistoryTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Historial de Canjes</Text>
      
      {redeemedRewards.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="gift-outline" size={64} color="#9CA3AF" />
          <Text style={styles.emptyStateText}>No has canjeado recompensas aún</Text>
          <Text style={styles.emptyStateSubtext}>¡Empieza a ganar puntos y canjea recompensas increíbles!</Text>
        </View>
      ) : (
        redeemedRewards.map((redemption, index) => (
          <View key={index} style={styles.historyCard}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyRewardName}>{redemption.reward_name}</Text>
              <Text style={styles.historyDate}>
                {new Date(redemption.redeemed_at).toLocaleDateString()}
              </Text>
            </View>
            
            <View style={styles.historyDetails}>
              <Text style={styles.historyPoints}>-{formatPoints(redemption.points_used)} puntos</Text>
              <Text style={styles.historyStatus}>
                {redemption.status === 'completed' ? '✅ Completado' : '⏳ Pendiente'}
              </Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );

  const renderTabButton = (tab: 'earn' | 'redeem' | 'history', title: string, icon: string) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
      onPress={() => setActiveTab(tab)}
    >
      <Ionicons 
        name={icon as any} 
        size={20} 
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
        <Text>Cargando recompensas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {renderTabButton('earn', 'Ganar', 'add-circle')}
        {renderTabButton('redeem', 'Canjear', 'gift')}
        {renderTabButton('history', 'Historial', 'time')}
      </View>
      
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === 'earn' && renderEarnTab()}
        {activeTab === 'redeem' && renderRedeemTab()}
        {activeTab === 'history' && renderHistoryTab()}
      </ScrollView>
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
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  tabButtonActive: {
    backgroundColor: '#EEF2FF',
  },
  tabButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
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
  pointsCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
  },
  pointsHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  pointsTitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  pointsAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  tierSection: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 16,
  },
  tierInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tierIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  tierText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  nextTierText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 3,
  },
  referralCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  referralHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  referralTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    color: '#1F2937',
  },
  referralDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  referralCodeContainer: {
    marginBottom: 16,
  },
  referralCodeLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  referralCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
  },
  referralCode: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  copyButton: {
    padding: 4,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#667eea',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  shareButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  referralStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  referralStat: {
    alignItems: 'center',
  },
  referralStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  referralStatLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  earnMethodsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  earnMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  earnMethodContent: {
    flex: 1,
    marginLeft: 12,
  },
  earnMethodTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  earnMethodDescription: {
    fontSize: 12,
    color: '#6B7280',
  },
  earnMethodPoints: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  rewardCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  rewardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rewardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  rewardPoints: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardPointsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
    marginLeft: 4,
  },
  rewardDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  rewardValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 12,
  },
  redeemButton: {
    backgroundColor: '#667eea',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  redeemButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  redeemButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
  },
  historyCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyRewardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  historyDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  historyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyPoints: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
  historyStatus: {
    fontSize: 12,
    color: '#10B981',
  },
});

export default RewardsScreen;
