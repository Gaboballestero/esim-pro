from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from plans.models import DataPlan
import uuid


class ESim(models.Model):
    """Modelo principal para eSIM"""
    
    STATUS_CHOICES = [
        ('created', _('Creada')),
        ('activated', _('Activada')),
        ('active', _('Activa')),
        ('suspended', _('Suspendida')),
        ('expired', _('Expirada')),
        ('cancelled', _('Cancelada')),
    ]
    
    # Identificadores únicos
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    iccid = models.CharField(_('ICCID'), max_length=22, unique=True)
    smdp_address = models.CharField(_('SM-DP+ Address'), max_length=255)
    activation_code = models.TextField(_('activation code'))
    
    # Relaciones
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='esims'
    )
    plan = models.ForeignKey(DataPlan, on_delete=models.CASCADE)
    order = models.OneToOneField(
        'payments.Order', 
        on_delete=models.CASCADE, 
        related_name='esim',
        null=True, 
        blank=True
    )
    
    # Estado y configuración
    status = models.CharField(
        _('status'), 
        max_length=20, 
        choices=STATUS_CHOICES,
        default='created'
    )
    nickname = models.CharField(_('nickname'), max_length=100, blank=True)
    
    # Datos de uso
    data_used = models.PositiveIntegerField(_('data used (MB)'), default=0)
    last_usage_update = models.DateTimeField(_('last usage update'), null=True, blank=True)
    
    # Fechas importantes
    created_at = models.DateTimeField(auto_now_add=True)
    activated_at = models.DateTimeField(_('activated at'), null=True, blank=True)
    expires_at = models.DateTimeField(_('expires at'), null=True, blank=True)
    
    # Metadata del proveedor
    provider_esim_id = models.CharField(_('provider eSIM ID'), max_length=100, blank=True)
    provider_order_id = models.CharField(_('provider order ID'), max_length=100, blank=True)
    
    class Meta:
        verbose_name = _('eSIM')
        verbose_name_plural = _('eSIMs')
        ordering = ['-created_at']
        
    def __str__(self):
        return f"eSIM {self.iccid} - {self.user.email}"
    
    @property
    def data_remaining(self):
        """Datos restantes en MB"""
        return max(0, self.plan.data_amount - self.data_used)
    
    @property
    def usage_percentage(self):
        """Porcentaje de uso de datos"""
        if self.plan.data_amount == 0:
            return 0
        return min(100, (self.data_used / self.plan.data_amount) * 100)
    
    @property
    def is_active(self):
        """Verifica si la eSIM está activa"""
        return self.status in ['activated', 'active']


class ESimUsageLog(models.Model):
    """Log de uso de datos de eSIM"""
    
    esim = models.ForeignKey(ESim, on_delete=models.CASCADE, related_name='usage_logs')
    date = models.DateField(_('date'))
    data_used = models.PositiveIntegerField(_('data used (MB)'))
    total_data_used = models.PositiveIntegerField(_('total data used (MB)'))
    
    # Información adicional
    country = models.CharField(_('country'), max_length=100, blank=True)
    network_operator = models.CharField(_('network operator'), max_length=100, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = _('eSIM Usage Log')
        verbose_name_plural = _('eSIM Usage Logs')
        unique_together = ['esim', 'date']
        ordering = ['-date']
        
    def __str__(self):
        return f"{self.esim.iccid} - {self.date} - {self.data_used}MB"


class ESimActivation(models.Model):
    """Registro de activaciones de eSIM"""
    
    esim = models.OneToOneField(ESim, on_delete=models.CASCADE, related_name='activation')
    device_info = models.JSONField(_('device info'), blank=True, null=True)
    activation_ip = models.GenericIPAddressField(_('activation IP'), null=True, blank=True)
    activation_location = models.CharField(_('activation location'), max_length=200, blank=True)
    user_agent = models.TextField(_('user agent'), blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = _('eSIM Activation')
        verbose_name_plural = _('eSIM Activations')
        
    def __str__(self):
        return f"Activation of {self.esim.iccid}"
