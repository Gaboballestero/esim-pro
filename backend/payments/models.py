from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from django.utils import timezone
from plans.models import DataPlan
import uuid


class Order(models.Model):
    """Orden de compra"""
    
    STATUS_CHOICES = [
        ('pending', _('Pendiente')),
        ('processing', _('Procesando')),
        ('completed', _('Completada')),
        ('failed', _('Fallida')),
        ('cancelled', _('Cancelada')),
        ('refunded', _('Reembolsada')),
    ]
    
    PAYMENT_METHOD_CHOICES = [
        ('stripe', _('Stripe (Tarjeta)')),
        ('paypal', _('PayPal')),
        ('apple_pay', _('Apple Pay')),
        ('google_pay', _('Google Pay')),
        ('bank_transfer', _('Transferencia Bancaria')),
    ]
    
    # Identificadores
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order_number = models.CharField(_('order number'), max_length=20, unique=True)
    
    # Relaciones
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='orders'
    )
    plan = models.ForeignKey(DataPlan, on_delete=models.CASCADE)
    
    # Información de pago
    status = models.CharField(
        _('status'), 
        max_length=20, 
        choices=STATUS_CHOICES,
        default='pending'
    )
    payment_method = models.CharField(
        _('payment method'), 
        max_length=20, 
        choices=PAYMENT_METHOD_CHOICES
    )
    
    # Montos
    subtotal = models.DecimalField(_('subtotal'), max_digits=10, decimal_places=2)
    tax_amount = models.DecimalField(_('tax amount'), max_digits=10, decimal_places=2, default=0)
    discount_amount = models.DecimalField(_('discount amount'), max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(_('total amount'), max_digits=10, decimal_places=2)
    currency = models.CharField(_('currency'), max_length=3, default='USD')
    
    # Información adicional
    customer_notes = models.TextField(_('customer notes'), blank=True)
    admin_notes = models.TextField(_('admin notes'), blank=True)
    
    # IDs de proveedores de pago
    stripe_payment_intent_id = models.CharField(max_length=255, blank=True)
    paypal_order_id = models.CharField(max_length=255, blank=True)
    
    # Fechas
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(_('completed at'), null=True, blank=True)
    
    class Meta:
        verbose_name = _('Order')
        verbose_name_plural = _('Orders')
        ordering = ['-created_at']
        
    def __str__(self):
        return f"Order {self.order_number} - {self.user.email}"
    
    def save(self, *args, **kwargs):
        if not self.order_number:
            # Generar número de orden único
            import random
            import string
            self.order_number = 'ORD-' + ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))
        
        # Si el estado cambió a 'completed', crear eSIM automáticamente
        if self.pk:  # Solo para órdenes existentes
            old_instance = Order.objects.get(pk=self.pk)
            if old_instance.status != 'completed' and self.status == 'completed':
                self.completed_at = timezone.now()
                super().save(*args, **kwargs)
                self.create_esim()
                return
        
        super().save(*args, **kwargs)
    
    def create_esim(self):
        """Crear eSIM automáticamente cuando se complete la orden"""
        try:
            from esims.models import ESim
            import random
            import string
            
            # Verificar que no exista ya una eSIM para esta orden
            if hasattr(self, 'esim'):
                return self.esim
            
            # Generar datos únicos para la eSIM
            iccid = '89' + ''.join(random.choices(string.digits, k=18))  # ICCID de 20 dígitos
            activation_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=32))
            
            # Crear la eSIM
            esim = ESim.objects.create(
                user=self.user,
                plan=self.plan,
                order=self,
                iccid=iccid,
                smdp_address='sm-dp-plus.provider.com',
                activation_code=activation_code,
                status='created'
            )
            
            # Enviar notificación al usuario (aquí puedes agregar lógica de notificación)
            # send_esim_created_notification(self.user, esim)
            
            return esim
            
        except Exception as e:
            # Log del error para debugging
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error creando eSIM para orden {self.order_number}: {str(e)}")
            return None
    
    def get_esim(self):
        """Obtener la eSIM asociada"""
        try:
            return self.esim
        except:
            return None
    
    def get_total_revenue(self):
        """Calcular ingresos totales de esta orden"""
        return self.payments.filter(status='succeeded').aggregate(
            total=models.Sum('amount')
        )['total'] or 0


class Payment(models.Model):
    """Registro de pagos"""
    
    STATUS_CHOICES = [
        ('pending', _('Pendiente')),
        ('processing', _('Procesando')),
        ('succeeded', _('Exitoso')),
        ('failed', _('Fallido')),
        ('cancelled', _('Cancelado')),
        ('refunded', _('Reembolsado')),
    ]
    
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='payments')
    
    # Información del pago
    payment_id = models.CharField(_('payment ID'), max_length=255, unique=True)
    amount = models.DecimalField(_('amount'), max_digits=10, decimal_places=2)
    currency = models.CharField(_('currency'), max_length=3)
    status = models.CharField(_('status'), max_length=20, choices=STATUS_CHOICES)
    
    # Información del proveedor
    provider = models.CharField(_('provider'), max_length=50)  # stripe, paypal, etc.
    provider_payment_id = models.CharField(_('provider payment ID'), max_length=255, blank=True)
    provider_response = models.JSONField(_('provider response'), blank=True, null=True)
    
    # Metadata
    failure_reason = models.TextField(_('failure reason'), blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('Payment')
        verbose_name_plural = _('Payments')
        ordering = ['-created_at']
        
    def __str__(self):
        return f"Payment {self.payment_id} - {self.amount} {self.currency}"


class Refund(models.Model):
    """Reembolsos"""
    
    STATUS_CHOICES = [
        ('pending', _('Pendiente')),
        ('processing', _('Procesando')),
        ('succeeded', _('Exitoso')),
        ('failed', _('Fallido')),
        ('cancelled', _('Cancelado')),
    ]
    
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name='refunds')
    
    # Información del reembolso
    refund_id = models.CharField(_('refund ID'), max_length=255, unique=True)
    amount = models.DecimalField(_('amount'), max_digits=10, decimal_places=2)
    reason = models.TextField(_('reason'))
    status = models.CharField(_('status'), max_length=20, choices=STATUS_CHOICES)
    
    # Información del proveedor
    provider_refund_id = models.CharField(_('provider refund ID'), max_length=255, blank=True)
    provider_response = models.JSONField(_('provider response'), blank=True, null=True)
    
    # Metadata
    processed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='processed_refunds'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('Refund')
        verbose_name_plural = _('Refunds')
        ordering = ['-created_at']
        
    def __str__(self):
        return f"Refund {self.refund_id} - {self.amount}"
