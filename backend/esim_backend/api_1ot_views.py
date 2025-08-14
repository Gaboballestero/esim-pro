"""
API Integration with 1oT for eSIM management
"""

import os
import json
import requests
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import logging

logger = logging.getLogger(__name__)

def load_1ot_credentials():
    """Cargar credenciales de 1oT desde .env.1ot"""
    try:
        env_file = os.path.join(os.path.dirname(__file__), '..', '..', '.env.1ot')
        credentials = {}
        
        if os.path.exists(env_file):
            with open(env_file, 'r') as f:
                for line in f:
                    if '=' in line and not line.startswith('#'):
                        key, value = line.strip().split('=', 1)
                        credentials[key] = value.strip('"\'')
        
        return credentials
    except Exception as e:
        logger.error(f"Error loading 1oT credentials: {e}")
        return {}

@csrf_exempt
@require_http_methods(["GET"])
def test_1ot_credentials(request):
    """Probar credenciales de 1oT"""
    try:
        credentials = load_1ot_credentials()
        
        # Verificar si estamos en modo test
        if credentials.get('IOT_TEST_MODE') == 'true':
            return JsonResponse({
                'success': True,
                'message': 'Modo TEST activado - 1oT Simulación exitosa',
                'test_mode': True,
                'provider': '1oT',
                'api_status': 'simulated',
                'note': '🧪 Esta es una simulación - NO conecta con 1oT real'
            })
        
        if not credentials.get('IOT_API_KEY') or not credentials.get('IOT_API_SECRET'):
            return JsonResponse({
                'success': False,
                'error': 'Credenciales de 1oT no encontradas',
                'details': 'Verifica el archivo .env.1ot'
            }, status=400)
        
        # Probar conexión real con 1oT
        base_url = credentials.get('IOT_BASE_URL', 'https://api.1ot.com/v1')
        headers = {
            'Authorization': f"Bearer {credentials['IOT_API_KEY']}",
            'Content-Type': 'application/json'
        }
        
        response = requests.get(f"{base_url}/account", headers=headers, timeout=10)
        
        if response.status_code == 200:
            account_data = response.json()
            return JsonResponse({
                'success': True,
                'message': 'Conexión exitosa con 1oT',
                'provider': '1oT',
                'account_info': {
                    'name': account_data.get('name', 'N/A'),
                    'status': account_data.get('status', 'active'),
                    'balance': account_data.get('balance', 'N/A')
                },
                'api_version': 'v1'
            })
        else:
            return JsonResponse({
                'success': False,
                'error': f'Error al conectar con 1oT: HTTP {response.status_code}',
                'details': response.text
            }, status=400)
            
    except requests.RequestException as e:
        return JsonResponse({
            'success': False,
            'error': f'Error de conexión con 1oT: {str(e)}'
        }, status=500)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Error interno: {str(e)}'
        }, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def create_1ot_esim(request):
    """Crear una eSIM con 1oT"""
    try:
        data = json.loads(request.body)
        credentials = load_1ot_credentials()
        
        # Verificar si estamos en modo test
        if credentials.get('IOT_TEST_MODE') == 'true':
            # Simular creación exitosa de eSIM
            import random
            import string
            
            iccid = '8901' + ''.join(random.choices(string.digits, k=16))
            eid = ''.join(random.choices(string.digits + string.ascii_uppercase, k=32))
            
            return JsonResponse({
                'success': True,
                'message': 'eSIM creada exitosamente (MODO TEST - 1oT)',
                'provider': '1oT',
                'esim_data': {
                    'iccid': iccid,
                    'eid': eid,
                    'status': 'active',
                    'activation_code': f"1${iccid}",
                    'qr_code': f"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
                },
                'plan_details': {
                    'country': data.get('country', 'N/A'),
                    'data_limit': data.get('data_plan', 'N/A'),
                    'validity_days': 30
                },
                'test_mode': True,
                'note': '🧪 Esta es una eSIM simulada - NO es real'
            })
        
        # Implementar creación real con 1oT API
        if not credentials.get('IOT_API_KEY'):
            return JsonResponse({
                'success': False,
                'error': 'Credenciales de 1oT no configuradas'
            }, status=400)
        
        base_url = credentials.get('IOT_BASE_URL', 'https://api.1ot.com/v1')
        headers = {
            'Authorization': f"Bearer {credentials['IOT_API_KEY']}",
            'Content-Type': 'application/json'
        }
        
        # Payload para crear eSIM con 1oT
        payload = {
            'country': data.get('country', 'ES'),
            'data_limit_mb': int(data.get('data_plan', '1GB').replace('GB', '000')),
            'validity_days': 30,
            'customer_info': {
                'email': data.get('email', ''),
                'name': data.get('customer_name', 'Customer')
            }
        }
        
        response = requests.post(f"{base_url}/esims", json=payload, headers=headers, timeout=30)
        
        if response.status_code == 201:
            esim_data = response.json()
            return JsonResponse({
                'success': True,
                'message': 'eSIM creada exitosamente con 1oT',
                'provider': '1oT',
                'esim_data': esim_data,
                'test_mode': False
            })
        else:
            return JsonResponse({
                'success': False,
                'error': f'Error al crear eSIM con 1oT: {response.status_code}',
                'details': response.text
            }, status=400)
            
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'JSON inválido en el request'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Error interno: {str(e)}'
        }, status=500)

@csrf_exempt  
@require_http_methods(["GET"])
def check_1ot_usage(request, esim_id):
    """Consultar uso de una eSIM en 1oT"""
    try:
        credentials = load_1ot_credentials()
        
        # Verificar si estamos en modo test
        if credentials.get('IOT_TEST_MODE') == 'true':
            # Simular datos de uso
            import random
            from datetime import datetime, timedelta
            
            return JsonResponse({
                'success': True,
                'test_mode': True,
                'provider': '1oT',
                'esim_info': {
                    'iccid': esim_id,
                    'status': 'active',
                    'activation_date': str(datetime.now() - timedelta(days=random.randint(1, 30))),
                    'expiry_date': str(datetime.now() + timedelta(days=random.randint(1, 30)))
                },
                'usage_data': {
                    'data_used_mb': random.randint(50, 800),
                    'data_limit_mb': 1000,
                    'usage_percentage': random.randint(5, 80)
                },
                'note': '🧪 Datos simulados - NO reales'
            })
        
        # Implementar consulta real
        base_url = credentials.get('IOT_BASE_URL', 'https://api.1ot.com/v1')
        headers = {
            'Authorization': f"Bearer {credentials['IOT_API_KEY']}",
            'Content-Type': 'application/json'
        }
        
        response = requests.get(f"{base_url}/esims/{esim_id}/usage", headers=headers, timeout=10)
        
        if response.status_code == 200:
            usage_data = response.json()
            return JsonResponse({
                'success': True,
                'provider': '1oT',
                'usage_data': usage_data,
                'test_mode': False
            })
        else:
            return JsonResponse({
                'success': False,
                'error': f'Error al consultar uso: {response.status_code}',
                'details': response.text
            }, status=400)
            
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Error interno: {str(e)}'
        }, status=500)
