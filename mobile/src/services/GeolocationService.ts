import * as Location from 'expo-location';
import { API_BASE_URL } from '../constants';

interface Country {
  id: number;
  name: string;
  code: string;
  code_3: string;
  continent: string;
  region: string;
  currency: string;
  language: string;
  timezone: string;
  calling_code: string;
  latitude: number;
  longitude: number;
  esim_supported: boolean;
  coverage_quality: string;
  flag_emoji: string;
  is_popular: boolean;
  operators_count: number;
}

interface LocationHistory {
  id: number;
  country_name: string;
  country_flag: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  detected_at: string;
  detection_method: string;
  accuracy?: number;
  is_roaming: boolean;
}

interface TravelPattern {
  id: number;
  frequent_countries_data: Country[];
  preferred_regions: string[];
  average_trip_duration: number;
  typical_data_usage: string;
  prefers_unlimited: boolean;
  budget_range: string;
}

interface GeofenceAlert {
  id: number;
  country_name: string;
  country_flag: string;
  alert_type: string;
  title: string;
  message: string;
  action_button?: string;
  action_url?: string;
  is_active: boolean;
  triggered_at?: string;
  acknowledged: boolean;
  created_at: string;
}

interface TravelStats {
  countries_visited: number;
  total_trips: number;
  favorite_destinations: Array<{
    country__name: string;
    country__flag_emoji: string;
    visits: number;
  }>;
}

class GeolocationService {
  private static instance: GeolocationService;
  private baseURL = `${API_BASE_URL}/geo`;

  public static getInstance(): GeolocationService {
    if (!GeolocationService.instance) {
      GeolocationService.instance = new GeolocationService();
    }
    return GeolocationService.instance;
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
      console.error('GeolocationService error:', error);
      throw error;
    }
  }

  // Países
  async getCountries(filters?: {
    continent?: string;
    popular?: boolean;
  }): Promise<Country[]> {
    let url = '/countries/';
    const params = new URLSearchParams();
    
    if (filters?.continent) {
      params.append('continent', filters.continent);
    }
    if (filters?.popular) {
      params.append('popular', 'true');
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await this.makeRequest(url);
    return response.results || response;
  }

  async getCountryByCode(countryCode: string): Promise<Country> {
    return this.makeRequest(`/countries/${countryCode}/`);
  }

  async searchCountries(query: string, filters?: {
    continent?: string;
    esim_only?: boolean;
  }): Promise<Country[]> {
    return this.makeRequest('/search-countries/', {
      method: 'POST',
      body: JSON.stringify({
        query,
        continent: filters?.continent,
        esim_only: filters?.esim_only ?? true,
      }),
    });
  }

  // Detección de ubicación
  async getCurrentLocation(): Promise<Location.LocationObject | null> {
    try {
      // Verificar permisos
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Permission to access location was denied');
        return null;
      }

      // Obtener ubicación actual
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5000,
        distanceInterval: 10,
      });

      return location;
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }

  async detectLocationByGPS(): Promise<{
    country: Country;
    is_roaming: boolean;
    recommended_plans: any[];
  } | null> {
    try {
      const location = await this.getCurrentLocation();
      if (!location) return null;

      return this.makeRequest('/detect-location/', {
        method: 'POST',
        body: JSON.stringify({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy,
          method: 'gps',
        }),
      });
    } catch (error) {
      console.error('Error detecting location by GPS:', error);
      return null;
    }
  }

  async detectLocationByIP(): Promise<{
    country: Country;
    is_roaming: boolean;
    recommended_plans: any[];
  } | null> {
    try {
      return this.makeRequest('/detect-location/', {
        method: 'POST',
        body: JSON.stringify({
          method: 'ip',
        }),
      });
    } catch (error) {
      console.error('Error detecting location by IP:', error);
      return null;
    }
  }

  // Historial y patrones
  async getLocationHistory(): Promise<LocationHistory[]> {
    const response = await this.makeRequest('/location-history/');
    return response.results || response;
  }

  async getTravelPattern(): Promise<TravelPattern> {
    return this.makeRequest('/travel-pattern/');
  }

  async updateTravelPattern(pattern: Partial<TravelPattern>): Promise<TravelPattern> {
    return this.makeRequest('/travel-pattern/', {
      method: 'PATCH',
      body: JSON.stringify(pattern),
    });
  }

  async getTravelStats(): Promise<TravelStats> {
    return this.makeRequest('/travel-stats/');
  }

  // Alertas
  async getGeofenceAlerts(): Promise<GeofenceAlert[]> {
    const response = await this.makeRequest('/alerts/');
    return response.results || response;
  }

  async acknowledgeAlert(alertId: number): Promise<{ message: string }> {
    return this.makeRequest(`/alerts/${alertId}/acknowledge/`, {
      method: 'POST',
    });
  }

  // Utilidades
  getDistanceFromLatLon(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distancia en km
    return d;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  formatDistance(km: number): string {
    if (km < 1) {
      return `${Math.round(km * 1000)}m`;
    } else if (km < 100) {
      return `${km.toFixed(1)}km`;
    } else {
      return `${Math.round(km)}km`;
    }
  }

  getCoverageQualityColor(quality: string): string {
    const colors = {
      excellent: '#10B981', // Verde
      good: '#F59E0B',      // Amarillo
      fair: '#F97316',      // Naranja
      limited: '#EF4444',   // Rojo
    };
    return colors[quality as keyof typeof colors] || colors.fair;
  }

  getCoverageQualityIcon(quality: string): string {
    const icons = {
      excellent: '🟢',
      good: '🟡',
      fair: '🟠',
      limited: '🔴',
    };
    return icons[quality as keyof typeof icons] || icons.fair;
  }
}

export default GeolocationService;
