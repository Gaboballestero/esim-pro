"""
API Views para tests de Twilio Super SIM
"""

import os
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils.decorators import method_decorator
from django.views import View
import logging

logger = logging.getLogger(__name__)

def load_twilio_credentials():
    """Cargar credenciales de Twilio desde .env.twilio"""
    try:
        env_file = os.path.join(os.path.dirname(__file__), '..', '..', '.env.twilio')
        credentials = {}
        
        if os.path.exists(env_file):
            with open(env_file, 'r') as f:
                for line in f:
                    if '=' in line and not line.startswith('#'):
                        key, value = line.strip().split('=', 1)
                        credentials[key] = value.strip('"\'')
        
        return credentials
    except Exception as e:
        logger.error(f"Error loading Twilio credentials: {e}")
        return {}

@csrf_exempt
@require_http_methods(["GET"])
def test_credentials(request):
    """Probar credenciales de Twilio"""
    try:
        credentials = load_twilio_credentials()
        
        # Verificar si estamos en modo test
        if credentials.get('TWILIO_TEST_MODE') == 'true':
            return JsonResponse({
                'success': True,
                'message': 'Modo TEST activado - Simulación exitosa',
                'test_mode': True,
                'account_info': {
                    'friendly_name': 'Cuenta Test Hablaris',
                    'status': 'active',
                    'type': 'Trial',
                    'account_sid': 'AC...test...'
                },
                'api_version': '2010-04-01',
                'timestamp': 'Simulado',
                'note': '🧪 Esta es una simulación - NO conecta con Twilio real'
            })
        
        if not credentials.get('TWILIO_ACCOUNT_SID') or not credentials.get('TWILIO_AUTH_TOKEN'):
            return JsonResponse({
                'success': False,
                'error': 'Credenciales de Twilio no encontradas',
                'details': 'Verifica el archivo .env.twilio'
            }, status=400)
        
        # Intentar importar y usar Twilio
        try:
            from twilio.rest import Client
            
            client = Client(
                credentials['TWILIO_ACCOUNT_SID'], 
                credentials['TWILIO_AUTH_TOKEN']
            )
            
            # Probar conexión obteniendo información de la cuenta
            account = client.api.accounts(credentials['TWILIO_ACCOUNT_SID']).fetch()
            
            return JsonResponse({
                'success': True,
                'message': 'Conexión exitosa con Twilio',
                'account_info': {
                    'friendly_name': account.friendly_name,
                    'status': account.status,
                    'type': account.type,
                    'account_sid': credentials['TWILIO_ACCOUNT_SID'][:10] + '...'
                },
                'api_version': getattr(account, 'api_version', 'N/A'),
                'timestamp': str(account.date_updated) if hasattr(account, 'date_updated') else 'N/A'
            })
            
        except ImportError:
            return JsonResponse({
                'success': False,
                'error': 'Librería Twilio no instalada',
                'solution': 'Ejecuta: pip install twilio'
            }, status=500)
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': f'Error al conectar con Twilio: {str(e)}',
                'credentials_found': True,
                'account_sid': credentials['TWILIO_ACCOUNT_SID'][:10] + '...'
            }, status=400)
            
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Error interno: {str(e)}'
        }, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def create_esim(request):
    """Crear una eSIM de prueba con Twilio"""
    try:
        data = json.loads(request.body)
        credentials = load_twilio_credentials()
        
        # Verificar si estamos en modo test
        if credentials.get('TWILIO_TEST_MODE') == 'true':
            # Simular creación exitosa de eSIM
            import random
            import string
            
            sim_id = 'DE' + ''.join(random.choices(string.digits + string.ascii_uppercase, k=32))
            unique_name = f"hablaris_test_{data.get('email', 'test')}_{random.randint(1000, 9999)}"
            
            return JsonResponse({
                'success': True,
                'message': 'eSIM creada exitosamente (MODO TEST)',
                'sim_sid': sim_id,
                'unique_name': unique_name,
                'status': 'active',
                'test_mode': True,
                'qr_code': f"data:text/plain;base64,SIMULADO_QR_{sim_id}",
                'details': {
                    'country': data.get('country', 'N/A'),
                    'data_plan': data.get('data_plan', 'N/A'),
                    'customer_email': data.get('email', 'N/A'),
                    'customer_name': data.get('customer_name', 'Test User')
                },
                'note': '🧪 Esta es una eSIM simulada - NO es real'
            })
        
        if not credentials.get('TWILIO_ACCOUNT_SID') or not credentials.get('TWILIO_AUTH_TOKEN'):
            return JsonResponse({
                'success': False,
                'error': 'Credenciales de Twilio no configuradas'
            }, status=400)
        
        try:
            from twilio.rest import Client
            
            client = Client(
                credentials['TWILIO_ACCOUNT_SID'], 
                credentials['TWILIO_AUTH_TOKEN']
            )
            
            # Crear SIM real con Twilio Super SIM usando Fleet
            try:
                # Primero, intentar crear o usar una fleet existente
                fleets = client.supersim.v1.fleets.list(limit=1)
                
                if fleets:
                    fleet_sid = fleets[0].sid
                    print(f"Usando fleet existente: {fleet_sid}")
                else:
                    # Crear nueva fleet
                    fleet = client.supersim.v1.fleets.create(
                        unique_name="hablaris_fleet",
                        data_enabled=True,
                        data_limit=1073741824  # 1GB en bytes
                    )
                    fleet_sid = fleet.sid
                    print(f"Fleet creada: {fleet_sid}")
                
                # Ahora crear la SIM asociada a la fleet
                sim = client.supersim.v1.sims.create(
                    fleet=fleet_sid
                )
                
            except Exception as fleet_error:
                # Si falla con fleet, probar sin parámetros (para cuentas trial)
                print(f"Error con fleet: {fleet_error}")
                return JsonResponse({
                    'success': False,
                    'error': f'Error: Tu cuenta Twilio trial no tiene permisos para Super SIM o necesita configuración adicional',
                    'twilio_error': str(fleet_error),
                    'solution': 'Contacta soporte de Twilio para habilitar Super SIM en tu cuenta'
                }, status=400)
            
            return JsonResponse({
                'success': True,
                'message': 'eSIM creada exitosamente',
                'sim_sid': sim.sid,
                'sim_unique_name': getattr(sim, 'unique_name', f'hablaris_{sim.sid[-8:]}'),
                'status': sim.status,
                'test_mode': False,
                'details': {
                    'country': data.get('country', 'N/A'),
                    'data_plan': data.get('data_plan', 'N/A'),
                    'customer_email': data.get('email', 'N/A')
                },
                'qr_code_url': f"https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=LPA:1${sim.sid}",
                'activation_code': f"LPA:1${sim.sid}",
                'next_steps': [
                    "Escanea el código QR con tu dispositivo",
                    "O ingresa el código de activación manualmente",
                    "La eSIM se activará automáticamente"
                ]
            })
            
        except ImportError:
            return JsonResponse({
                'success': False,
                'error': 'Librería Twilio no instalada'
            }, status=500)
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': f'Error al crear eSIM: {str(e)}',
                'test_mode': True,
                'suggestion': 'Verifica que tienes permisos para Super SIM en tu cuenta Twilio'
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
def check_usage(request, sim_sid):
    """Consultar uso de una eSIM"""
    try:
        credentials = load_twilio_credentials()
        
        # Verificar si estamos en modo test
        if credentials.get('TWILIO_TEST_MODE') == 'true':
            # Simular datos de uso
            import random
            from datetime import datetime, timedelta
            
            return JsonResponse({
                'success': True,
                'test_mode': True,
                'sim_info': {
                    'sid': sim_sid,
                    'unique_name': f'hablaris_test_sim_{sim_sid[-8:]}',
                    'status': 'active',
                    'date_created': str(datetime.now() - timedelta(days=random.randint(1, 30))),
                    'date_updated': str(datetime.now())
                },
                'usage_records': [
                    {
                        'period': f'2025-0{i+1}-01',
                        'download': random.randint(50000000, 500000000),  # bytes
                        'upload': random.randint(5000000, 50000000),     # bytes
                        'download_mb': round(random.uniform(50, 500), 2),
                        'upload_mb': round(random.uniform(5, 50), 2)
                    } for i in range(3)
                ],
                'total_records': 3,
                'note': '🧪 Datos simulados - NO reales'
            })
        
        if not credentials.get('TWILIO_ACCOUNT_SID') or not credentials.get('TWILIO_AUTH_TOKEN'):
            return JsonResponse({
                'success': False,
                'error': 'Credenciales de Twilio no configuradas'
            }, status=400)
        
        try:
            from twilio.rest import Client
            
            client = Client(
                credentials['TWILIO_ACCOUNT_SID'], 
                credentials['TWILIO_AUTH_TOKEN']
            )
            
            # Obtener información de la SIM
            sim = client.supersim.v1.sims(sim_sid).fetch()
            
            # Obtener registros de uso
            usage_records = client.supersim.v1.usage_records.list(
                sim_sid=sim_sid,
                limit=10
            )
            
            return JsonResponse({
                'success': True,
                'test_mode': False,
                'sim_info': {
                    'sid': sim.sid,
                    'unique_name': sim.unique_name,
                    'status': sim.status,
                    'date_created': str(sim.date_created),
                    'date_updated': str(sim.date_updated)
                },
                'usage_records': [
                    {
                        'period': str(record.period),
                        'download': record.download,
                        'upload': record.upload,
                        'download_mb': round(record.download / 1024 / 1024, 2),
                        'upload_mb': round(record.upload / 1024 / 1024, 2)
                    } for record in usage_records
                ],
                'total_records': len(usage_records)
            })
            
        except ImportError:
            return JsonResponse({
                'success': False,
                'error': 'Librería Twilio no instalada'
            }, status=500)
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': f'Error al consultar uso: {str(e)}',
                'sim_sid': sim_sid
            }, status=400)
            
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Error interno: {str(e)}'
        }, status=500)

# API Root para verificación
@csrf_exempt
@require_http_methods(["GET"])
def api_root(request):
    """Endpoint raíz de la API"""
    return JsonResponse({
        'message': 'Hablaris eSIM API - Funcionando',
        'version': '1.0.0',
        'endpoints': {
            'test_credentials': '/api/test-credentials/',
            'create_esim': '/api/esim/create/',
            'check_usage': '/api/esim/usage/{sim_sid}/'
        },
        'status': 'online',
        'twilio_configured': bool(load_twilio_credentials().get('TWILIO_ACCOUNT_SID'))
    })
