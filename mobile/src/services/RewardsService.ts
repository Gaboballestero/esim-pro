import { API_BASE_URL } from '../constants';

interface ReferralCode {
  code: string;
  created_at: string;
  is_active: boolean;
}

interface Referral {
  referrer_name: string;
  referred_name: string;
  reward_given: boolean;
  reward_amount: number;
  created_at: string;
}

interface LoyaltyPoints {
  total_points: number;
  available_points: number;
  lifetime_points: number;
  tier: string;
  tier_display: string;
}

interface PointsTransaction {
  points: number;
  transaction_type: string;
  transaction_type_display: string;
  reason: string;
  created_at: string;
}

interface Reward {
  id: number;
  name: string;
  description: string;
  points_required: number;
  discount_percentage?: number;
  discount_amount?: number;
  reward_type: string;
  reward_type_display: string;
  can_redeem: boolean;
}

interface RewardRedemption {
  id: number;
  reward_name: string;
  points_spent: number;
  used: boolean;
  redeemed_at: string;
  used_at?: string;
}

class RewardsService {
  private static instance: RewardsService;
  private baseURL = `${API_BASE_URL}/rewards`;

  public static getInstance(): RewardsService {
    if (!RewardsService.instance) {
      RewardsService.instance = new RewardsService();
    }
    return RewardsService.instance;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          // TODO: Agregar token de autenticación cuando esté disponible
          // 'Authorization': `Bearer ${await AuthService.getToken()}`,
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('RewardsService error:', error);
      throw error;
    }
  }

  // Código de referido
  async getReferralCode(): Promise<ReferralCode> {
    return this.makeRequest('/referral-code/');
  }

  async getMyReferrals(): Promise<Referral[]> {
    const response = await this.makeRequest('/my-referrals/');
    return response.results || response;
  }

  async referFriend(email: string, message?: string): Promise<{ message: string }> {
    return this.makeRequest('/refer-friend/', {
      method: 'POST',
      body: JSON.stringify({ email, message }),
    });
  }

  async validateReferralCode(code: string): Promise<{
    valid: boolean;
    referrer?: string;
    reward_amount?: number;
    error?: string;
  }> {
    return this.makeRequest('/validate-referral/', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  // Puntos de fidelidad
  async getLoyaltyPoints(): Promise<LoyaltyPoints> {
    return this.makeRequest('/loyalty-points/');
  }

  async getPointsHistory(): Promise<PointsTransaction[]> {
    const response = await this.makeRequest('/points-history/');
    return response.results || response;
  }

  // Recompensas
  async getAvailableRewards(): Promise<Reward[]> {
    const response = await this.makeRequest('/rewards/');
    return response.results || response;
  }

  async getMyRedemptions(): Promise<RewardRedemption[]> {
    const response = await this.makeRequest('/my-redemptions/');
    return response.results || response;
  }

  async redeemReward(rewardId: number): Promise<{
    message: string;
    redemption_id: number;
  }> {
    return this.makeRequest(`/redeem/${rewardId}/`, {
      method: 'POST',
    });
  }

  // Utilidades
  getTierColor(tier: string): string {
    const colors = {
      bronze: '#CD7F32',
      silver: '#C0C0C0',
      gold: '#FFD700',
      platinum: '#E5E4E2',
    };
    return colors[tier.toLowerCase() as keyof typeof colors] || colors.bronze;
  }

  getTierIcon(tier: string): string {
    const icons = {
      bronze: '🥉',
      silver: '🥈',
      gold: '🥇',
      platinum: '💎',
    };
    return icons[tier.toLowerCase() as keyof typeof icons] || icons.bronze;
  }

  getPointsForNextTier(currentPoints: number, tier: string): { pointsNeeded: number; nextTier: string } {
    const tiers = {
      bronze: { min: 0, next: 'silver', nextMin: 1000 },
      silver: { min: 1000, next: 'gold', nextMin: 5000 },
      gold: { min: 5000, next: 'platinum', nextMin: 10000 },
      platinum: { min: 10000, next: 'platinum', nextMin: 10000 },
    };

    const currentTier = tiers[tier.toLowerCase() as keyof typeof tiers] || tiers.bronze;
    const pointsNeeded = Math.max(0, currentTier.nextMin - currentPoints);

    return {
      pointsNeeded,
      nextTier: currentTier.next,
    };
  }
}

export default RewardsService;
