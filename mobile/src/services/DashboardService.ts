import { API_BASE_URL } from '../constants';

interface UsageStatistics {
  total_data_used_gb: number;
  total_data_purchased_gb: number;
  usage_percentage: number;
  current_period_usage: number;
  previous_period_usage: number;
  usage_trend: 'increasing' | 'decreasing' | 'stable';
  peak_usage_hour: number;
  peak_usage_day: string;
  average_daily_usage: number;
  countries_visited: number;
  active_plans: number;
  total_spent: number;
  currency: string;
}

interface ActivityEvent {
  id: number;
  event_type: 'plan_activated' | 'data_used' | 'country_visited' | 'payment_made' | 'reward_earned' | 'location_changed';
  title: string;
  description: string;
  timestamp: string;
  metadata: any;
  icon: string;
  color: string;
}

interface Insight {
  id: number;
  type: 'cost_saving' | 'usage_pattern' | 'plan_recommendation' | 'travel_tip' | 'feature_suggestion';
  title: string;
  message: string;
  action_text?: string;
  action_url?: string;
  priority: 'low' | 'medium' | 'high';
  is_actionable: boolean;
  created_at: string;
  expires_at?: string;
}

interface PredictiveAnalytics {
  next_month_usage_prediction: number;
  confidence_level: number;
  cost_prediction: number;
  recommended_plan_changes: Array<{
    current_plan: string;
    recommended_plan: string;
    potential_savings: number;
    reason: string;
  }>;
  travel_predictions: Array<{
    country: string;
    probability: number;
    recommended_plan: string;
  }>;
}

interface PersonalizationSettings {
  preferred_currency: string;
  preferred_language: string;
  notification_preferences: {
    usage_alerts: boolean;
    cost_alerts: boolean;
    recommendation_alerts: boolean;
    travel_tips: boolean;
    promotional_offers: boolean;
  };
  dashboard_layout: {
    widgets: Array<{
      id: string;
      position: number;
      size: 'small' | 'medium' | 'large';
      is_visible: boolean;
    }>;
  };
  privacy_settings: {
    share_usage_analytics: boolean;
    share_location_data: boolean;
    personalized_recommendations: boolean;
  };
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  action: string;
  is_enabled: boolean;
  requires_confirmation: boolean;
}

class DashboardService {
  private static instance: DashboardService;
  private baseURL = `${API_BASE_URL}/dashboard`;

