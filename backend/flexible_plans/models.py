from django.db import models
from decimal import Decimal
import json


class PlanCategory(models.Model):
    """Categorías de planes"""
    name = models.CharField(max_length=50)
    description = models.TextField()
    icon = models.CharField(max_length=50)  # Nombre del icono
    color = models.CharField(max_length=7)  # Color hex
    display_order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['display_order', 'name']
        verbose_name_plural = 'Plan Categories'
    
    def __str__(self):
        return self.name


class FlexiblePlan(models.Model):
    """Planes de datos flexibles y personalizados"""
    # Información básica
    name = models.CharField(max_length=100)
    description = models.TextField()
    category = models.ForeignKey(PlanCategory, on_delete=models.CASCADE, related_name='plans')
    
    # Configuración de datos
    data_amount_gb = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True)  # GB
    is_unlimited = models.BooleanField(default=False)
    
    # Duración flexible
    DURATION_UNITS = [
        ('hours', 'Horas'),
        ('days', 'Días'),
        ('weeks', 'Semanas'),
        ('months', 'Meses')
    ]
    duration_value = models.IntegerField()
    duration_unit = models.CharField(max_length=10, choices=DURATION_UNITS)
    
    # Tipos de plan
    PLAN_TYPES = [
        ('hourly', 'Por Horas'),
        ('daily', 'Diario'),
        ('weekly', 'Semanal'),
        ('monthly', 'Mensual'),
        ('topup', 'Top-up'),
        ('family', 'Familiar'),
        ('corporate', 'Corporativo')
    ]
    plan_type = models.CharField(max_length=20, choices=PLAN_TYPES)
    
    # Precios
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    
    # Precios dinámicos por región
    price_multipliers = models.JSONField(default=dict)  # {'US': 1.0, 'EU': 1.2, 'AS': 0.8}
    
    # Cobertura
    countries = models.ManyToManyField('geolocation.Country', through='PlanCountryCoverage')
    is_regional = models.BooleanField(default=False)
    is_global = models.BooleanField(default=False)
    
    # Características avanzadas
    features = models.JSONField(default=list)  # ['5G', 'Hotspot', 'VoIP']
    network_types = models.JSONField(default=list)  # ['4G', '5G']
    speed_limit_mbps = models.IntegerField(null=True, blank=True)
    
    # Restricciones
    max_devices = models.IntegerField(default=1)
    allows_hotspot = models.BooleanField(default=True)
    allows_voip = models.BooleanField(default=True)
    
    # Configuración familiar/corporativa
    max_family_members = models.IntegerField(default=1)
    family_discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    # Configuración top-up
    is_topup_available = models.BooleanField(default=False)
    topup_increment_gb = models.DecimalField(max_digits=8, decimal_places=3, default=1)
    topup_price_per_gb = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Estado y disponibilidad
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    is_popular = models.BooleanField(default=False)
    availability_start = models.DateTimeField(null=True, blank=True)
    availability_end = models.DateTimeField(null=True, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['category__display_order', 'base_price']
    
    def __str__(self):
        return f"{self.name} - {self.get_duration_display()}"
    
    def get_duration_display(self):
        """Mostrar duración en formato legible"""
        if self.duration_value == 1:
            unit_map = {
                'hours': 'hora',
                'days': 'día',
                'weeks': 'semana',
                'months': 'mes'
            }
        else:
            unit_map = {
                'hours': 'horas',
                'days': 'días',
                'weeks': 'semanas',
                'months': 'meses'
            }
        return f"{self.duration_value} {unit_map.get(self.duration_unit, self.duration_unit)}"
    
    def get_price_for_country(self, country_code):
        """Obtener precio ajustado por país"""
        multiplier = self.price_multipliers.get(country_code, 1.0)
        return self.base_price * Decimal(str(multiplier))
    
    def get_data_display(self):
        """Mostrar cantidad de datos en formato legible"""
        if self.is_unlimited:
            return "Ilimitado"
        elif self.data_amount_gb:
            if self.data_amount_gb < 1:
                return f"{int(self.data_amount_gb * 1000)} MB"
            else:
                return f"{self.data_amount_gb} GB"
        return "Personalizado"


class PlanCountryCoverage(models.Model):
    """Cobertura de planes por país"""
    plan = models.ForeignKey(FlexiblePlan, on_delete=models.CASCADE)
    country = models.ForeignKey('geolocation.Country', on_delete=models.CASCADE)
    
    # Configuración específica por país
    local_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    coverage_quality = models.CharField(max_length=20, choices=[
        ('excellent', 'Excelente'),
        ('good', 'Buena'),
        ('fair', 'Regular'),
        ('limited', 'Limitada')
    ], default='good')
    
    # Operadores disponibles
    available_operators = models.JSONField(default=list)
    primary_operator = models.CharField(max_length=100, null=True, blank=True)
    
    # Restricciones específicas
    allows_5g = models.BooleanField(default=True)
    speed_limit_override = models.IntegerField(null=True, blank=True)
    
    class Meta:
        unique_together = ('plan', 'country')
    
    def __str__(self):
        return f"{self.plan.name} in {self.country.name}"


class CustomPlanBuilder(models.Model):
    """Constructor de planes personalizados"""
    user = models.ForeignKey('auth.User', on_delete=models.CASCADE, related_name='custom_plans')
    name = models.CharField(max_length=100)
    
    # Configuración personalizada
    selected_countries = models.ManyToManyField('geolocation.Country')
    data_amount_gb = models.DecimalField(max_digits=8, decimal_places=3)
    duration_days = models.IntegerField()
    
    # Características seleccionadas
    includes_5g = models.BooleanField(default=True)
    includes_hotspot = models.BooleanField(default=True)
    includes_voip = models.BooleanField(default=True)
    max_devices = models.IntegerField(default=1)
    
    # Precios calculados
    calculated_price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    
    # Estado
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username}'s {self.name}"


class PlanRecommendation(models.Model):
    """Recomendaciones de planes basadas en IA"""
    user = models.ForeignKey('auth.User', on_delete=models.CASCADE, related_name='plan_recommendations')
    plan = models.ForeignKey(FlexiblePlan, on_delete=models.CASCADE)
    
    # Contexto de la recomendación
    recommended_for_country = models.ForeignKey('geolocation.Country', on_delete=models.CASCADE, null=True)
    recommendation_reason = models.CharField(max_length=20, choices=[
        ('location', 'Basado en Ubicación'),
        ('history', 'Historial de Uso'),
        ('popular', 'Popularidad'),
        ('budget', 'Rango de Presupuesto'),
        ('features', 'Características Necesarias')
    ])
    
    # Métricas de recomendación
    confidence_score = models.DecimalField(max_digits=3, decimal_places=2)  # 0.00 - 1.00
    predicted_satisfaction = models.DecimalField(max_digits=3, decimal_places=2)
    
    # Estado
    shown_to_user = models.BooleanField(default=False)
    user_clicked = models.BooleanField(default=False)
    user_purchased = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-confidence_score', '-created_at']
    
    def __str__(self):
        return f"Recommend {self.plan.name} to {self.user.username}"


class PlanComparison(models.Model):
    """Comparaciones guardadas de planes"""
    user = models.ForeignKey('auth.User', on_delete=models.CASCADE, related_name='plan_comparisons')
    name = models.CharField(max_length=100)
    plans = models.ManyToManyField(FlexiblePlan)
    
    # Contexto de comparación
    target_country = models.ForeignKey('geolocation.Country', on_delete=models.CASCADE, null=True)
    comparison_criteria = models.JSONField(default=list)  # ['price', 'data', 'duration']
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username}'s {self.name} comparison"
