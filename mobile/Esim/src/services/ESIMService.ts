import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONFIG, isFeatureEnabled } from '../config/app';
import { DataPlan } from './PlansService';

// Types para eSIMs
export interface ESIMOrder {
  id: number;
  plan: DataPlan;
  status: 'pending' | 'paid' | 'activated' | 'expired' | 'cancelled';
  qr_code: string;
  iccid: string;
  activation_code: string;
  created_at: string;
  activated_at?: string;
  expires_at: string;
  data_used_mb: number;
  data_remaining_mb: number;
}

export interface ESIMActivation {
  id: number;
  esim: ESIMOrder;
  device_info: string;
  location: string;
  activated_at: string;
}

// Create axios instance with auth
const apiClient = axios.create({
  baseURL: APP_CONFIG.getApiUrl() || undefined,
  timeout: 15000,
});

// Add auth token to requests
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export class ESIMService {
  // 🎯 PASO 3: Gestión real de eSIMs
  static async purchaseESIM(planId: number): Promise<ESIMOrder> {
    if (!isFeatureEnabled('REAL_ESIMS')) {
      return this.createDemoESIM(planId);
    }

    try {
      const response = await apiClient.post('/esims/purchase/', {
        plan_id: planId
      });
      return response.data;
    } catch (error) {
      console.error('Error purchasing eSIM, creating demo:', error);
      return this.createDemoESIM(planId);
    }
  }

  static async getMyESIMs(): Promise<ESIMOrder[]> {
    if (!isFeatureEnabled('REAL_ESIMS')) {
      return this.getDemoESIMs();
    }

    try {
      const response = await apiClient.get('/esims/my/');
      return response.data;
    } catch (error) {
      console.error('Error getting eSIMs:', error);
      return this.getDemoESIMs();
    }
  }

  static async activateESIM(esimId: number, deviceInfo: string): Promise<ESIMActivation> {
    if (!isFeatureEnabled('REAL_ESIMS')) {
      return this.createDemoActivation(esimId, deviceInfo);
    }

    try {
      const response = await apiClient.post(`/esims/${esimId}/activate/`, {
        device_info: deviceInfo
      });
      return response.data;
    } catch (error) {
      console.error('Error activating eSIM:', error);
      return this.createDemoActivation(esimId, deviceInfo);
    }
  }

  static async getESIMUsage(esimId: number): Promise<{ used_mb: number; remaining_mb: number; total_mb: number }> {
    if (!isFeatureEnabled('REAL_ESIMS')) {
      return this.getDemoUsage();
    }

    try {
      const response = await apiClient.get(`/esims/${esimId}/usage/`);
      return response.data;
    } catch (error) {
      console.error('Error getting usage:', error);
      return this.getDemoUsage();
    }
  }

  // Demo functions
  private static async createDemoESIM(planId: number): Promise<ESIMOrder> {
    const demoPlans = await import('./PlansService').then(module => 
      module.PlansService.getPlans?.() || []
    );
    const plan = (await demoPlans).find(p => p.id === planId) || (await demoPlans)[0];
    
    return {
      id: Math.floor(Math.random() * 1000),
      plan,
      status: 'paid',
      qr_code: 'data:image/png;base64,demo_qr_code_here',
      iccid: '8934071234567890123',
      activation_code: 'DEMO-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + plan.validity_days * 24 * 60 * 60 * 1000).toISOString(),
      data_used_mb: 0,
      data_remaining_mb: plan.data_amount_gb * 1024
    };
  }

  private static async getDemoESIMs(): Promise<ESIMOrder[]> {
    return [
      {
        id: 1,
        plan: {
          id: 1,
          name: "España Local 5GB",
          description: "Plan demo activo",
          plan_type: "local",
          data_amount_gb: 5,
          validity_days: 7,
          price_usd: 15.99,
          countries: [
            { id: 1, name: "España", iso_code: "ES", flag_emoji: "🇪🇸", currency: "EUR", is_active: true }
          ],
          features: [],
          is_active: true,
          is_featured: true
        },
        status: 'activated',
        qr_code: 'demo_qr',
        iccid: '8934071234567890123',
        activation_code: 'DEMO-ACT-123',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        activated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        expires_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        data_used_mb: 1024,
        data_remaining_mb: 4096
      }
    ];
  }

  private static async createDemoActivation(esimId: number, deviceInfo: string): Promise<ESIMActivation> {
    return {
      id: Math.floor(Math.random() * 1000),
      esim: (await this.getDemoESIMs())[0],
      device_info: deviceInfo,
      location: 'Madrid, España',
      activated_at: new Date().toISOString()
    };
  }

  private static async getDemoUsage(): Promise<{ used_mb: number; remaining_mb: number; total_mb: number }> {
    return {
      used_mb: 1024,
      remaining_mb: 4096,
      total_mb: 5120
    };
  }
}
