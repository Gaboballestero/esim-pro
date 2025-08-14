import { API_BASE_URL } from '../constants';

interface PlanCategory {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  display_order: number;
  is_active: boolean;
}

interface FlexiblePlan {
  id: number;
  name: string;
  description: string;
  category: number;
  data_amount_gb?: number;
  is_unlimited: boolean;
  duration_value: number;
  duration_unit: string;
  plan_type: string;
  base_price: number;
  currency: string;
  features: string[];
  network_types: string[];
  speed_limit_mbps?: number;
  max_devices: number;
  allows_hotspot: boolean;
  allows_voip: boolean;
  max_family_members: number;
  family_discount_percentage: number;
  is_topup_available: boolean;
  topup_increment_gb: number;
  topup_price_per_gb?: number;
  is_active: boolean;
  is_featured: boolean;
  is_popular: boolean;
  // Computed fields
  duration_display?: string;
  data_display?: string;
  price_for_country?: number;
}

interface CustomPlan {
  id: number;
  name: string;
  selected_countries: number[];
  data_amount_gb: number;
  duration_days: number;
  includes_5g: boolean;
  includes_hotspot: boolean;
  includes_voip: boolean;
  max_devices: number;
  calculated_price: number;
  currency: string;
  is_active: boolean;
  created_at: string;
}

interface PlanRecommendation {
  id: number;
  plan: FlexiblePlan;
  recommended_for_country?: number;
  recommendation_reason: string;
  confidence_score: number;
  predicted_satisfaction: number;
}

class FlexiblePlansService {
  private static instance: FlexiblePlansService;
  private baseURL = `${API_BASE_URL}/plans`; // TODO: Crear estas URLs cuando implementemos el backend

