"""
Vista API para gestión de eSIMs con integración Airalo
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.core.cache import cache
from django.utils import timezone
import logging

from ..services.esim_providers.airalo_service import airalo_service
from ..models import DataPlan, ESim, Order, Payment
from ..serializers import DataPlanSerializer, ESimSerializer

logger = logging.getLogger(__name__)

class DataPlansAPIView(APIView):
    """API para obtener planes de datos disponibles"""
    
    def get(self, request):
        """Obtener todos los planes disponibles"""
        try:
            # Intentar obtener desde cache primero
            cache_key = 'hablaris_data_plans'
            cached_plans = cache.get(cache_key)
            
            if cached_plans:
                return Response({
                    'success': True,
                    'data': cached_plans,
                    'source': 'cache'
                })
            
            # Obtener desde Airalo
            countries = airalo_service.get_countries()
            packages = airalo_service.get_packages()
            
            # Procesar y formatear datos
            formatted_plans = []
            for package in packages:
                plan_data = {
                    'id': package.get('id'),
                    'title': package.get('title'),
                    'country': package.get('country'),
                    'country_code': package.get('country_code'),
                    'flag': self.get_country_flag(package.get('country_code')),
                    'operator': package.get('operator', {}).get('title', 'Múltiples'),
                    'data': package.get('data'),
                    'validity': package.get('validity'),
                    'price': package.get('price'),
                    'currency': package.get('currency', 'USD'),
                    'type': package.get('type', 'data'),
                    'coverage': package.get('coverage', []),
                    'features': {
                        'hotspot': package.get('is_hotspot_available', False),
                        'voice': package.get('is_voice_available', False),
                        'sms': package.get('is_sms_available', False),
                    }
                }
                formatted_plans.append(plan_data)
            
            # Guardar en cache por 1 hora
            cache.set(cache_key, formatted_plans, 3600)
            
            return Response({
                'success': True,
                'data': formatted_plans,
                'count': len(formatted_plans),
                'source': 'api'
            })
            
        except Exception as e:
            logger.error(f"Error obteniendo planes: {str(e)}")
            return Response({
                'success': False,
                'error': 'Error obteniendo planes de datos'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def get_country_flag(self, country_code):
        """Obtener emoji de bandera del país"""
        flag_map = {
            'ES': '🇪🇸', 'US': '🇺🇸', 'FR': '🇫🇷', 'DE': '🇩🇪', 'IT': '🇮🇹',
            'GB': '🇬🇧', 'JP': '🇯🇵', 'CN': '🇨🇳', 'KR': '🇰🇷', 'BR': '🇧🇷',
            'MX': '🇲🇽', 'AR': '🇦🇷', 'CA': '🇨🇦', 'AU': '🇦🇺', 'NZ': '🇳🇿',
            'IN': '🇮🇳', 'TH': '🇹🇭', 'SG': '🇸🇬', 'MY': '🇲🇾', 'ID': '🇮🇩'
        }
        return flag_map.get(country_code, '🌍')

class PurchaseESimAPIView(APIView):
    """API para comprar eSIM"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Procesar compra de eSIM"""
        try:
            package_id = request.data.get('package_id')
            payment_method = request.data.get('payment_method')
            
            if not package_id:
                return Response({
                    'success': False,
                    'error': 'package_id es requerido'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # 1. Crear orden en Airalo
            airalo_order = airalo_service.create_order(package_id)
            
            if not airalo_order:
                return Response({
                    'success': False,
                    'error': 'Error creando orden en proveedor'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # 2. Crear orden en nuestra base de datos
            order = Order.objects.create(
                user=request.user,
                provider_order_id=airalo_order.get('id'),
                package_id=package_id,
                amount=airalo_order.get('price', 0),
                currency=airalo_order.get('currency', 'USD'),
                status='pending'
            )
            
            # 3. Procesar pago (simulado por ahora)
            payment = Payment.objects.create(
                order=order,
                user=request.user,
                amount=order.amount,
                currency=order.currency,
                payment_method=payment_method,
                status='completed'  # En producción: procesamiento real
            )
            
            # 4. Si el pago es exitoso, obtener detalles del eSIM
            if payment.status == 'completed':
                # Obtener eSIMs de la orden
                esims_data = airalo_order.get('sims', [])
                
                created_esims = []
                for esim_data in esims_data:
                    esim = ESim.objects.create(
                        user=request.user,
                        order=order,
                        provider_esim_id=esim_data.get('id'),
                        iccid=esim_data.get('iccid'),
                        qr_code=esim_data.get('qr_code'),
                        activation_code=esim_data.get('manual_activation', {}).get('code'),
                        status='ready'
                    )
                    created_esims.append(esim)
                
                # Actualizar estado de orden
                order.status = 'completed'
                order.save()
                
                # Serializar eSIMs creados
                esims_serializer = ESimSerializer(created_esims, many=True)
                
                return Response({
                    'success': True,
                    'order_id': order.id,
                    'esims': esims_serializer.data,
                    'message': 'eSIM comprado exitosamente'
                })
            
            else:
                return Response({
                    'success': False,
                    'error': 'Error procesando pago'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.error(f"Error en compra eSIM: {str(e)}")
            return Response({
                'success': False,
                'error': 'Error interno procesando compra'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ESimUsageAPIView(APIView):
    """API para obtener uso de eSIM"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, esim_id):
        """Obtener estadísticas de uso de eSIM"""
        try:
            # Verificar que el eSIM pertenece al usuario
            esim = ESim.objects.get(
                id=esim_id, 
                user=request.user
            )
            
            # Obtener datos de uso desde Airalo
            usage_data = airalo_service.get_usage_statistics(
                esim.provider_esim_id
            )
            
            if usage_data:
                # Actualizar datos locales
                esim.data_used = usage_data.get('data_used', 0)
                esim.last_updated = timezone.now()
                esim.save()
                
                return Response({
                    'success': True,
                    'data': {
                        'esim_id': esim.id,
                        'data_used': usage_data.get('data_used', 0),
                        'data_remaining': usage_data.get('data_remaining', 0),
                        'validity_remaining': usage_data.get('validity_remaining', 0),
                        'status': usage_data.get('status', 'unknown'),
                        'last_updated': esim.last_updated
                    }
                })
            else:
                return Response({
                    'success': False,
                    'error': 'No se pudo obtener datos de uso'
                }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
                
        except ESim.DoesNotExist:
            return Response({
                'success': False,
                'error': 'eSIM no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error obteniendo uso eSIM: {str(e)}")
            return Response({
                'success': False,
                'error': 'Error obteniendo estadísticas'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
