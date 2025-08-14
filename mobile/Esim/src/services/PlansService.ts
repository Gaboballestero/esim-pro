import axios from 'axios';
import { APP_CONFIG, isFeatureEnabled } from '../config/app';

// Types para Planes
export interface Country {
  id: number;
  name: string;
  iso_code: string;
  flag_emoji: string;
  currency: string;
  is_active: boolean;
}

export interface DataPlan {
  id: number;
  name: string;
  description: string;
  plan_type: 'local' | 'regional' | 'global';
  data_amount_gb: number;
  validity_days: number;
  price_usd: number;
  countries: Country[];
  features: PlanFeature[];
  is_active: boolean;
  is_featured: boolean;
}

export interface PlanFeature {
  id: number;
  name: string;
  description: string;
  is_included: boolean;
}

// Create axios instance
const apiClient = axios.create({
  baseURL: APP_CONFIG.getApiUrl() || undefined,
  timeout: 10000,
});

export class PlansService {
  // 🎯 PASO 2: Obtener planes reales o demo
  static async getPlans(): Promise<DataPlan[]> {
    if (!isFeatureEnabled('REAL_PLANS')) {
      return this.getDemoPlans();
    }

    try {
      const response = await apiClient.get('/plans/');
      return response.data;
    } catch (error) {
      console.error('Error getting real plans, falling back to demo:', error);
      return this.getDemoPlans();
    }
  }

  static async getPlansByCountry(countryCode: string): Promise<DataPlan[]> {
    if (!isFeatureEnabled('REAL_PLANS')) {
      return this.getDemoPlans().then(plans => 
        plans.filter(plan => 
          plan.countries.some(country => country.iso_code === countryCode)
        )
      );
    }

    try {
      const response = await apiClient.get(`/plans/?country=${countryCode}`);
      return response.data;
    } catch (error) {
      console.error('Error getting plans by country:', error);
      return this.getDemoPlans();
    }
  }

  static async getCountries(): Promise<Country[]> {
    if (!isFeatureEnabled('REAL_PLANS')) {
      return this.getDemoCountries();
    }

    try {
      const response = await apiClient.get('/countries/');
      return response.data;
    } catch (error) {
      console.error('Error getting countries:', error);
      return this.getDemoCountries();
    }
  }

  // Demo data
  private static async getDemoPlans(): Promise<DataPlan[]> {
    return [
      {
        id: 1,
        name: "España Local 5GB",
        description: "Plan perfecto para turistas en España",
        plan_type: "local",
        data_amount_gb: 5,
        validity_days: 7,
        price_usd: 15.99,
        countries: [
          { id: 1, name: "España", iso_code: "ES", flag_emoji: "🇪🇸", currency: "EUR", is_active: true }
        ],
        features: [
          { id: 1, name: "5G incluido", description: "Red 5G de alta velocidad", is_included: true },
          { id: 2, name: "Hotspot", description: "Compartir datos", is_included: true },
          { id: 3, name: "Llamadas", description: "Llamadas locales", is_included: false }
        ],
        is_active: true,
        is_featured: true
      },
      {
        id: 2,
        name: "Europa Regional 10GB",
        description: "Perfecto para viajes por Europa",
        plan_type: "regional",
        data_amount_gb: 10,
        validity_days: 15,
        price_usd: 29.99,
        countries: [
          { id: 1, name: "España", iso_code: "ES", flag_emoji: "🇪🇸", currency: "EUR", is_active: true },
          { id: 2, name: "Francia", iso_code: "FR", flag_emoji: "🇫🇷", currency: "EUR", is_active: true },
          { id: 3, name: "Italia", iso_code: "IT", flag_emoji: "🇮🇹", currency: "EUR", is_active: true }
        ],
        features: [
          { id: 4, name: "Roaming incluido", description: "En 30+ países", is_included: true },
          { id: 5, name: "5G/4G", description: "Alta velocidad", is_included: true }
        ],
        is_active: true,
        is_featured: true
      },
      {
        id: 3,
        name: "Global Premium 20GB",
        description: "Para viajeros frecuentes",
        plan_type: "global",
        data_amount_gb: 20,
        validity_days: 30,
        price_usd: 49.99,
        countries: [
          { id: 1, name: "España", iso_code: "ES", flag_emoji: "🇪🇸", currency: "EUR", is_active: true },
          { id: 4, name: "Estados Unidos", iso_code: "US", flag_emoji: "🇺🇸", currency: "USD", is_active: true },
          { id: 5, name: "Japón", iso_code: "JP", flag_emoji: "🇯🇵", currency: "JPY", is_active: true }
        ],
        features: [
          { id: 6, name: "Cobertura mundial", description: "100+ países", is_included: true },
          { id: 7, name: "Soporte 24/7", description: "Atención al cliente", is_included: true }
        ],
        is_active: true,
        is_featured: false
      }
    ];
  }

  private static async getDemoCountries(): Promise<Country[]> {
    return [
      { id: 1, name: "España", iso_code: "ES", flag_emoji: "🇪🇸", currency: "EUR", is_active: true },
      { id: 2, name: "Francia", iso_code: "FR", flag_emoji: "🇫🇷", currency: "EUR", is_active: true },
      { id: 3, name: "Italia", iso_code: "IT", flag_emoji: "🇮🇹", currency: "EUR", is_active: true },
      { id: 4, name: "Estados Unidos", iso_code: "US", flag_emoji: "🇺🇸", currency: "USD", is_active: true },
      { id: 5, name: "Japón", iso_code: "JP", flag_emoji: "🇯🇵", currency: "JPY", is_active: true }
    ];
  }
}
