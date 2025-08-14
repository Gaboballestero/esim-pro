"""
Servicio de integración con 1GLOBAL eSIM Provider
API Documentation: https://www.1global.com/developers
"""

import requests
import logging
from typing import Dict, List, Optional
from django.conf import settings
from django.core.cache import cache
import hashlib
import hmac
import time

logger = logging.getLogger(__name__)

class OneGlobalService:
    """Servicio para integración con 1GLOBAL eSIM Provider"""
    
    def __init__(self):
        self.base_url = settings.ONEGLOBAL_BASE_URL
        self.api_key = settings.ONEGLOBAL_API_KEY
        self.api_secret = settings.ONEGLOBAL_API_SECRET
        self.partner_id = settings.ONEGLOBAL_PARTNER_ID
        
    def generate_signature(self, method: str, endpoint: str, payload: str = "") -> str:
        """Generar firma HMAC para autenticación"""
        timestamp = str(int(time.time()))
        message = f"{method}{endpoint}{payload}{timestamp}"
        signature = hmac.new(
            self.api_secret.encode(),
            message.encode(),
            hashlib.sha256
        ).hexdigest()
        return signature, timestamp
    
    def get_headers(self, method: str, endpoint: str, payload: str = "") -> Dict[str, str]:
        """Headers para requests autenticados"""
        signature, timestamp = self.generate_signature(method, endpoint, payload)
        
        return {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-API-Key': self.api_key,
            'X-Signature': signature,
            'X-Timestamp': timestamp,
            'X-Partner-ID': self.partner_id
        }
    
    def get_destinations(self) -> List[Dict]:
        """Obtener destinos disponibles"""
        try:
            endpoint = '/v1/destinations'
            cache_key = 'oneglobal_destinations'
            
            # Verificar cache
            cached_data = cache.get(cache_key)
            if cached_data:
                return cached_data
            
            headers = self.get_headers('GET', endpoint)
            response = requests.get(
                f"{self.base_url}{endpoint}",
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                destinations = data.get('destinations', [])
                
                # Cache por 6 horas
                cache.set(cache_key, destinations, 21600)
                
                logger.info(f"Obtenidos {len(destinations)} destinos de 1GLOBAL")
                return destinations
            else:
                logger.error(f"Error obteniendo destinos: {response.status_code}")
                return []
                
        except Exception as e:
            logger.error(f"Error en get_destinations: {str(e)}")
            return []
    
    def get_products(self, destination_id: str = None) -> List[Dict]:
        """Obtener productos eSIM disponibles"""
        try:
            endpoint = '/v1/products'
            params = {}
            
            if destination_id:
                params['destination_id'] = destination_id
            
            cache_key = f'oneglobal_products_{destination_id or "all"}'
            cached_data = cache.get(cache_key)
            if cached_data:
                return cached_data
            
            headers = self.get_headers('GET', endpoint)
            response = requests.get(
                f"{self.base_url}{endpoint}",
                headers=headers,
                params=params,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                products = data.get('products', [])
                
                # Procesar y enriquecer datos
                enhanced_products = []
                for product in products:
                    enhanced_product = {
                        'id': product.get('id'),
                        'name': product.get('name'),
                        'destination': product.get('destination', {}),
                        'data_amount': product.get('data_amount_mb'),
                        'validity_days': product.get('validity_days'),
                        'price': {
                            'wholesale': product.get('wholesale_price'),
                            'suggested_retail': product.get('suggested_retail_price'),
                            'currency': product.get('currency', 'USD')
                        },
                        'features': {
                            'data_only': product.get('data_only', True),
                            'voice': product.get('voice_enabled', False),
                            'sms': product.get('sms_enabled', False),
                            'hotspot': product.get('hotspot_enabled', True)
                        },
                        'coverage': product.get('coverage_countries', []),
                        'operators': product.get('supported_operators', []),
                        'activation': {
                            'type': product.get('activation_type', 'qr_code'),
                            'instant': product.get('instant_activation', True)
                        }
                    }
                    enhanced_products.append(enhanced_product)
                
                # Cache por 2 horas
                cache.set(cache_key, enhanced_products, 7200)
                
                logger.info(f"Obtenidos {len(enhanced_products)} productos de 1GLOBAL")
                return enhanced_products
            else:
                logger.error(f"Error obteniendo productos: {response.status_code}")
                return []
                
        except Exception as e:
            logger.error(f"Error en get_products: {str(e)}")
            return []
    
    def create_order(self, product_id: str, quantity: int = 1, customer_email: str = None) -> Optional[Dict]:
        """Crear orden de eSIM"""
        try:
            endpoint = '/v1/orders'
            payload = {
                'product_id': product_id,
                'quantity': quantity,
                'customer_reference': f'hablaris_{int(time.time())}',
                'notification_email': customer_email or settings.DEFAULT_NOTIFICATION_EMAIL
            }
            
            payload_str = requests.utils.quote(str(payload))
            headers = self.get_headers('POST', endpoint, payload_str)
            
            response = requests.post(
                f"{self.base_url}{endpoint}",
                headers=headers,
                json=payload,
                timeout=60
            )
            
            if response.status_code == 201:
                order_data = response.json()
                logger.info(f"Orden 1GLOBAL creada: {order_data.get('order_id')}")
                return order_data
            else:
                logger.error(f"Error creando orden 1GLOBAL: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"Error en create_order: {str(e)}")
            return None
    
    def get_order_status(self, order_id: str) -> Optional[Dict]:
        """Obtener estado de orden"""
        try:
            endpoint = f'/v1/orders/{order_id}'
            headers = self.get_headers('GET', endpoint)
            
            response = requests.get(
                f"{self.base_url}{endpoint}",
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"Error obteniendo orden: {response.status_code}")
                return None
                
        except Exception as e:
            logger.error(f"Error en get_order_status: {str(e)}")
            return None
    
    def get_esim_details(self, esim_id: str) -> Optional[Dict]:
        """Obtener detalles completos de eSIM"""
        try:
            endpoint = f'/v1/esims/{esim_id}'
            headers = self.get_headers('GET', endpoint)
            
            response = requests.get(
                f"{self.base_url}{endpoint}",
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                esim_data = response.json()
                
                # Formatear datos para uso interno
                formatted_data = {
                    'id': esim_data.get('id'),
                    'iccid': esim_data.get('iccid'),
                    'status': esim_data.get('status'),
                    'qr_code': esim_data.get('qr_code_url'),
                    'activation_code': esim_data.get('activation_code'),
                    'manual_config': {
                        'sm_dp_address': esim_data.get('sm_dp_address'),
                        'activation_code': esim_data.get('manual_activation_code')
                    },
                    'usage': {
                        'data_used_mb': esim_data.get('data_used_mb', 0),
                        'data_remaining_mb': esim_data.get('data_remaining_mb'),
                        'validity_remaining_days': esim_data.get('validity_remaining_days')
                    },
                    'network': {
                        'current_operator': esim_data.get('current_operator'),
                        'roaming_status': esim_data.get('roaming_status'),
                        'last_activity': esim_data.get('last_activity_timestamp')
                    }
                }
                
                return formatted_data
            else:
                logger.error(f"Error obteniendo eSIM: {response.status_code}")
                return None
                
        except Exception as e:
            logger.error(f"Error en get_esim_details: {str(e)}")
            return None
    
    def get_usage_statistics(self, esim_id: str) -> Optional[Dict]:
        """Obtener estadísticas de uso detalladas"""
        try:
            endpoint = f'/v1/esims/{esim_id}/usage'
            headers = self.get_headers('GET', endpoint)
            
            response = requests.get(
                f"{self.base_url}{endpoint}",
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                usage_data = response.json()
                
                # Procesar estadísticas
                processed_usage = {
                    'current_usage': {
                        'data_used_mb': usage_data.get('data_used_mb', 0),
                        'data_remaining_mb': usage_data.get('data_remaining_mb', 0),
                        'usage_percentage': self.calculate_usage_percentage(
                            usage_data.get('data_used_mb', 0),
                            usage_data.get('total_data_mb', 1)
                        )
                    },
                    'time_remaining': {
                        'validity_days': usage_data.get('validity_remaining_days', 0),
                        'expires_at': usage_data.get('expiry_timestamp')
                    },
                    'activity': {
                        'last_session': usage_data.get('last_session_timestamp'),
                        'total_sessions': usage_data.get('total_sessions', 0),
                        'countries_visited': usage_data.get('countries_used', [])
                    },
                    'daily_usage': usage_data.get('daily_usage_history', [])
                }
                
                return processed_usage
            else:
                logger.error(f"Error obteniendo uso: {response.status_code}")
                return None
                
        except Exception as e:
            logger.error(f"Error en get_usage_statistics: {str(e)}")
            return None
    
    def calculate_usage_percentage(self, used_mb: int, total_mb: int) -> float:
        """Calcular porcentaje de uso"""
        if total_mb <= 0:
            return 0.0
        return min((used_mb / total_mb) * 100, 100.0)
    
    def suspend_esim(self, esim_id: str) -> bool:
        """Suspender eSIM"""
        try:
            endpoint = f'/v1/esims/{esim_id}/suspend'
            headers = self.get_headers('POST', endpoint)
            
            response = requests.post(
                f"{self.base_url}{endpoint}",
                headers=headers,
                timeout=30
            )
            
            return response.status_code == 200
            
        except Exception as e:
            logger.error(f"Error suspendiendo eSIM: {str(e)}")
            return False
    
    def reactivate_esim(self, esim_id: str) -> bool:
        """Reactivar eSIM suspendido"""
        try:
            endpoint = f'/v1/esims/{esim_id}/reactivate'
            headers = self.get_headers('POST', endpoint)
            
            response = requests.post(
                f"{self.base_url}{endpoint}",
                headers=headers,
                timeout=30
            )
            
            return response.status_code == 200
            
        except Exception as e:
            logger.error(f"Error reactivando eSIM: {str(e)}")
            return False

# Instancia global del servicio
oneglobal_service = OneGlobalService()
