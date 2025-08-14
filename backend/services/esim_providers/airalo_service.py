"""
Servicio de integración con Airalo eSIM Provider
Documentación: https://partners.airalo.com/api-docs
"""

import requests
import logging
from typing import Dict, List, Optional
from django.conf import settings
from django.core.cache import cache

logger = logging.getLogger(__name__)

class AiraloService:
    """Servicio para integración con Airalo eSIM Provider"""
    
    def __init__(self):
        self.base_url = "https://partners.airalo.com/api/v2"
        self.client_id = settings.AIRALO_CLIENT_ID
        self.client_secret = settings.AIRALO_CLIENT_SECRET
        self.access_token = None
        
    def authenticate(self) -> bool:
        """Autenticación con Airalo API"""
        try:
            # Verificar si ya tenemos token en cache
            cached_token = cache.get('airalo_access_token')
            if cached_token:
                self.access_token = cached_token
                return True
            
            # Obtener nuevo token
            auth_data = {
                'grant_type': 'client_credentials',
                'client_id': self.client_id,
                'client_secret': self.client_secret
            }
            
            response = requests.post(
                f"{self.base_url}/token",
                data=auth_data,
                headers={'Content-Type': 'application/x-www-form-urlencoded'}
            )
            
            if response.status_code == 200:
                token_data = response.json()
                self.access_token = token_data.get('access_token')
                expires_in = token_data.get('expires_in', 3600)
                
                # Guardar en cache
                cache.set('airalo_access_token', self.access_token, expires_in - 300)
                
                logger.info("Autenticación exitosa con Airalo")
                return True
            else:
                logger.error(f"Error de autenticación Airalo: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"Error en autenticación Airalo: {str(e)}")
            return False
    
    def get_headers(self) -> Dict[str, str]:
        """Headers para requests autenticados"""
        return {
            'Authorization': f'Bearer {self.access_token}',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    
    def get_countries(self) -> List[Dict]:
        """Obtener lista de países disponibles"""
        try:
            if not self.authenticate():
                return []
            
            response = requests.get(
                f"{self.base_url}/countries",
                headers=self.get_headers()
            )
            
            if response.status_code == 200:
                data = response.json()
                return data.get('data', [])
            else:
                logger.error(f"Error obteniendo países: {response.status_code}")
                return []
                
        except Exception as e:
            logger.error(f"Error en get_countries: {str(e)}")
            return []
    
    def get_packages(self, country_code: str = None) -> List[Dict]:
        """Obtener paquetes eSIM disponibles"""
        try:
            if not self.authenticate():
                return []
            
            url = f"{self.base_url}/packages"
            params = {}
            
            if country_code:
                params['country'] = country_code
            
            response = requests.get(
                url,
                headers=self.get_headers(),
                params=params
            )
            
            if response.status_code == 200:
                data = response.json()
                return data.get('data', [])
            else:
                logger.error(f"Error obteniendo paquetes: {response.status_code}")
                return []
                
        except Exception as e:
            logger.error(f"Error en get_packages: {str(e)}")
            return []
    
    def create_order(self, package_id: str, quantity: int = 1) -> Optional[Dict]:
        """Crear orden de eSIM"""
        try:
            if not self.authenticate():
                return None
            
            order_data = {
                'package_id': package_id,
                'quantity': quantity,
                'description': f'Hablaris eSIM Order - {package_id}'
            }
            
            response = requests.post(
                f"{self.base_url}/orders",
                headers=self.get_headers(),
                json=order_data
            )
            
            if response.status_code == 201:
                order = response.json()
                logger.info(f"Orden creada exitosamente: {order.get('data', {}).get('id')}")
                return order.get('data')
            else:
                logger.error(f"Error creando orden: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"Error en create_order: {str(e)}")
            return None
    
    def get_order_status(self, order_id: str) -> Optional[Dict]:
        """Obtener estado de una orden"""
        try:
            if not self.authenticate():
                return None
            
            response = requests.get(
                f"{self.base_url}/orders/{order_id}",
                headers=self.get_headers()
            )
            
            if response.status_code == 200:
                return response.json().get('data')
            else:
                logger.error(f"Error obteniendo orden: {response.status_code}")
                return None
                
        except Exception as e:
            logger.error(f"Error en get_order_status: {str(e)}")
            return None
    
    def get_esim_details(self, esim_id: str) -> Optional[Dict]:
        """Obtener detalles de eSIM (QR, activación, etc.)"""
        try:
            if not self.authenticate():
                return None
            
            response = requests.get(
                f"{self.base_url}/sims/{esim_id}",
                headers=self.get_headers()
            )
            
            if response.status_code == 200:
                return response.json().get('data')
            else:
                logger.error(f"Error obteniendo eSIM: {response.status_code}")
                return None
                
        except Exception as e:
            logger.error(f"Error en get_esim_details: {str(e)}")
            return None
    
    def get_usage_statistics(self, esim_id: str) -> Optional[Dict]:
        """Obtener estadísticas de uso de eSIM"""
        try:
            if not self.authenticate():
                return None
            
            response = requests.get(
                f"{self.base_url}/sims/{esim_id}/usage",
                headers=self.get_headers()
            )
            
            if response.status_code == 200:
                return response.json().get('data')
            else:
                logger.error(f"Error obteniendo uso: {response.status_code}")
                return None
                
        except Exception as e:
            logger.error(f"Error en get_usage_statistics: {str(e)}")
            return None

# Instancia global del servicio
airalo_service = AiraloService()
