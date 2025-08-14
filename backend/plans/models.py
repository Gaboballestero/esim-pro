from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator


class Country(models.Model):
    """Países disponibles para eSIM"""
    
    name = models.CharField(_('name'), max_length=100)
    iso_code = models.CharField(_('ISO code'), max_length=3, unique=True)
    flag_emoji = models.CharField(_('flag emoji'), max_length=10, blank=True)
    currency = models.CharField(_('currency'), max_length=10)
    is_active = models.BooleanField(_('is active'), default=True)
    
    class Meta:
        verbose_name = _('Country')
        verbose_name_plural = _('Countries')
        ordering = ['name']
        
    def __str__(self):
        return f"{self.name} ({self.iso_code})"


class DataPlan(models.Model):
    """Planes de datos eSIM"""
    
    PLAN_TYPE_CHOICES = [
        ('data_only', _('Solo Datos')),
        ('data_sms', _('Datos + SMS')),
        ('data_voice_sms', _('Datos + Voz + SMS')),
        ('unlimited', _('Ilimitado')),
    ]
    
    VALIDITY_CHOICES = [
        (1, _('1 día')),
        (3, _('3 días')),
        (7, _('7 días')),
        (15, _('15 días')),
        (30, _('30 días')),
        (60, _('60 días')),
        (90, _('90 días')),
    ]
    
    name = models.CharField(_('name'), max_length=200)
    description = models.TextField(_('description'), blank=True)
    countries = models.ManyToManyField(Country, verbose_name=_('countries'))
    
    # Características del plan
    data_amount = models.PositiveIntegerField(
        _('data amount (MB)'), 
        validators=[MinValueValidator(100)]
    )
    plan_type = models.CharField(
        _('plan type'), 
        max_length=20, 
        choices=PLAN_TYPE_CHOICES,
        default='data_only'
    )
    validity_days = models.PositiveIntegerField(
        _('validity days'), 
        choices=VALIDITY_CHOICES
    )
    
    # Precios
    price = models.DecimalField(_('price'), max_digits=10, decimal_places=2)
    discount_price = models.DecimalField(
        _('discount price'), 
        max_digits=10, 
        decimal_places=2,
        null=True, 
        blank=True
    )
    
    # Configuración
    is_popular = models.BooleanField(_('is popular'), default=False)
    is_active = models.BooleanField(_('is active'), default=True)
    max_speed = models.CharField(_('max speed'), max_length=20, default='4G/LTE')
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('Data Plan')
        verbose_name_plural = _('Data Plans')
        ordering = ['price']
        
    def __str__(self):
        return f"{self.name} - {self.data_amount}MB - {self.validity_days} días"
    
    @property
    def effective_price(self):
        """Precio efectivo (con descuento si aplica)"""
        return self.discount_price if self.discount_price else self.price
    
    @property
    def discount_percentage(self):
        """Porcentaje de descuento"""
        if self.discount_price and self.discount_price < self.price:
            return int(((self.price - self.discount_price) / self.price) * 100)
        return 0


class PlanFeature(models.Model):
    """Características adicionales de los planes"""
    
    plan = models.ForeignKey(DataPlan, on_delete=models.CASCADE, related_name='features')
    feature_name = models.CharField(_('feature name'), max_length=100)
    feature_description = models.TextField(_('feature description'), blank=True)
    is_highlighted = models.BooleanField(_('is highlighted'), default=False)
    
    class Meta:
        verbose_name = _('Plan Feature')
        verbose_name_plural = _('Plan Features')
        
    def __str__(self):
        return f"{self.plan.name} - {self.feature_name}"
