from django.db import models
from django.conf import settings
import json


class Country(models.Model):
    """Información de países soportados"""
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=2, unique=True, db_index=True)  # ISO 2
    code_3 = models.CharField(max_length=3, unique=True)  # ISO 3
    continent = models.CharField(max_length=50)
    region = models.CharField(max_length=100)
    currency = models.CharField(max_length=3)
    language = models.CharField(max_length=10)
    timezone = models.CharField(max_length=50)
    calling_code = models.CharField(max_length=10)
    
    # Coordenadas del centro del país
    latitude = models.DecimalField(max_digits=10, decimal_places=7)
    longitude = models.DecimalField(max_digits=10, decimal_places=7)
    
    # eSIM Support
    esim_supported = models.BooleanField(default=False)
    coverage_quality = models.CharField(max_length=20, choices=[
        ('excellent', 'Excelente'),
        ('good', 'Buena'),
        ('fair', 'Regular'),
        ('poor', 'Limitada')
    ], default='good')
    
    # Metadata
    flag_emoji = models.CharField(max_length=10)
    is_popular = models.BooleanField(default=False)
    display_order = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['display_order', 'name']
        verbose_name_plural = 'Countries'
    
    def __str__(self):
        return f"{self.flag_emoji} {self.name}"


class NetworkOperator(models.Model):
    """Operadores de red por país"""
    name = models.CharField(max_length=100)
    country = models.ForeignKey(Country, on_delete=models.CASCADE, related_name='operators')
    network_type = models.CharField(max_length=10, choices=[
        ('4G', '4G LTE'),
        ('5G', '5G'),
        ('3G', '3G')
    ])
    frequency_bands = models.JSONField(default=list)  # Lista de bandas de frecuencia
    coverage_percentage = models.DecimalField(max_digits=5, decimal_places=2)  # % de cobertura
    is_primary = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.name} ({self.country.name})"


class LocationHistory(models.Model):
    """Historial de ubicaciones del usuario"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='location_history')
    country = models.ForeignKey(Country, on_delete=models.CASCADE)
    city = models.CharField(max_length=100, null=True, blank=True)
    latitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    longitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    
    # Detección automática
    detected_at = models.DateTimeField(auto_now_add=True)
    detection_method = models.CharField(max_length=20, choices=[
        ('gps', 'GPS'),
        ('ip', 'IP Address'),
        ('manual', 'Manual'),
        ('cell_tower', 'Cell Tower')
    ])
    accuracy = models.IntegerField(null=True, blank=True)  # metros
    
    # Contexto
    is_roaming = models.BooleanField(default=False)
    # esim_active = models.ForeignKey('esims.ESim', on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        ordering = ['-detected_at']
    
    def __str__(self):
        return f"{self.user.username} in {self.country.name} at {self.detected_at}"


class TravelPattern(models.Model):
    """Patrones de viaje del usuario para recomendaciones"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='travel_patterns')
    
    # Países frecuentes
    frequent_countries = models.ManyToManyField(Country, blank=True)
    preferred_regions = models.JSONField(default=list)  # ['Europe', 'Asia']
    
    # Patrones de uso
    average_trip_duration = models.IntegerField(default=7)  # días
    typical_data_usage = models.CharField(max_length=20, choices=[
        ('light', 'Ligero (< 1GB)'),
        ('moderate', 'Moderado (1-5GB)'),
        ('heavy', 'Intenso (> 5GB)')
    ], default='moderate')
    
    # Preferencias
    prefers_unlimited = models.BooleanField(default=False)
    budget_range = models.CharField(max_length=20, choices=[
        ('budget', 'Económico ($5-15)'),
        ('standard', 'Estándar ($15-30)'),
        ('premium', 'Premium ($30+)')
    ], default='standard')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username}'s travel pattern"


class GeofenceAlert(models.Model):
    """Alertas basadas en geolocalización"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='geofence_alerts')
    country = models.ForeignKey(Country, on_delete=models.CASCADE)
    
    # Configuración de alerta
    alert_type = models.CharField(max_length=20, choices=[
        ('roaming', 'Roaming Detectado'),
        ('plan_suggestion', 'Sugerencia de Plan'),
        ('data_warning', 'Advertencia de Datos'),
        ('welcome', 'Bienvenida al País')
    ])
    
    # Estado
    is_active = models.BooleanField(default=True)
    triggered_at = models.DateTimeField(null=True, blank=True)
    acknowledged = models.BooleanField(default=False)
    
    # Mensaje personalizado
    title = models.CharField(max_length=100)
    message = models.TextField()
    action_button = models.CharField(max_length=50, null=True, blank=True)
    action_url = models.CharField(max_length=200, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.alert_type} for {self.user.username} in {self.country.name}"


class IPGeolocation(models.Model):
    """Cache de geolocalización por IP"""
    ip_address = models.GenericIPAddressField(unique=True, db_index=True)
    country = models.ForeignKey(Country, on_delete=models.CASCADE)
    city = models.CharField(max_length=100, null=True, blank=True)
    region = models.CharField(max_length=100, null=True, blank=True)
    
    # Coordenadas
    latitude = models.DecimalField(max_digits=10, decimal_places=7)
    longitude = models.DecimalField(max_digits=10, decimal_places=7)
    
    # ISP Info
    isp = models.CharField(max_length=100, null=True, blank=True)
    org = models.CharField(max_length=100, null=True, blank=True)
    
    # Cache metadata
    last_updated = models.DateTimeField(auto_now=True)
    source = models.CharField(max_length=50)  # 'ipapi', 'maxmind', etc.
    accuracy_radius = models.IntegerField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.ip_address} -> {self.country.name}"
