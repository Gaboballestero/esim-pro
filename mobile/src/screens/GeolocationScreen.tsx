import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
  Modal,
  FlatList,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import GeolocationService from '../services/GeolocationService';

const { width } = Dimensions.get('window');

interface Country {
  id: number;
  name: string;
  code: string;
  flag_emoji: string;
  region: string;
  currency: string;
  timezone: string;
  calling_code: string;
  is_esim_supported: boolean;
  data_plans_available: number;
  avg_plan_price: number;
}

interface LocationData {
  latitude: number;
  longitude: number;
  country_code: string;
  country_name: string;
  city?: string;
  accuracy: number;
  timestamp: string;
}

interface TravelStats {
  countries_visited: number;
  total_distance_km: number;
  favorite_destination: string;
  last_location_update: string;
  time_zones_crossed: number;
}

const GeolocationScreen: React.FC = () => {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);
  const [travelStats, setTravelStats] = useState<TravelStats | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);

  const geolocationService = GeolocationService.getInstance();

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    filterCountries();
  }, [searchQuery, countries]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      
      // Verificar permisos de ubicación
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
      
      // Cargar países disponibles (simulamos datos por ahora)
      const mockCountries = [
        {
          id: 1, name: 'Estados Unidos', code: 'US', flag_emoji: '🇺🇸',
          region: 'North America', currency: 'USD', timezone: 'UTC-5',
          calling_code: '+1', is_esim_supported: true, data_plans_available: 15,
          avg_plan_price: 25.99
        },
        {
          id: 2, name: 'México', code: 'MX', flag_emoji: '🇲🇽',
          region: 'North America', currency: 'MXN', timezone: 'UTC-6',
          calling_code: '+52', is_esim_supported: true, data_plans_available: 8,
          avg_plan_price: 18.50
        },
        {
          id: 3, name: 'España', code: 'ES', flag_emoji: '🇪🇸',
          region: 'Europe', currency: 'EUR', timezone: 'UTC+1',
          calling_code: '+34', is_esim_supported: true, data_plans_available: 12,
          avg_plan_price: 22.00
        }
      ];
      setCountries(mockCountries);
      setFilteredCountries(mockCountries);
      
      // Cargar estadísticas de viaje (simulamos)
      const mockStats = {
        countries_visited: 3,
        total_distance_km: 15420,
        favorite_destination: 'España',
        last_location_update: new Date().toISOString(),
        time_zones_crossed: 5
      };
      setTravelStats(mockStats);
      
      // Detectar ubicación actual si hay permisos
      if (status === 'granted') {
        await detectCurrentLocation();
      }
    } catch (error) {
      console.error('Error loading geolocation data:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos de ubicación');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  const detectCurrentLocation = async () => {
    try {
      setIsDetectingLocation(true);
      
      if (!locationPermission) {
        Alert.alert(
          'Permisos Requeridos',
          'Necesitamos acceso a tu ubicación para detectar tu país automáticamente.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { 
              text: 'Configurar', 
              onPress: () => {
                Alert.alert('Info', 'Por favor, habilita la ubicación en configuraciones');
              }
            },
          ]
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Simulamos detección de ubicación por ahora
      const mockLocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        country_code: 'MX',
        country_name: 'México',
        city: 'Ciudad de México',
        accuracy: location.coords.accuracy || 100,
        timestamp: new Date().toISOString(),
      };

      setCurrentLocation(mockLocationData);
      
      // Buscar el país correspondiente
      const country = countries.find(c => c.code === mockLocationData.country_code);
      if (country) {
        setSelectedCountry(country);
      }
      
    } catch (error) {
      console.error('Error detecting location:', error);
      
      // Fallback a datos simulados
      try {
        const mockLocationData = {
          latitude: 19.4326,
          longitude: -99.1332,
          country_code: 'MX',
          country_name: 'México',
          city: 'Ciudad de México',
          accuracy: 1000,
          timestamp: new Date().toISOString(),
        };
        setCurrentLocation(mockLocationData);
        
        const country = countries.find(c => c.code === mockLocationData.country_code);
        if (country) {
          setSelectedCountry(country);
        }
      } catch (fallbackError) {
        Alert.alert('Error', 'No se pudo detectar tu ubicación');
      }
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const filterCountries = () => {
    if (!searchQuery.trim()) {
      setFilteredCountries(countries);
      return;
    }

    const filtered = countries.filter(country =>
      country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCountries(filtered);
  };

  const selectCountry = (country: Country) => {
    setSelectedCountry(country);
    setShowCountryModal(false);
    setSearchQuery('');
  };

  const formatDistance = (km: number): string => {
    if (km < 1) {
      return `${Math.round(km * 1000)}m`;
    }
    if (km < 1000) {
      return `${Math.round(km)}km`;
    }
    return `${(km / 1000).toFixed(1)}k km`;
  };

  const formatPrice = (price: number): string => {
    return `$${price.toFixed(2)}`;
  };

  const renderCurrentLocationCard = () => (
    <View style={styles.locationCard}>
      <View style={styles.locationHeader}>
        <Ionicons name="location" size={24} color="#10B981" />
        <Text style={styles.locationTitle}>Ubicación Actual</Text>
        <TouchableOpacity 
          onPress={detectCurrentLocation}
          style={styles.refreshLocationButton}
          disabled={isDetectingLocation}
        >
          <Ionicons 
            name={isDetectingLocation ? "sync" : "refresh"} 
            size={20} 
            color="#667eea" 
          />
        </TouchableOpacity>
      </View>
      
      {currentLocation ? (
        <>
          <View style={styles.currentLocationInfo}>
            <Text style={styles.countryName}>
              {currentLocation.country_name} {countries.find(c => c.code === currentLocation.country_code)?.flag_emoji}
            </Text>
            {currentLocation.city && (
              <Text style={styles.cityName}>{currentLocation.city}</Text>
            )}
            <Text style={styles.locationAccuracy}>
              Precisión: ±{Math.round(currentLocation.accuracy)}m
            </Text>
          </View>
          
          {selectedCountry && (
            <View style={styles.countryDetails}>
              <Text style={styles.countryDetailLabel}>Planes disponibles:</Text>
              <Text style={styles.countryDetailValue}>{selectedCountry.data_plans_available} planes</Text>
              
              <Text style={styles.countryDetailLabel}>Precio promedio:</Text>
              <Text style={styles.countryDetailValue}>{formatPrice(selectedCountry.avg_plan_price)}</Text>
              
              <Text style={styles.countryDetailLabel}>Zona horaria:</Text>
              <Text style={styles.countryDetailValue}>{selectedCountry.timezone}</Text>
            </View>
          )}
        </>
      ) : (
        <TouchableOpacity 
          onPress={detectCurrentLocation}
          style={styles.detectButton}
          disabled={isDetectingLocation}
        >
          <Ionicons name="navigate" size={20} color="white" />
          <Text style={styles.detectButtonText}>
            {isDetectingLocation ? 'Detectando...' : 'Detectar mi Ubicación'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderTravelStatsCard = () => (
    <View style={styles.statsCard}>
      <Text style={styles.cardTitle}>Estadísticas de Viaje</Text>
      
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Ionicons name="earth" size={24} color="#3B82F6" />
          <Text style={styles.statNumber}>{travelStats?.countries_visited || 0}</Text>
          <Text style={styles.statLabel}>Países Visitados</Text>
        </View>
        
        <View style={styles.statItem}>
          <Ionicons name="airplane" size={24} color="#10B981" />
          <Text style={styles.statNumber}>
            {formatDistance(travelStats?.total_distance_km || 0)}
          </Text>
          <Text style={styles.statLabel}>Distancia Total</Text>
        </View>
        
        <View style={styles.statItem}>
          <Ionicons name="time" size={24} color="#F59E0B" />
          <Text style={styles.statNumber}>{travelStats?.time_zones_crossed || 0}</Text>
          <Text style={styles.statLabel}>Zonas Horarias</Text>
        </View>
      </View>
      
      {travelStats?.favorite_destination && (
        <View style={styles.favoriteDestination}>
          <Ionicons name="heart" size={20} color="#EF4444" />
          <Text style={styles.favoriteText}>
            Destino favorito: {travelStats.favorite_destination}
          </Text>
        </View>
      )}
    </View>
  );

  const renderCountrySelector = () => (
    <View style={styles.selectorCard}>
      <Text style={styles.cardTitle}>Seleccionar País</Text>
      
      <TouchableOpacity 
        onPress={() => setShowCountryModal(true)}
        style={styles.countryButton}
      >
        <View style={styles.selectedCountryInfo}>
          {selectedCountry ? (
            <>
              <Text style={styles.selectedCountryFlag}>{selectedCountry.flag_emoji}</Text>
              <View style={styles.selectedCountryText}>
                <Text style={styles.selectedCountryName}>{selectedCountry.name}</Text>
                <Text style={styles.selectedCountryDetails}>
                  {selectedCountry.data_plans_available} planes • {formatPrice(selectedCountry.avg_plan_price)} promedio
                </Text>
              </View>
            </>
          ) : (
            <>
              <Ionicons name="earth-outline" size={24} color="#9CA3AF" />
              <Text style={styles.noCountrySelected}>Seleccionar país</Text>
            </>
          )}
        </View>
        <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
      </TouchableOpacity>
      
      {selectedCountry && (
        <View style={styles.countryFeatures}>
          <View style={styles.featureItem}>
            <Ionicons 
              name={selectedCountry.is_esim_supported ? "checkmark-circle" : "close-circle"} 
              size={16} 
              color={selectedCountry.is_esim_supported ? "#10B981" : "#EF4444"} 
            />
            <Text style={styles.featureText}>
              eSIM {selectedCountry.is_esim_supported ? 'Compatible' : 'No Compatible'}
            </Text>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="card" size={16} color="#3B82F6" />
            <Text style={styles.featureText}>Moneda: {selectedCountry.currency}</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="call" size={16} color="#F59E0B" />
            <Text style={styles.featureText}>Código: {selectedCountry.calling_code}</Text>
          </View>
        </View>
      )}
    </View>
  );

  const renderCountryModal = () => (
    <Modal
      visible={showCountryModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Seleccionar País</Text>
          <TouchableOpacity 
            onPress={() => setShowCountryModal(false)}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar país..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
        </View>
        
        <FlatList
          data={filteredCountries}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity 
              onPress={() => selectCountry(item)}
              style={styles.countryItem}
            >
              <Text style={styles.countryFlag}>{item.flag_emoji}</Text>
              <View style={styles.countryInfo}>
                <Text style={styles.countryItemName}>{item.name}</Text>
                <Text style={styles.countryItemDetails}>
                  {item.region} • {item.data_plans_available} planes • {formatPrice(item.avg_plan_price)}
                </Text>
              </View>
              {item.is_esim_supported && (
                <View style={styles.esimBadge}>
                  <Text style={styles.esimBadgeText}>eSIM</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </Modal>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando datos de ubicación...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderCurrentLocationCard()}
        {renderTravelStatsCard()}
        {renderCountrySelector()}
      </ScrollView>
      
      {renderCountryModal()}
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
  content: {
    flex: 1,
    padding: 20,
  },
  locationCard: {
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
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
    color: '#1F2937',
  },
  refreshLocationButton: {
    padding: 4,
  },
  currentLocationInfo: {
    marginBottom: 16,
  },
  countryName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  cityName: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  locationAccuracy: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  countryDetails: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
  },
  countryDetailLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  countryDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  detectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#667eea',
    borderRadius: 8,
    padding: 12,
  },
  detectButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  statsCard: {
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  favoriteDestination: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 12,
  },
  favoriteText: {
    fontSize: 14,
    color: '#991B1B',
    marginLeft: 8,
  },
  selectorCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  countryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  selectedCountryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectedCountryFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  selectedCountryText: {
    flex: 1,
  },
  selectedCountryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  selectedCountryDetails: {
    fontSize: 12,
    color: '#6B7280',
  },
  noCountrySelected: {
    fontSize: 16,
    color: '#9CA3AF',
    marginLeft: 8,
  },
  countryFeatures: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  featureText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    margin: 20,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#1F2937',
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  countryFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  countryInfo: {
    flex: 1,
  },
  countryItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  countryItemDetails: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  esimBadge: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  esimBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
});

export default GeolocationScreen;
