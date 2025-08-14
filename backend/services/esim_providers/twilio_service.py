"""
Servicio de integración con Twilio Super SIM
Documentación: https://www.twilio.com/docs/iot/supersim
Ideal para testing y MVP de Hablaris
"""

import requests
import logging
from typing import Dict, List, Optional
from django.conf import settings
from django.core.cache import cache
import base64

logger = logging.getLogger(__name__)

class TwilioSuperSimService:
    """Servicio para integración con Twilio Super SIM"""
    
    def __init__(self):
        self.account_sid = settings.TWILIO_ACCOUNT_SID
        self.auth_token = settings.TWILIO_AUTH_TOKEN
        self.fleet_sid = settings.TWILIO_SUPERSIM_FLEET_SID
        self.base_url = f"https://supersim.twilio.com/v1"
        
        # Crear credenciales base64 para auth
        credentials = f"{self.account_sid}:{self.auth_token}"
        self.auth_header = base64.b64encode(credentials.encode()).decode()
    
    def get_headers(self) -> Dict[str, str]:
        """Headers para requests autenticados"""
        return {
            'Authorization': f'Basic {self.auth_header}',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
        }
    
    def get_rate_plans(self) -> List[Dict]:
        """Obtener planes de datos disponibles"""
        try:
            cache_key = 'twilio_rate_plans'
            cached_plans = cache.get(cache_key)
            
            if cached_plans:
                return cached_plans
            
            response = requests.get(
                f"{self.base_url}/RatePlans",
                headers=self.get_headers(),
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                plans = data.get('rate_plans', [])
                
                # Procesar y formatear planes
                formatted_plans = []
                for plan in plans:
                    formatted_plan = {
                        'id': plan.get('sid'),
                        'unique_name': plan.get('unique_name'),
                        'friendly_name': plan.get('friendly_name'),
                        'data_enabled': plan.get('data_enabled', True),
                        'data_limit': plan.get('data_limit'),
                        'data_metering': plan.get('data_metering'),
                        'messaging_enabled': plan.get('messaging_enabled', False),
                        'voice_enabled': plan.get('voice_enabled', False),
                        'international_roaming': plan.get('international_roaming', []),
                        'national_roaming': plan.get('national_roaming', [])
                    }
                    formatted_plans.append(formatted_plan)
                
                # Cache por 2 horas
                cache.set(cache_key, formatted_plans, 7200)
                
                logger.info(f"Obtenidos {len(formatted_plans)} planes de Twilio")
                return formatted_plans
            else:
                logger.error(f"Error obteniendo planes Twilio: {response.status_code}")
                return []
                
        except Exception as e:
            logger.error(f"Error en get_rate_plans: {str(e)}")
            return []
    
    def create_sim(self, unique_name: str = None, rate_plan_sid: str = None) -> Optional[Dict]:
        """Crear nueva SIM en Twilio"""
        try:
            data = {
                'Fleet': self.fleet_sid
            }
            
            if unique_name:
                data['UniqueName'] = unique_name
            
            if rate_plan_sid:
                data['RatePlan'] = rate_plan_sid
            
            response = requests.post(
                f"{self.base_url}/Sims",
                headers=self.get_headers(),
                data=data,
                timeout=60
            )
            
            if response.status_code == 201:
                sim_data = response.json()
                
                # Formatear respuesta para uso interno
                formatted_sim = {
                    'id': sim_data.get('sid'),
                    'unique_name': sim_data.get('unique_name'),
                    'account_sid': sim_data.get('account_sid'),
                    'rate_plan_sid': sim_data.get('rate_plan_sid'),
                    'status': sim_data.get('status'),
                    'reset_status': sim_data.get('reset_status'),
                    'iccid': sim_data.get('iccid'),
                    'e_id': sim_data.get('e_id'),
                    'ip_address': sim_data.get('ip_address'),
                    'links': sim_data.get('links', {}),
                    'date_created': sim_data.get('date_created'),
                    'date_updated': sim_data.get('date_updated')
                }
                
                logger.info(f"SIM Twilio creada: {formatted_sim['id']}")
                return formatted_sim
            else:
                logger.error(f"Error creando SIM Twilio: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"Error en create_sim: {str(e)}")
            return None
    
    def get_sim_details(self, sim_sid: str) -> Optional[Dict]:
        """Obtener detalles de una SIM específica"""
        try:
            response = requests.get(
                f"{self.base_url}/Sims/{sim_sid}",
                headers=self.get_headers(),
                timeout=30
            )
            
            if response.status_code == 200:
                sim_data = response.json()
                
                # Obtener información adicional
                usage_data = self.get_sim_usage(sim_sid)
                
                detailed_sim = {
                    'basic_info': {
                        'id': sim_data.get('sid'),
                        'unique_name': sim_data.get('unique_name'),
                        'friendly_name': sim_data.get('friendly_name'),
                        'iccid': sim_data.get('iccid'),
                        'status': sim_data.get('status'),
                        'reset_status': sim_data.get('reset_status')
                    },
                    'network_info': {
                        'ip_address': sim_data.get('ip_address'),
                        'rate_plan_sid': sim_data.get('rate_plan_sid'),
                        'fleet_sid': sim_data.get('fleet_sid')
                    },
                    'usage': usage_data,
                    'timestamps': {
                        'created': sim_data.get('date_created'),
                        'updated': sim_data.get('date_updated')
                    },
                    'raw_data': sim_data  # Para debugging
                }
                
                return detailed_sim
            else:
                logger.error(f"Error obteniendo SIM Twilio: {response.status_code}")
                return None
                
        except Exception as e:
            logger.error(f"Error en get_sim_details: {str(e)}")
            return None
    
    def get_sim_usage(self, sim_sid: str, granularity: str = 'day') -> Optional[Dict]:
        """Obtener estadísticas de uso de SIM"""
        try:
            params = {
                'Granularity': granularity  # hour, day, all
            }
            
            response = requests.get(
                f"{self.base_url}/Sims/{sim_sid}/UsageRecords",
                headers=self.get_headers(),
                params=params,
                timeout=30
            )
            
            if response.status_code == 200:
                usage_data = response.json()
                usage_records = usage_data.get('usage_records', [])
                
                # Procesar datos de uso
                total_download = sum(record.get('download', 0) for record in usage_records)
                total_upload = sum(record.get('upload', 0) for record in usage_records)
                total_usage = total_download + total_upload
                
                processed_usage = {
                    'summary': {
                        'total_usage_bytes': total_usage,
                        'total_download_bytes': total_download,
                        'total_upload_bytes': total_upload,
                        'total_usage_mb': round(total_usage / (1024 * 1024), 2),
                        'total_sessions': len(usage_records)
                    },
                    'daily_records': []
                }
                
                # Procesar registros diarios
                for record in usage_records:
                    daily_record = {
                        'period': record.get('period', {}).get('start'),
                        'download_mb': round(record.get('download', 0) / (1024 * 1024), 2),
                        'upload_mb': round(record.get('upload', 0) / (1024 * 1024), 2),
                        'total_mb': round((record.get('download', 0) + record.get('upload', 0)) / (1024 * 1024), 2)
                    }
                    processed_usage['daily_records'].append(daily_record)
                
                return processed_usage
            else:
                logger.error(f"Error obteniendo uso Twilio: {response.status_code}")
                return None
                
        except Exception as e:
            logger.error(f"Error en get_sim_usage: {str(e)}")
            return None
    
    def update_sim_status(self, sim_sid: str, status: str) -> bool:
        """Actualizar estado de SIM (active, inactive, scheduled)"""
        try:
            valid_statuses = ['active', 'inactive', 'scheduled']
            if status not in valid_statuses:
                logger.error(f"Estado inválido: {status}. Debe ser uno de {valid_statuses}")
                return False
            
            data = {
                'Status': status
            }
            
            response = requests.post(
                f"{self.base_url}/Sims/{sim_sid}",
                headers=self.get_headers(),
                data=data,
                timeout=30
            )
            
            if response.status_code == 200:
                logger.info(f"Estado de SIM {sim_sid} actualizado a {status}")
                return True
            else:
                logger.error(f"Error actualizando estado SIM: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"Error en update_sim_status: {str(e)}")
            return False
    
    def send_sms_to_sim(self, sim_sid: str, message: str, from_number: str = None) -> bool:
        """Enviar SMS a una SIM (si está habilitado messaging)"""
        try:
            data = {
                'Body': message
            }
            
            if from_number:
                data['From'] = from_number
            
            response = requests.post(
                f"{self.base_url}/Sims/{sim_sid}/SmsMessages",
                headers=self.get_headers(),
                data=data,
                timeout=30
            )
            
            return response.status_code == 201
            
        except Exception as e:
            logger.error(f"Error enviando SMS: {str(e)}")
            return False
    
    def get_available_countries(self) -> List[Dict]:
        """Obtener países con cobertura disponible"""
        try:
            # Esta información normalmente viene de la documentación de Twilio
            # o de consultas a sus APIs de cobertura
            
            # Países con mejor cobertura Twilio Super SIM
            countries = [
                {'code': 'US', 'name': 'Estados Unidos', 'flag': '🇺🇸', 'coverage': 'excellent'},
                {'code': 'CA', 'name': 'Canadá', 'flag': '🇨🇦', 'coverage': 'excellent'},
                {'code': 'MX', 'name': 'México', 'flag': '🇲🇽', 'coverage': 'good'},
                {'code': 'GB', 'name': 'Reino Unido', 'flag': '🇬🇧', 'coverage': 'excellent'},
                {'code': 'DE', 'name': 'Alemania', 'flag': '🇩🇪', 'coverage': 'excellent'},
                {'code': 'FR', 'name': 'Francia', 'flag': '🇫🇷', 'coverage': 'excellent'},
                {'code': 'ES', 'name': 'España', 'flag': '🇪🇸', 'coverage': 'excellent'},
                {'code': 'IT', 'name': 'Italia', 'flag': '🇮🇹', 'coverage': 'good'},
                {'code': 'NL', 'name': 'Países Bajos', 'flag': '🇳🇱', 'coverage': 'excellent'},
                {'code': 'AU', 'name': 'Australia', 'flag': '🇦🇺', 'coverage': 'good'},
                {'code': 'JP', 'name': 'Japón', 'flag': '🇯🇵', 'coverage': 'good'},
                {'code': 'KR', 'name': 'Corea del Sur', 'flag': '🇰🇷', 'coverage': 'good'},
                {'code': 'SG', 'name': 'Singapur', 'flag': '🇸🇬', 'coverage': 'excellent'},
                {'code': 'BR', 'name': 'Brasil', 'flag': '🇧🇷', 'coverage': 'fair'},
                {'code': 'AR', 'name': 'Argentina', 'flag': '🇦🇷', 'coverage': 'fair'}
            ]
            
            return countries
            
        except Exception as e:
            logger.error(f"Error obteniendo países: {str(e)}")
            return []
    
    def create_rate_plan(self, unique_name: str, data_limit: int = None, 
                        international_roaming: List[str] = None) -> Optional[Dict]:
        """Crear plan de datos personalizado"""
        try:
            data = {
                'UniqueName': unique_name,
                'DataEnabled': True,
                'DataMetering': 'payg'  # pay-as-you-go
            }
            
            if data_limit:
                data['DataLimit'] = data_limit
            
            if international_roaming:
                data['InternationalRoaming'] = international_roaming
            
            response = requests.post(
                f"{self.base_url}/RatePlans",
                headers=self.get_headers(),
                data=data,
                timeout=30
            )
            
            if response.status_code == 201:
                plan_data = response.json()
                logger.info(f"Plan Twilio creado: {plan_data.get('sid')}")
                return plan_data
            else:
                logger.error(f"Error creando plan: {response.status_code}")
                return None
                
        except Exception as e:
            logger.error(f"Error en create_rate_plan: {str(e)}")
            return None

# Instancia global del servicio
twilio_service = TwilioSuperSimService()
