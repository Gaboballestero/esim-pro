from django.contrib import admin
from django.utils.html import format_html
from django.utils import timezone
from django.db.models import Sum, Count, Q
from django.urls import reverse
from django.shortcuts import redirect
from .models import ESim, ESimUsageLog


@admin.register(ESim)
class ESimAdmin(admin.ModelAdmin):
    """Panel de administración para eSIMs"""
    
    list_display = (
        'iccid_short', 'user_email', 'plan_name', 'status_display', 
        'data_usage_display', 'created_at_display', 'expires_at_display',
        'revenue_display', 'actions_display'
    )
    list_filter = ('status', 'plan__plan_type', 'created_at', 'expires_at')
    search_fields = ('iccid', 'user__email', 'plan__name', 'nickname')
    readonly_fields = (
        'id', 'iccid', 'smdp_address', 'activation_code', 
        'created_at', 'activated_at', 'last_usage_update',
        'total_revenue', 'usage_summary'
    )
    raw_id_fields = ('user', 'plan')
    
    fieldsets = (
        ('Información Técnica', {
            'fields': ('id', 'iccid', 'smdp_address', 'activation_code')
        }),
        ('Usuario y Plan', {
            'fields': ('user', 'plan', 'nickname')
        }),
        ('Estado', {
            'fields': ('status',)
        }),
        ('Análisis de Uso', {
            'fields': ('data_used', 'last_usage_update', 'usage_summary')
        }),
        ('Información Financiera', {
            'fields': ('total_revenue',)
        }),
        ('Fechas', {
            'fields': ('created_at', 'activated_at', 'expires_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['activate_esims', 'suspend_esims', 'export_usage_report']
    
    def iccid_short(self, obj):
        """ICCID abreviado"""
        return f"{obj.iccid[:8]}...{obj.iccid[-4:]}"
    iccid_short.short_description = 'ICCID'
    
    def user_email(self, obj):
        """Email del usuario con enlace"""
        url = reverse('admin:users_user_change', args=[obj.user.id])
        return format_html('<a href="{}">{}</a>', url, obj.user.email)
    user_email.short_description = 'Usuario'
    user_email.short_description = 'Usuario'
    
    def plan_name(self, obj):
        """Nombre del plan"""
        return obj.plan.name
    plan_name.short_description = 'Plan'
    
    def status_display(self, obj):
        """Estado con colores"""
        colors = {
            'created': '#6c757d',
            'activated': '#17a2b8',
            'active': '#28a745',
            'suspended': '#ffc107',
            'expired': '#fd7e14',
            'cancelled': '#dc3545'
        }
        color = colors.get(obj.status, '#6c757d')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_display.short_description = 'Estado'
    
    def data_usage_display(self, obj):
        """Uso de datos con barra de progreso"""
        if obj.plan.data_amount > 0:
            percentage = (obj.data_used / obj.plan.data_amount) * 100
            color = '#28a745' if percentage < 80 else '#ffc107' if percentage < 95 else '#dc3545'
            return format_html(
                '<div style="width: 100px; background: #e9ecef; border-radius: 3px;">'
                '<div style="width: {}%; background: {}; height: 20px; border-radius: 3px; text-align: center; color: white; font-size: 12px; line-height: 20px;">'
                '{}%</div></div>',
                min(percentage, 100), color, int(percentage)
            )
        return f"{obj.data_used} MB"
    data_usage_display.short_description = 'Uso de Datos'
    
    def created_at_display(self, obj):
        """Fecha de creación formateada"""
        return obj.created_at.strftime('%d/%m/%Y %H:%M')
    created_at_display.short_description = 'Creada'
    
    def expires_at_display(self, obj):
        """Fecha de expiración formateada"""
        if obj.expires_at:
            return obj.expires_at.strftime('%d/%m/%Y %H:%M')
        return 'Sin expiración'
    expires_at_display.short_description = 'Expira'
    
    def revenue_display(self, obj):
        """Ingresos generados por esta eSIM"""
        from payments.models import Payment
        total = Payment.objects.filter(
            order__esim=obj,
            status='completed'
        ).aggregate(total=Sum('amount'))['total'] or 0
        return f"${total:.2f}"
    revenue_display.short_description = 'Ingresos'
    
    def actions_display(self, obj):
        """Botones de acción rápida"""
        actions = []
        if obj.status == 'created':
            actions.append('<button onclick="activateESim({})" class="btn btn-sm btn-success">Activar</button>'.format(obj.id))
        if obj.status == 'active':
            actions.append('<button onclick="suspendESim({})" class="btn btn-sm btn-warning">Suspender</button>'.format(obj.id))
        
        return format_html(' '.join(actions))
    actions_display.short_description = 'Acciones'
    
    def total_revenue(self, obj):
        """Ingresos totales en el campo readonly"""
        from payments.models import Payment
        payments = Payment.objects.filter(
            order__esim=obj,
            status='completed'
        )
        total = payments.aggregate(total=Sum('amount'))['total'] or 0
        count = payments.count()
        return f"${total:.2f} ({count} pagos)"
    total_revenue.short_description = 'Ingresos Totales'
    
    def usage_summary(self, obj):
        """Resumen de uso de datos"""
        usage_records = ESimUsageLog.objects.filter(esim=obj).order_by('-date')[:5]
        summary = []
        for usage in usage_records:
            summary.append(f"{usage.date.strftime('%d/%m')}: {usage.data_used}MB")
        return '\n'.join(summary) if summary else 'Sin registros de uso'
    usage_summary.short_description = 'Últimos 5 usos'
    
    # Acciones personalizadas
    def activate_esims(self, request, queryset):
        """Activar eSIMs seleccionadas"""
        updated = queryset.filter(status='created').update(
            status='activated',
            activated_at=timezone.now()
        )
        self.message_user(request, f'{updated} eSIMs activadas correctamente.')
    activate_esims.short_description = 'Activar eSIMs seleccionadas'
    
    def suspend_esims(self, request, queryset):
        """Suspender eSIMs seleccionadas"""
        updated = queryset.filter(status='active').update(status='suspended')
        self.message_user(request, f'{updated} eSIMs suspendidas correctamente.')
    suspend_esims.short_description = 'Suspender eSIMs seleccionadas'
    
    def export_usage_report(self, request, queryset):
        """Exportar reporte de uso"""
        # Aquí implementarías la lógica de exportación
        self.message_user(request, 'Función de exportación en desarrollo.')
    export_usage_report.short_description = 'Exportar reporte de uso'
    
    def created_at_display(self, obj):
        """Fecha de creación"""
        return obj.created_at.strftime('%d/%m/%Y %H:%M')
    created_at_display.short_description = 'Creada'
    
    def expires_at_display(self, obj):
        """Fecha de expiración"""
        if obj.expires_at:
            is_expired = obj.expires_at < timezone.now()
            color = '#dc3545' if is_expired else '#28a745'
            return format_html(
                '<span style="color: {};">{}</span>',
                color,
                obj.expires_at.strftime('%d/%m/%Y %H:%M')
            )
        return 'No definida'
    expires_at_display.short_description = 'Expira'
    
    actions = ['activate_esims', 'suspend_esims', 'refresh_usage']
    
    def activate_esims(self, request, queryset):
        """Activar eSIMs seleccionadas"""
        updated = queryset.filter(status='created').update(
            status='activated',
            activated_at=timezone.now()
        )
        self.message_user(request, f'{updated} eSIMs activadas.')
    activate_esims.short_description = 'Activar eSIMs seleccionadas'
    
    def suspend_esims(self, request, queryset):
        """Suspender eSIMs seleccionadas"""
        updated = queryset.exclude(status__in=['expired', 'cancelled']).update(
            status='suspended'
        )
        self.message_user(request, f'{updated} eSIMs suspendidas.')
    suspend_esims.short_description = 'Suspender eSIMs seleccionadas'
    
    def refresh_usage(self, request, queryset):
        """Actualizar uso de datos"""
        # Aquí implementarías la lógica para consultar uso real
        self.message_user(request, f'Uso de datos actualizado para {queryset.count()} eSIMs.')
    refresh_usage.short_description = 'Actualizar uso de datos'


@admin.register(ESimUsageLog)
class ESimUsageLogAdmin(admin.ModelAdmin):
    """Panel de administración para registros de uso"""
    
    list_display = (
        'esim_iccid', 'date_display', 'data_used_display'
    )
    list_filter = ('date', 'esim__status')
    search_fields = ('esim__iccid', 'esim__user__email')
    readonly_fields = ('date', 'created_at')
    raw_id_fields = ('esim',)
    date_hierarchy = 'date'
    
    def esim_iccid(self, obj):
        """ICCID de la eSIM"""
        return f"{obj.esim.iccid[:8]}...{obj.esim.iccid[-4:]}"
    esim_iccid.short_description = 'eSIM'
    
    def date_display(self, obj):
        """Fecha formateada"""
        return obj.date.strftime('%d/%m/%Y')
    date_display.short_description = 'Fecha'
    
    def data_used_display(self, obj):
        """Datos usados formateados"""
        if obj.data_used >= 1024:
            return f"{obj.data_used / 1024:.2f} GB"
        return f"{obj.data_used} MB"
    data_used_display.short_description = 'Datos Usados'
