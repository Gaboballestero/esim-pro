from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q, Count
from .models import Country, LocationHistory, TravelPattern, GeofenceAlert
from .serializers import (
    CountrySerializer, LocationHistorySerializer, TravelPatternSerializer,
    GeofenceAlertSerializer, LocationDetectionSerializer, CountrySearchSerializer
)
from .services import GeolocationService


class CountriesListView(generics.ListAPIView):
    """Lista de países con soporte eSIM"""
    serializer_class = CountrySerializer
    permission_classes = []  # Público, sin autenticación requerida
    
    def get_queryset(self):
        queryset = Country.objects.filter(esim_supported=True)
        
        # Filtros
        continent = self.request.query_params.get('continent')
        popular_only = self.request.query_params.get('popular')
        
        if continent:
            queryset = queryset.filter(continent=continent)
        if popular_only == 'true':
            queryset = queryset.filter(is_popular=True)
            
        return queryset


class CountryDetailView(generics.RetrieveAPIView):
    """Detalle de un país específico"""
    serializer_class = CountrySerializer
    permission_classes = []  # Público
    queryset = Country.objects.filter(esim_supported=True)
    lookup_field = 'code'


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def detect_location(request):
    """Detectar ubicación del usuario"""
    serializer = LocationDetectionSerializer(data=request.data)
    
    if serializer.is_valid():
        method = serializer.validated_data['method']
        country = None
        
        if method == 'gps':
            lat = serializer.validated_data.get('latitude')
            lng = serializer.validated_data.get('longitude')
            if lat and lng:
                country = GeolocationService.get_country_by_coordinates(lat, lng)
        
        elif method == 'ip':
            # Obtener IP del request
            ip = request.META.get('HTTP_X_FORWARDED_FOR', '').split(',')[0].strip()
            if not ip:
                ip = request.META.get('REMOTE_ADDR')
            country = GeolocationService.get_country_by_ip(ip)
        
        if country:
            # Registrar ubicación
            location = GeolocationService.record_location(
                user=request.user,
                country=country,
                method=method,
                **serializer.validated_data
            )
            
            # Crear alerta si es roaming
            if location.is_roaming:
                GeolocationService.create_roaming_alert(request.user, country)
            
            return Response({
                'country': CountrySerializer(country).data,
                'is_roaming': location.is_roaming,
                'recommended_plans': GeolocationService.get_recommended_plans(country, request.user)
            })
        else:
            return Response({
                'error': 'No se pudo detectar la ubicación'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LocationHistoryView(generics.ListAPIView):
    """Historial de ubicaciones del usuario"""
    serializer_class = LocationHistorySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return LocationHistory.objects.filter(user=self.request.user)


class TravelPatternView(generics.RetrieveUpdateAPIView):
    """Patrones de viaje del usuario"""
    serializer_class = TravelPatternSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        pattern, created = TravelPattern.objects.get_or_create(user=self.request.user)
        return pattern


class GeofenceAlertsView(generics.ListAPIView):
    """Alertas de geolocalización activas"""
    serializer_class = GeofenceAlertSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return GeofenceAlert.objects.filter(
            user=self.request.user,
            is_active=True,
            acknowledged=False
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def acknowledge_alert(request, alert_id):
    """Marcar alerta como vista"""
    try:
        alert = GeofenceAlert.objects.get(id=alert_id, user=request.user)
        alert.acknowledged = True
        alert.save()
        
        return Response({'message': 'Alerta marcada como vista'})
    except GeofenceAlert.DoesNotExist:
        return Response({'error': 'Alerta no encontrada'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def travel_stats(request):
    """Estadísticas de viaje del usuario"""
    stats = GeolocationService.get_user_travel_stats(request.user)
    return Response(stats)


@api_view(['POST'])
def search_countries(request):
    """Buscar países"""
    serializer = CountrySearchSerializer(data=request.data)
    
    if serializer.is_valid():
        query = serializer.validated_data['query']
        continent = serializer.validated_data.get('continent')
        esim_only = serializer.validated_data.get('esim_only', True)
        
        queryset = Country.objects.all()
        
        if esim_only:
            queryset = queryset.filter(esim_supported=True)
        
        if continent:
            queryset = queryset.filter(continent=continent)
        
        # Buscar por nombre o código
        queryset = queryset.filter(
            Q(name__icontains=query) | 
            Q(code__icontains=query) |
            Q(code_3__icontains=query)
        )
        
        serializer = CountrySerializer(queryset[:10], many=True)
        return Response(serializer.data)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
