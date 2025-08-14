import requests
import json
from typing import Dict, Optional, Tuple
from django.conf import settings
from django.core.cache import cache
from .models import Country, IPGeolocation, LocationHistory


class GeolocationService:
    """Servicio para detectar y gestionar geolocalización"""
    
    @staticmethod
    def get_country_by_ip(ip_address: str) -> Optional[Country]:
        """Detectar país por dirección IP"""
        # Verificar cache
        cached_location = cache.get(f"ip_location_{ip_address}")
        if cached_location:
            return cached_location
        
        # Verificar base de datos
        try:
            ip_geo = IPGeolocation.objects.get(ip_address=ip_address)
            cache.set(f"ip_location_{ip_address}", ip_geo.country, 3600)  # Cache 1 hora
            return ip_geo.country
        except IPGeolocation.DoesNotExist:
            pass
        
        # Consultar servicio externo
        country = GeolocationService._fetch_ip_location(ip_address)
        if country:
            cache.set(f"ip_location_{ip_address}", country, 3600)
        
        return country
    
    @staticmethod
    def _fetch_ip_location(ip_address: str) -> Optional[Country]:
        """Consultar servicio de geolocalización por IP"""
        try:
            # Usar ip-api.com (gratuito)
            response = requests.get(
                f"http://ip-api.com/json/{ip_address}?fields=status,country,countryCode,city,lat,lon,isp,org",
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                if data['status'] == 'success':
                    country_code = data['countryCode']
                    
                    try:
                        country = Country.objects.get(code=country_code)
                        
                        # Guardar en cache de BD
                        IPGeolocation.objects.update_or_create(
                            ip_address=ip_address,
                            defaults={
                                'country': country,
                                'city': data.get('city'),
                                'latitude': data.get('lat', 0),
                                'longitude': data.get('lon', 0),
                                'isp': data.get('isp'),
                                'org': data.get('org'),
                                'source': 'ip-api'
                            }
                        )
                        
                        return country
                    except Country.DoesNotExist:
                        pass
        except Exception as e:
            print(f"Error fetching IP location: {e}")
        
        return None
    
    @staticmethod
    def get_country_by_coordinates(lat: float, lng: float) -> Optional[Country]:
        """Detectar país por coordenadas GPS"""
        try:
            # Usar reverse geocoding con Nominatim (OpenStreetMap)
            response = requests.get(
                f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lng}&zoom=3",
                headers={'User-Agent': 'eSIM-Pro-App'},
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                if 'address' in data and 'country_code' in data['address']:
                    country_code = data['address']['country_code'].upper()
                    
                    try:
                        return Country.objects.get(code=country_code)
                    except Country.DoesNotExist:
                        pass
        except Exception as e:
            print(f"Error fetching GPS location: {e}")
        
        return None
    
    @staticmethod
    def record_location(user, country: Country, method: str, **kwargs):
        """Registrar ubicación del usuario"""
        location_data = {
            'user': user,
            'country': country,
            'detection_method': method,
            'city': kwargs.get('city'),
            'latitude': kwargs.get('latitude'),
            'longitude': kwargs.get('longitude'),
            'accuracy': kwargs.get('accuracy'),
        }
        
        # Verificar si es roaming
        last_location = LocationHistory.objects.filter(user=user).first()
        if last_location and last_location.country != country:
            location_data['is_roaming'] = True
        
        return LocationHistory.objects.create(**location_data)
    
    @staticmethod
    def get_recommended_plans(country: Country, user=None):
        """Obtener planes recomendados para un país"""
        # Esta función se integrará con el sistema de planes
        return []
    
    @staticmethod
    def create_roaming_alert(user, country: Country):
        """Crear alerta de roaming"""
        from .models import GeofenceAlert
        
        GeofenceAlert.objects.create(
            user=user,
            country=country,
            alert_type='roaming',
            title=f'¡Bienvenido a {country.name}!',
            message=f'Hemos detectado que estás en {country.name}. ¿Necesitas un plan de datos local?',
            action_button='Ver Planes',
            action_url=f'/plans?country={country.code}'
        )
    
    @staticmethod
    def get_user_travel_stats(user):
        """Obtener estadísticas de viaje del usuario"""
        locations = LocationHistory.objects.filter(user=user)
        
        return {
            'countries_visited': locations.values('country').distinct().count(),
            'total_trips': locations.filter(is_roaming=True).count(),
            'favorite_destinations': list(
                locations.values('country__name', 'country__flag_emoji')
                .annotate(visits=models.Count('id'))
                .order_by('-visits')[:5]
            )
        }


class CountryRecommendationService:
    """Servicio para recomendaciones basadas en ubicación"""
    
    @staticmethod
    def get_popular_destinations():
        """Obtener destinos populares"""
        return Country.objects.filter(is_popular=True, esim_supported=True)
    
    @staticmethod
    def get_nearby_countries(country: Country, radius_km: int = 1000):
        """Obtener países cercanos"""
        # Implementar cálculo de distancia básico
        # En producción, usar bibliotecas geoespaciales más sofisticadas
        return Country.objects.filter(
            continent=country.continent,
            esim_supported=True
        ).exclude(id=country.id)[:5]
    
    @staticmethod
    def get_regional_packages(country: Country):
        """Obtener paquetes regionales disponibles"""
        # Integrar con sistema de planes
        return []