  public static getInstance(): DashboardService {
    if (!DashboardService.instance) {
      DashboardService.instance = new DashboardService();
    }
    return DashboardService.instance;
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
      console.error('DashboardService error:', error);
      throw error;
    }
  }

  // Estadísticas de uso
  async getUsageStatistics(period: 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<UsageStatistics> {
    return this.makeRequest(`/usage-stats/?period=${period}`);
  }

  async getUsageHistory(days: number = 30): Promise<Array<{
    date: string;
    data_used_mb: number;
    cost: number;
    countries: string[];
  }>> {
    return this.makeRequest(`/usage-history/?days=${days}`);
  }

  async getUsageByCountry(): Promise<Array<{
    country_code: string;
    country_name: string;
    data_used_gb: number;
    cost: number;
    days_active: number;
    last_used: string;
  }>> {
    return this.makeRequest('/usage-by-country/');
  }

  // Actividad reciente
  async getRecentActivity(limit: number = 20): Promise<ActivityEvent[]> {
    return this.makeRequest(`/activity/?limit=${limit}`);
  }

  async getActivityByType(eventType: string, limit: number = 10): Promise<ActivityEvent[]> {
    return this.makeRequest(`/activity/?type=${eventType}&limit=${limit}`);
  }

  // Insights y análisis inteligente
  async getInsights(): Promise<Insight[]> {
    return this.makeRequest('/insights/');
  }

  async markInsightAsRead(insightId: number): Promise<void> {
    await this.makeRequest(`/insights/${insightId}/mark-read/`, {
      method: 'POST',
    });
  }

  async dismissInsight(insightId: number): Promise<void> {
    await this.makeRequest(`/insights/${insightId}/dismiss/`, {
      method: 'POST',
    });
  }

  // Análisis predictivo
  async getPredictiveAnalytics(): Promise<PredictiveAnalytics> {
    return this.makeRequest('/predictive-analytics/');
  }

  async getSpendingForecast(months: number = 3): Promise<Array<{
    month: string;
    predicted_spending: number;
    confidence: number;
    factors: string[];
  }>> {
    return this.makeRequest(`/spending-forecast/?months=${months}`);
  }

  // Personalización
  async getPersonalizationSettings(): Promise<PersonalizationSettings> {
    return this.makeRequest('/personalization/');
  }

  async updatePersonalizationSettings(settings: Partial<PersonalizationSettings>): Promise<PersonalizationSettings> {
    return this.makeRequest('/personalization/', {
      method: 'PATCH',
      body: JSON.stringify(settings),
    });
  }

  async updateDashboardLayout(layout: PersonalizationSettings['dashboard_layout']): Promise<void> {
    await this.makeRequest('/personalization/layout/', {
      method: 'PATCH',
      body: JSON.stringify(layout),
    });
  }

  // Acciones rápidas
  async getQuickActions(): Promise<QuickAction[]> {
    return this.makeRequest('/quick-actions/');
  }

  async executeQuickAction(actionId: string, parameters?: any): Promise<{
    success: boolean;
    message: string;
    result?: any;
  }> {
    return this.makeRequest(`/quick-actions/${actionId}/execute/`, {
      method: 'POST',
      body: JSON.stringify(parameters || {}),
    });
  }

  // Exportación de datos
  async exportUsageData(format: 'csv' | 'pdf' | 'json' = 'csv', period: string = 'month'): Promise<{
    download_url: string;
    expires_at: string;
  }> {
    return this.makeRequest(`/export/?format=${format}&period=${period}`, {
      method: 'POST',
    });
  }

  // Comparativas y benchmarks
  async getUsageBenchmark(): Promise<{
    your_usage: number;
    average_usage: number;
    percentile: number;
    comparison: 'below_average' | 'average' | 'above_average';
    similar_users_count: number;
  }> {
    return this.makeRequest('/benchmark/');
  }

  async getCostOptimizationSuggestions(): Promise<Array<{
    suggestion: string;
    potential_savings: number;
    effort_level: 'low' | 'medium' | 'high';
    impact: 'low' | 'medium' | 'high';
    category: 'plan_change' | 'usage_optimization' | 'feature_usage';
  }>> {
    return this.makeRequest('/cost-optimization/');
  }

  // Utilidades de formateo
  formatUsageTrend(trend: string): { icon: string; color: string; text: string } {
    const trends = {
      increasing: { icon: '📈', color: '#EF4444', text: 'Aumentando' },
      decreasing: { icon: '📉', color: '#10B981', text: 'Disminuyendo' },
      stable: { icon: '➡️', color: '#6B7280', text: 'Estable' },
    };
    return trends[trend as keyof typeof trends] || trends.stable;
  }

  formatActivityIcon(eventType: string): string {
    const icons = {
      plan_activated: '🚀',
      data_used: '📊',
      country_visited: '🌍',
      payment_made: '💳',
      reward_earned: '🎁',
      location_changed: '📍',
    };
    return icons[eventType as keyof typeof icons] || '📱';
  }

  formatInsightPriority(priority: string): { color: string; urgency: string } {
    const priorities = {
      low: { color: '#10B981', urgency: 'Información' },
      medium: { color: '#F59E0B', urgency: 'Recomendación' },
      high: { color: '#EF4444', urgency: 'Importante' },
    };
    return priorities[priority as keyof typeof priorities] || priorities.low;
  }

  formatCurrency(amount: number, currency: string = 'USD'): string {
    const symbols: { [key: string]: string } = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      MXN: '$',
      CAD: 'C$',
    };
    
    const symbol = symbols[currency] || currency;
    return `${symbol}${amount.toFixed(2)}`;
  }

  formatDataUsage(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  getUsageHealthColor(percentage: number): string {
    if (percentage < 60) return '#10B981'; // Verde
    if (percentage < 80) return '#F59E0B'; // Amarillo
    return '#EF4444'; // Rojo
  }

  getInsightActionableIcon(isActionable: boolean): string {
    return isActionable ? '🔧' : 'ℹ️';
  }

  calculateSavingsPercentage(current: number, potential: number): number {
    if (current === 0) return 0;
    return Math.round(((current - potential) / current) * 100);
  }
}

export default DashboardService;
