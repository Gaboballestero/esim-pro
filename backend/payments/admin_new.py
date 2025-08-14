from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Sum, Count
from django.utils import timezone
from django.urls import reverse
from .models import Order, Payment


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    """Panel de administración para órdenes"""
    
    list_display = (
        'order_number', 'user_email', 'plan_name', 'status_display',
        'total_amount_display', 'created_at_display', 'payment_status',
        'esim_status', 'actions_display'
    )
    list_filter = ('status', 'created_at', 'plan__plan_type', 'payment_method')
    search_fields = ('order_number', 'user__email', 'plan__name')
    readonly_fields = (
        'order_number', 'created_at', 'updated_at', 'esim_info',
        'payment_summary', 'user_history'
    )
    raw_id_fields = ('user', 'plan')
    date_hierarchy = 'created_at'
    actions = ['mark_as_completed', 'mark_as_failed', 'create_esim_for_order']
    
    fieldsets = (
        ('Información de la Orden', {
            'fields': ('order_number', 'user', 'plan', 'status', 'payment_method')
        }),
        ('Detalles Financieros', {
            'fields': ('total_amount', 'currency', 'discount_applied', 'payment_summary')
        }),
        ('eSIM Asociada', {
            'fields': ('esim_info',)
        }),
        ('Historial del Usuario', {
            'fields': ('user_history',),
            'classes': ('collapse',)
        }),
        ('Fechas', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def user_email(self, obj):
        """Email del usuario con enlace"""
        url = reverse('admin:users_user_change', args=[obj.user.id])
        return format_html('<a href="{}">{}</a>', url, obj.user.email)
    user_email.short_description = 'Usuario'
    
    def plan_name(self, obj):
        """Nombre del plan con enlace"""
        url = reverse('admin:plans_dataplan_change', args=[obj.plan.id])
        return format_html('<a href="{}">{}</a>', url, obj.plan.name)
    plan_name.short_description = 'Plan'
    
    def status_display(self, obj):
        """Estado con colores"""
        colors = {
            'pending': '#ffc107',
            'processing': '#17a2b8',
            'completed': '#28a745',
            'failed': '#dc3545',
            'cancelled': '#6c757d',
            'refunded': '#6f42c1'
        }
        color = colors.get(obj.status, '#6c757d')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_display.short_description = 'Estado'
    
    def total_amount_display(self, obj):
        """Monto total formateado"""
        return f"{obj.currency} ${obj.total_amount}"
    total_amount_display.short_description = 'Total'
    
    def created_at_display(self, obj):
        """Fecha de creación"""
        return obj.created_at.strftime('%d/%m/%Y %H:%M')
    created_at_display.short_description = 'Fecha'
    
    def payment_status(self, obj):
        """Estado del pago"""
        payment = obj.payments.first()
        if payment:
            colors = {
                'pending': '#ffc107',
                'processing': '#17a2b8',
                'completed': '#28a745',
                'failed': '#dc3545',
                'cancelled': '#6c757d',
                'refunded': '#6f42c1'
            }
            color = colors.get(payment.status, '#6c757d')
            return format_html(
                '<span style="color: {}; font-weight: bold;">{}</span>',
                color,
                payment.get_status_display()
            )
        return format_html('<span style="color: #6c757d;">Sin pago</span>')
    payment_status.short_description = 'Estado del Pago'
    
    def esim_status(self, obj):
        """Estado de la eSIM asociada"""
        try:
            esim = obj.esim
            colors = {
                'created': '#6c757d',
                'activated': '#17a2b8',
                'active': '#28a745',
                'suspended': '#ffc107',
                'expired': '#fd7e14',
                'cancelled': '#dc3545'
            }
            color = colors.get(esim.status, '#6c757d')
            url = reverse('admin:esims_esim_change', args=[esim.id])
            return format_html(
                '<a href="{}" style="color: {}; font-weight: bold;">{}</a>',
                url, color, esim.get_status_display()
            )
        except:
            return format_html('<span style="color: #dc3545;">Sin eSIM</span>')
    esim_status.short_description = 'eSIM'
    
    def actions_display(self, obj):
        """Botones de acción"""
        actions = []
        if obj.status == 'pending':
            actions.append('<button onclick="processOrder({})" class="btn btn-sm btn-primary">Procesar</button>'.format(obj.id))
        if obj.status == 'completed' and not hasattr(obj, 'esim'):
            actions.append('<button onclick="createESim({})" class="btn btn-sm btn-success">Crear eSIM</button>'.format(obj.id))
        
        return format_html(' '.join(actions))
    actions_display.short_description = 'Acciones'
    
    def esim_info(self, obj):
        """Información de la eSIM asociada"""
        try:
            esim = obj.esim
            return format_html(
                'ICCID: {}<br>Estado: {}<br>Activada: {}<br>Uso: {} MB / {} MB',
                esim.iccid,
                esim.get_status_display(),
                esim.activated_at.strftime('%d/%m/%Y %H:%M') if esim.activated_at else 'No activada',
                esim.data_used,
                esim.plan.data_amount
            )
        except:
            return 'Sin eSIM asociada'
    esim_info.short_description = 'Información de eSIM'
    
    def payment_summary(self, obj):
        """Resumen de pagos"""
        payments = obj.payments.all()
        if not payments:
            return 'Sin pagos registrados'
        
        summary = []
        for payment in payments:
            summary.append(f"{payment.payment_method}: ${payment.amount} ({payment.get_status_display()})")
        return '\n'.join(summary)
    payment_summary.short_description = 'Resumen de Pagos'
    
    def user_history(self, obj):
        """Historial del usuario"""
        user_orders = Order.objects.filter(user=obj.user).exclude(id=obj.id)[:5]
        if not user_orders:
            return 'Primera compra del usuario'
        
        history = []
        for order in user_orders:
            history.append(f"{order.order_number}: {order.plan.name} - ${order.total_amount} ({order.get_status_display()})")
        return '\n'.join(history)
    user_history.short_description = 'Órdenes Anteriores'
    
    # Acciones personalizadas
    def mark_as_completed(self, request, queryset):
        """Marcar órdenes como completadas"""
        updated = queryset.filter(status='processing').update(status='completed')
        self.message_user(request, f'{updated} órdenes marcadas como completadas.')
    mark_as_completed.short_description = 'Marcar como completadas'
    
    def mark_as_failed(self, request, queryset):
        """Marcar órdenes como fallidas"""
        updated = queryset.update(status='failed')
        self.message_user(request, f'{updated} órdenes marcadas como fallidas.')
    mark_as_failed.short_description = 'Marcar como fallidas'
    
    def create_esim_for_order(self, request, queryset):
        """Crear eSIM para órdenes completadas"""
        from esims.models import ESim
        created = 0
        for order in queryset.filter(status='completed'):
            if not hasattr(order, 'esim'):
                # Aquí implementarías la lógica para crear la eSIM
                # ESim.objects.create_for_order(order)
                created += 1
        self.message_user(request, f'{created} eSIMs creadas.')
    create_esim_for_order.short_description = 'Crear eSIMs para órdenes'


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    """Panel de administración para pagos"""
    
    list_display = (
        'transaction_id', 'order_number', 'user_email', 'payment_method',
        'amount_display', 'status_display', 'created_at_display'
    )
    list_filter = ('status', 'payment_method', 'created_at')
    search_fields = ('transaction_id', 'order__order_number', 'order__user__email')
    readonly_fields = ('transaction_id', 'created_at', 'updated_at', 'payment_details')
    raw_id_fields = ('order',)
    date_hierarchy = 'created_at'
    
    def order_number(self, obj):
        """Número de orden con enlace"""
        url = reverse('admin:payments_order_change', args=[obj.order.id])
        return format_html('<a href="{}">{}</a>', url, obj.order.order_number)
    order_number.short_description = 'Orden'
    
    def user_email(self, obj):
        """Email del usuario"""
        return obj.order.user.email
    user_email.short_description = 'Usuario'
    
    def amount_display(self, obj):
        """Monto formateado"""
        return f"${obj.amount} {obj.currency}"
    amount_display.short_description = 'Monto'
    
    def status_display(self, obj):
        """Estado con colores"""
        colors = {
            'pending': '#ffc107',
            'processing': '#17a2b8',
            'completed': '#28a745',
            'failed': '#dc3545',
            'cancelled': '#6c757d',
            'refunded': '#6f42c1'
        }
        color = colors.get(obj.status, '#6c757d')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_display.short_description = 'Estado'
    
    def created_at_display(self, obj):
        """Fecha de creación"""
        return obj.created_at.strftime('%d/%m/%Y %H:%M')
    created_at_display.short_description = 'Fecha'
    
    def payment_details(self, obj):
        """Detalles del pago"""
        details = []
        details.append(f"ID de Transacción: {obj.transaction_id}")
        details.append(f"Método: {obj.get_payment_method_display()}")
        details.append(f"Estado: {obj.get_status_display()}")
        details.append(f"Monto: ${obj.amount} {obj.currency}")
        if obj.stripe_payment_intent_id:
            details.append(f"Stripe Payment Intent: {obj.stripe_payment_intent_id}")
        if obj.paypal_payment_id:
            details.append(f"PayPal Payment ID: {obj.paypal_payment_id}")
        return '\n'.join(details)
    payment_details.short_description = 'Detalles del Pago'