  public static getInstance(): FlexiblePlansService {
    if (!FlexiblePlansService.instance) {
      FlexiblePlansService.instance = new FlexiblePlansService();
    }
    return FlexiblePlansService.instance;
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
      console.error('FlexiblePlansService error:', error);
      throw error;
    }
  }

  // Categorías de planes
  async getCategories(): Promise<PlanCategory[]> {
    return this.makeRequest('/categories/');
  }

  // Planes flexibles
  async getPlans(filters?: {
    category?: number;
    plan_type?: string;
    country?: string;
    featured?: boolean;
    popular?: boolean;
    price_min?: number;
    price_max?: number;
    data_min?: number;
    data_max?: number;
    duration_min?: number;
    duration_max?: number;
  }): Promise<FlexiblePlan[]> {
    let url = '/flexible-plans/';
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await this.makeRequest(url);
    return response.results || response;
  }

  async getPlanById(planId: number): Promise<FlexiblePlan> {
    return this.makeRequest(`/flexible-plans/${planId}/`);
  }

  async getFeaturedPlans(): Promise<FlexiblePlan[]> {
    return this.getPlans({ featured: true });
  }

  async getPopularPlans(): Promise<FlexiblePlan[]> {
    return this.getPlans({ popular: true });
  }

  async getPlansByCategory(categoryId: number): Promise<FlexiblePlan[]> {
    return this.getPlans({ category: categoryId });
  }

  async searchPlans(query: string, filters?: any): Promise<FlexiblePlan[]> {
    return this.makeRequest('/search-plans/', {
      method: 'POST',
      body: JSON.stringify({ query, ...filters }),
    });
  }

  // Planes personalizados
  async getCustomPlans(): Promise<CustomPlan[]> {
    const response = await this.makeRequest('/custom-plans/');
    return response.results || response;
  }

  async createCustomPlan(planData: Partial<CustomPlan>): Promise<CustomPlan> {
    return this.makeRequest('/custom-plans/', {
      method: 'POST',
      body: JSON.stringify(planData),
    });
  }

  async updateCustomPlan(planId: number, planData: Partial<CustomPlan>): Promise<CustomPlan> {
    return this.makeRequest(`/custom-plans/${planId}/`, {
      method: 'PATCH',
      body: JSON.stringify(planData),
    });
  }

  async deleteCustomPlan(planId: number): Promise<void> {
    await this.makeRequest(`/custom-plans/${planId}/`, {
      method: 'DELETE',
    });
  }

  // Recomendaciones
  async getRecommendations(countryCode?: string): Promise<PlanRecommendation[]> {
    let url = '/recommendations/';
    if (countryCode) {
      url += `?country=${countryCode}`;
    }
    
    const response = await this.makeRequest(url);
    return response.results || response;
  }

  // Comparación de planes
  async comparePlans(planIds: number[]): Promise<{
    plans: FlexiblePlan[];
    comparison_matrix: any;
  }> {
    return this.makeRequest('/compare-plans/', {
      method: 'POST',
      body: JSON.stringify({ plan_ids: planIds }),
    });
  }

  // Utilidades para calcular precios y características
  calculatePlanValue(plan: FlexiblePlan): {
    pricePerGB: number;
    pricePerDay: number;
    valueScore: number;
  } {
    const durationInDays = this.convertTodays(plan.duration_value, plan.duration_unit);
    const dataInGB = plan.is_unlimited ? 50 : (plan.data_amount_gb || 1); // Asumimos 50GB para ilimitado

    return {
      pricePerGB: plan.base_price / dataInGB,
      pricePerDay: plan.base_price / durationInDays,
      valueScore: (dataInGB * durationInDays) / plan.base_price, // Más alto = mejor valor
    };
  }

  private convertTodays(value: number, unit: string): number {
    switch (unit) {
      case 'hours':
        return value / 24;
      case 'days':
        return value;
      case 'weeks':
        return value * 7;
      case 'months':
        return value * 30;
      default:
        return value;
    }
  }

  formatDuration(value: number, unit: string): string {
    if (value === 1) {
      const singularMap: { [key: string]: string } = {
        hours: 'hora',
        days: 'día',
        weeks: 'semana',
        months: 'mes',
      };
      return `${value} ${singularMap[unit] || unit}`;
    } else {
      const pluralMap: { [key: string]: string } = {
        hours: 'horas',
        days: 'días',
        weeks: 'semanas',
        months: 'meses',
      };
      return `${value} ${pluralMap[unit] || unit}`;
    }
  }

  formatData(amountGB?: number, isUnlimited = false): string {
    if (isUnlimited) {
      return 'Ilimitado';
    }
    if (!amountGB) {
      return 'Personalizado';
    }
    if (amountGB < 1) {
      return `${Math.round(amountGB * 1000)} MB`;
    }
    return `${amountGB} GB`;
  }

  formatPrice(price: number, currency = 'USD'): string {
    const symbols: { [key: string]: string } = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      MXN: '$',
      CAD: 'C$',
    };
    
    const symbol = symbols[currency] || currency;
    return `${symbol}${price.toFixed(2)}`;
  }

  getPlanTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      hourly: '⏰',
      daily: '📅',
      weekly: '📊',
      monthly: '🗓️',
      topup: '➕',
      family: '👨‍👩‍👧‍👦',
      corporate: '🏢',
    };
    return icons[type] || '📱';
  }

  getPlanTypeColor(type: string): string {
    const colors: { [key: string]: string } = {
      hourly: '#F59E0B',   // Amarillo
      daily: '#3B82F6',    // Azul
      weekly: '#10B981',   // Verde
      monthly: '#8B5CF6',  // Púrpura
      topup: '#F97316',    // Naranja
      family: '#EC4899',   // Rosa
      corporate: '#6B7280', // Gris
    };
    return colors[type] || '#6B7280';
  }

  getFeatureIcon(feature: string): string {
    const icons: { [key: string]: string } = {
      '4G': '📶',
      '5G': '🚀',
      'Hotspot': '📡',
      'VoIP': '☎️',
      'Premium Support': '🎧',
      'Family Dashboard': '👨‍👩‍👧‍👦',
      'Priority Network': '⭐',
      'No Throttling': '🚫',
    };
    return icons[feature] || '✅';
  }
}

export default FlexiblePlansService;
