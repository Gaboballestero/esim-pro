"""
API ViewSets completos para la tienda eSIM
"""

from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Country, DataPlan, Order, ESim, User
from .serializers import (
    CountrySerializer, DataPlanListSerializer, DataPlanDetailSerializer,
    OrderSerializer, OrderCreateSerializer, ESimSerializer,
    UserRegistrationSerializer, UserProfileSerializer, PlanFilterSerializer
)

# Legacy imports for backwards compatibility
import os
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils.decorators import method_decorator
from django.views import View
import logging

logger = logging.getLogger(__name__)

# ===== NUEVAS API VIEWSETS PARA LA TIENDA =====

class CountryViewSet(viewsets.ReadOnlyModelViewSet):
    """API para países disponibles"""
    queryset = Country.objects.filter(is_active=True)
    serializer_class = CountrySerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'code']
    ordering_fields = ['name', 'region']
    
    @action(detail=False, methods=['get'])
    def popular(self, request):
        """Obtener países populares"""
        popular_countries = self.queryset.filter(is_popular=True)
        serializer = self.get_serializer(popular_countries, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def regions(self, request):
        """Obtener países agrupados por región"""
        regions = {}
        for country in self.queryset.all():
            if country.region not in regions:
                regions[country.region] = []
            regions[country.region].append(CountrySerializer(country).data)
        return Response(regions)

class DataPlanViewSet(viewsets.ReadOnlyModelViewSet):
    """API para planes eSIM"""
    queryset = DataPlan.objects.filter(is_active=True)
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'countries__name', 'countries__code']
    ordering_fields = ['price_usd', 'data_amount_gb', 'validity_days', 'created_at']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return DataPlanDetailSerializer
        return DataPlanListSerializer
    
    @action(detail=False, methods=['post'])
    def filter(self, request):
        """Filtrar planes con parámetros avanzados"""
        filter_serializer = PlanFilterSerializer(data=request.data)
        if not filter_serializer.is_valid():
            return Response(filter_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        filters = filter_serializer.validated_data
        queryset = self.get_queryset()
        
        # Filtros por países
        if 'countries' in filters:
            queryset = queryset.filter(countries__code__in=filters['countries']).distinct()
        
        # Filtros por datos
        if 'min_data' in filters:
            queryset = queryset.filter(data_amount_gb__gte=filters['min_data'])
        if 'max_data' in filters:
            queryset = queryset.filter(data_amount_gb__lte=filters['max_data'])
        
        # Filtros por duración
        if 'min_days' in filters:
            queryset = queryset.filter(validity_days__gte=filters['min_days'])
        if 'max_days' in filters:
            queryset = queryset.filter(validity_days__lte=filters['max_days'])
        
        # Filtros por precio
        if 'min_price' in filters:
            queryset = queryset.filter(price_usd__gte=filters['min_price'])
        if 'max_price' in filters:
            queryset = queryset.filter(price_usd__lte=filters['max_price'])
        
        # Filtros por tipo
        if 'plan_type' in filters:
            queryset = queryset.filter(plan_type=filters['plan_type'])
        
        # Filtros por características
        if 'supports_5g' in filters:
            queryset = queryset.filter(supports_5g=filters['supports_5g'])
        if 'supports_hotspot' in filters:
            queryset = queryset.filter(supports_hotspot=filters['supports_hotspot'])
        if 'includes_calls' in filters:
            queryset = queryset.filter(includes_calls=filters['includes_calls'])
        if 'includes_sms' in filters:
            queryset = queryset.filter(includes_sms=filters['includes_sms'])
        
        # Filtros por marketing
        if 'is_popular' in filters:
            queryset = queryset.filter(is_popular=filters['is_popular'])
        if 'is_featured' in filters:
            queryset = queryset.filter(is_featured=filters['is_featured'])
        
        # Búsqueda por texto
        if 'search' in filters:
            search_term = filters['search']
            queryset = queryset.filter(
                Q(name__icontains=search_term) |
                Q(countries__name__icontains=search_term) |
                Q(network_operators__icontains=search_term)
            ).distinct()
        
        # Paginación
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'count': queryset.count(),
            'results': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Obtener planes destacados"""
        featured_plans = self.queryset.filter(is_featured=True)[:6]
        serializer = self.get_serializer(featured_plans, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def popular(self, request):
        """Obtener planes populares"""
        popular_plans = self.queryset.filter(is_popular=True)[:8]
        serializer = self.get_serializer(popular_plans, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_country(self, request):
        """Obtener planes por país"""
        country_code = request.query_params.get('country')
        if not country_code:
            return Response(
                {'error': 'Parámetro country es requerido'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        plans = self.queryset.filter(countries__code=country_code)
        serializer = self.get_serializer(plans, many=True)
        return Response(serializer.data)

class OrderViewSet(viewsets.ModelViewSet):
    """API para pedidos"""
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return OrderCreateSerializer
        return OrderSerializer
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancelar pedido"""
        order = self.get_object()
        if order.status in ['pending', 'processing']:
            order.status = 'failed'
            order.save()
            return Response({'message': 'Pedido cancelado'})
        return Response(
            {'error': 'No se puede cancelar este pedido'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

class ESimViewSet(viewsets.ReadOnlyModelViewSet):
    """API para eSIMs del usuario"""
    serializer_class = ESimSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ESim.objects.filter(user=self.request.user)
    
    @action(detail=True, methods=['get'])
    def qr_code(self, request, pk=None):
        """Obtener código QR de la eSIM"""
        esim = self.get_object()
        return Response({
            'qr_code': esim.qr_code,
            'activation_code': esim.activation_code,
            'iccid': esim.iccid
        })
    
    @action(detail=True, methods=['get'])
    def usage(self, request, pk=None):
        """Obtener uso de datos de la eSIM"""
        esim = self.get_object()
        return Response({
            'data_used_gb': esim.data_used_gb,
            'data_remaining_gb': esim.data_remaining_gb,
            'total_data_gb': esim.plan.data_amount_gb,
            'is_unlimited': esim.plan.is_unlimited,
            'expires_at': esim.expires_at,
            'status': esim.status
        })

class UserViewSet(viewsets.ModelViewSet):
    """API para gestión de usuarios"""
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return User.objects.filter(id=self.request.user.id)
    
    def get_object(self):
        return self.request.user
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def register(self, request):
        """Registro de nuevo usuario"""
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {'message': 'Usuario creado exitosamente', 'user_id': user.id},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def profile(self, request):
        """Obtener perfil del usuario autenticado"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['put', 'patch'])
    def update_profile(self, request):
        """Actualizar perfil del usuario"""
        serializer = self.get_serializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ===== LEGACY FUNCTIONS FOR BACKWARDS COMPATIBILITY =====

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
