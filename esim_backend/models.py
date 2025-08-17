from django.db import models
from django.contrib.auth.models import AbstractUser
from decimal import Decimal
import uuid

class Country(models.Model):
    """Modelo de países disponibles para eSIM"""
    code = models.CharField(max_length=2, unique=True, help_text="Código ISO del país (ej: ES, US)")
    name = models.CharField(max_length=100, help_text="Nombre del país")
    flag_emoji = models.CharField(max_length=10, help_text="Emoji de la bandera")
    region = models.CharField(max_length=50, choices=[
        ('europe', 'Europa'),
        ('north_america', 'América del Norte'),
        ('south_america', 'América del Sur'),
        ('asia', 'Asia'),
        ('africa', 'África'),
        ('oceania', 'Oceanía'),
    ])
    is_popular = models.BooleanField(default=False, help_text="Destino popular")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = "Countries"
        ordering = ['name']
    
    def __str__(self):
        return f"{self.flag_emoji} {self.name}"

class DataPlan(models.Model):
    """Modelo de planes eSIM"""
    PLAN_TYPES = [
        ('country', 'País Individual'),
        ('regional', 'Regional'),
        ('global', 'Global'),
    ]
    
    name = models.CharField(max_length=100, help_text="Nombre del plan")
    slug = models.SlugField(unique=True)
    plan_type = models.CharField(max_length=20, choices=PLAN_TYPES)
    countries = models.ManyToManyField(Country, help_text="Países incluidos")
    
    # Datos y duración
    data_amount_gb = models.IntegerField(help_text="GB incluidos")
    is_unlimited = models.BooleanField(default=False)
    validity_days = models.IntegerField(help_text="Días de validez")
    
    # Precios
    price_usd = models.DecimalField(max_digits=8, decimal_places=2)
    original_price_usd = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    
    # Características
    supports_5g = models.BooleanField(default=True)
    supports_hotspot = models.BooleanField(default=True)
    includes_calls = models.BooleanField(default=False)
    includes_sms = models.BooleanField(default=False)
    
    # Marketing
    is_popular = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    badge_text = models.CharField(max_length=50, blank=True, help_text="Badge especial (ej: MÁS POPULAR)")
    
    # Redes
    network_operators = models.TextField(blank=True, help_text="Operadores de red (ej: Verizon, AT&T)")
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-is_featured', '-is_popular', 'price_usd']
    
    def __str__(self):
        return f"{self.name} - {self.data_amount_gb}GB - ${self.price_usd}"
    
    @property
    def discount_percentage(self):
        if self.original_price_usd and self.original_price_usd > self.price_usd:
            return int(((self.original_price_usd - self.price_usd) / self.original_price_usd) * 100)
        return 0
    
    @property
    def countries_count(self):
        return self.countries.count()

class User(AbstractUser):
    """Usuario extendido para eSIM"""
    phone = models.CharField(max_length=20, blank=True)
    country_code = models.CharField(max_length=2, blank=True)
    preferred_language = models.CharField(max_length=10, default='es')
    is_premium = models.BooleanField(default=False)
    total_orders = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.username or self.email

class Order(models.Model):
    """Modelo de pedidos"""
    ORDER_STATUS = [
        ('pending', 'Pendiente'),
        ('processing', 'Procesando'),
        ('completed', 'Completado'),
        ('failed', 'Fallido'),
        ('refunded', 'Reembolsado'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    plan = models.ForeignKey(DataPlan, on_delete=models.CASCADE)
    
    # Información de pago
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    payment_method = models.CharField(max_length=50)
    payment_id = models.CharField(max_length=200, blank=True)
    
    # Estado del pedido
    status = models.CharField(max_length=20, choices=ORDER_STATUS, default='pending')
    
    # Información del cliente
    customer_email = models.EmailField()
    customer_phone = models.CharField(max_length=20, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Order {self.id} - {self.plan.name}"

class ESim(models.Model):
    """Modelo de eSIM generada"""
    ESIM_STATUS = [
        ('active', 'Activa'),
        ('inactive', 'Inactiva'),
        ('expired', 'Expirada'),
        ('suspended', 'Suspendida'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='esim')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='esims')
    plan = models.ForeignKey(DataPlan, on_delete=models.CASCADE)
    
    # Datos de la eSIM
    iccid = models.CharField(max_length=22, unique=True)
    qr_code = models.TextField(help_text="Código QR para instalación")
    activation_code = models.CharField(max_length=50)
    
    # Estado y uso
    status = models.CharField(max_length=20, choices=ESIM_STATUS, default='inactive')
    data_used_mb = models.BigIntegerField(default=0)
    
    # Fechas importantes
    activated_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"eSIM {self.iccid} - {self.plan.name}"
    
    @property
    def data_used_gb(self):
        return round(self.data_used_mb / 1024, 2)
    
    @property
    def data_remaining_gb(self):
        if self.plan.is_unlimited:
            return "Ilimitado"
        total_mb = self.plan.data_amount_gb * 1024
        remaining_mb = max(0, total_mb - self.data_used_mb)
        return round(remaining_mb / 1024, 2)
