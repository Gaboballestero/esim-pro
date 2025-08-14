from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from django.db.models import Count, Q
from django.urls import reverse
from django.utils import timezone
from .models import User, UserProfile


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Panel de administración completo para usuarios"""
    
    list_display = (
        'email', 'username', 'full_name', 'social_provider_display', 
        'is_verified', 'is_active', 'orders_count', 'total_spent',
        'active_esims_count', 'date_joined_display', 'last_login_display'
    )
    list_filter = (
        'social_auth_provider', 'is_verified', 'is_active', 'is_staff', 
        'date_joined', 'last_login'
    )
    search_fields = ('email', 'username', 'first_name', 'last_name', 'phone_number')
    ordering = ('-date_joined',)
    readonly_fields = (
        'date_joined', 'last_login', 'google_id', 'apple_id',
        'purchase_history', 'esims_summary', 'total_revenue_generated'
    )
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('username', 'email', 'first_name', 'last_name')
        }),
        ('Contacto', {
            'fields': ('phone_number', 'country_code')
        }),
        ('Autenticación Social', {
            'fields': ('social_auth_provider', 'google_id', 'apple_id'),
            'classes': ('collapse',)
        }),
        ('Verificación', {
            'fields': ('is_verified', 'is_email_verified')
        }),
        ('Historial de Compras', {
            'fields': ('purchase_history', 'total_revenue_generated'),
            'classes': ('collapse',)
        }),
        ('eSIMs del Usuario', {
            'fields': ('esims_summary',),
            'classes': ('collapse',)
        }),
        ('Permisos', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
            'classes': ('collapse',)
        }),
        ('Fechas Importantes', {
            'fields': ('last_login', 'date_joined'),
            'classes': ('collapse',)
        }),
    )
    
    add_fieldsets = (
        ('Crear Usuario', {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2'),
        }),
    )
    
    def full_name(self, obj):
        """Nombre completo del usuario"""
        if obj.first_name and obj.last_name:
            return f"{obj.first_name} {obj.last_name}"
        return obj.email.split('@')[0]
    full_name.short_description = 'Nombre'
    
    def social_provider_display(self, obj):
        """Muestra el proveedor de autenticación con colores"""
        colors = {
            'email': '#6c757d',
            'google': '#db4437',
            'apple': '#000000'
        }
        color = colors.get(obj.social_auth_provider, '#6c757d')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.get_social_auth_provider_display()
        )
    social_provider_display.short_description = 'Proveedor Auth'
    
    def date_joined_display(self, obj):
        """Fecha de registro formateada"""
        return obj.date_joined.strftime('%d/%m/%Y %H:%M')
    date_joined_display.short_description = 'Fecha Registro'
    
    def last_login_display(self, obj):
        """Último login formateado"""
        if obj.last_login:
            return obj.last_login.strftime('%d/%m/%Y %H:%M')
        return 'Nunca'
    last_login_display.short_description = 'Último Login'
    
    def orders_count(self, obj):
        """Número de órdenes del usuario"""
        count = obj.orders.count()
        completed = obj.orders.filter(status='completed').count()
        return format_html(
            '<span title="Total: {} | Completadas: {}">{} órdenes</span>',
            count, completed, count
        )
    orders_count.short_description = 'Órdenes'
    
    def total_spent(self, obj):
        """Total gastado por el usuario"""
        from django.db.models import Sum
        total = obj.orders.filter(status='completed').aggregate(
            total=Sum('total_amount')
        )['total'] or 0
        return f"${total:.2f}"
    total_spent.short_description = 'Total Gastado'
    
    def active_esims_count(self, obj):
        """Número de eSIMs activas"""
        active_count = obj.esims.filter(status='active').count()
        total_count = obj.esims.count()
        colors = {
            0: '#6c757d',
            1: '#28a745',
            2: '#ffc107',
        }
        color = colors.get(min(active_count, 2), '#dc3545')
        return format_html(
            '<span style="color: {}; font-weight: bold;" title="Activas: {} | Total: {}">{} activas</span>',
            color, active_count, total_count, active_count
        )
    active_esims_count.short_description = 'eSIMs Activas'
    
    def purchase_history(self, obj):
        """Historial de compras del usuario"""
        orders = obj.orders.order_by('-created_at')[:10]
        if not orders:
            return 'Sin compras registradas'
        
        history = []
        for order in orders:
            status_icons = {
                'pending': '⏳',
                'processing': '⚙️',
                'completed': '✅',
                'failed': '❌',
                'cancelled': '🚫',
                'refunded': '💸'
            }
            icon = status_icons.get(order.status, '❓')
            history.append(
                f"{icon} {order.order_number}: {order.plan.name} - ${order.total_amount} "
                f"({order.created_at.strftime('%d/%m/%Y')})"
            )
        return '\n'.join(history)
    purchase_history.short_description = 'Historial de Compras (Últimas 10)'
    
    def esims_summary(self, obj):
        """Resumen de eSIMs del usuario"""
        esims = obj.esims.order_by('-created_at')[:5]
        if not esims:
            return 'Sin eSIMs registradas'
        
        summary = []
        for esim in esims:
            status_icons = {
                'created': '🆕',
                'activated': '🔄',
                'active': '✅',
                'suspended': '⏸️',
                'expired': '⏰',
                'cancelled': '❌'
            }
            icon = status_icons.get(esim.status, '❓')
            usage_percent = (esim.data_used / esim.plan.data_amount * 100) if esim.plan.data_amount > 0 else 0
            summary.append(
                f"{icon} {esim.iccid[:8]}...{esim.iccid[-4:]}: {esim.plan.name} "
                f"({usage_percent:.1f}% usado)"
            )
        return '\n'.join(summary)
    esims_summary.short_description = 'eSIMs del Usuario (Últimas 5)'
    
    def total_revenue_generated(self, obj):
        """Total de ingresos generados por este usuario"""
        from django.db.models import Sum
        orders_revenue = obj.orders.filter(status='completed').aggregate(
            total=Sum('total_amount')
        )['total'] or 0
        
        payments_revenue = obj.orders.filter(
            payments__status='succeeded'
        ).aggregate(
            total=Sum('payments__amount')
        )['total'] or 0
        
        return format_html(
            'Órdenes: ${:.2f}<br>Pagos: ${:.2f}<br><strong>Total: ${:.2f}</strong>',
            orders_revenue, payments_revenue, max(orders_revenue, payments_revenue)
        )
    total_revenue_generated.short_description = 'Ingresos Generados'
    last_login_display.short_description = 'Último Login'
    
    def get_queryset(self, request):
        """Optimizar consultas"""
        return super().get_queryset(request).select_related('profile')
    
    actions = ['verify_users', 'deactivate_users', 'send_welcome_email']
    
    def verify_users(self, request, queryset):
        """Verificar usuarios seleccionados"""
        updated = queryset.update(is_verified=True)
        self.message_user(request, f'{updated} usuarios verificados.')
    verify_users.short_description = 'Verificar usuarios seleccionados'
    
    def deactivate_users(self, request, queryset):
        """Desactivar usuarios seleccionados"""
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} usuarios desactivados.')
    deactivate_users.short_description = 'Desactivar usuarios seleccionados'


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    """Panel de administración para perfiles de usuario"""
    
    list_display = (
        'user_email', 'preferred_language', 'preferred_currency', 
        'created_at_display', 'updated_at_display'
    )
    list_filter = ('preferred_language', 'preferred_currency', 'created_at')
    search_fields = ('user__email', 'user__first_name', 'user__last_name')
    readonly_fields = ('created_at', 'updated_at')
    
    def user_email(self, obj):
        """Email del usuario"""
        return obj.user.email
    user_email.short_description = 'Usuario'
    
    def created_at_display(self, obj):
        """Fecha de creación formateada"""
        return obj.created_at.strftime('%d/%m/%Y %H:%M')
    created_at_display.short_description = 'Creado'
    
    def updated_at_display(self, obj):
        """Fecha de actualización formateada"""
        return obj.updated_at.strftime('%d/%m/%Y %H:%M')
    updated_at_display.short_description = 'Actualizado'


# Configuración del sitio de administración
admin.site.site_header = 'eSIM Pro - Panel de Administración'
admin.site.site_title = 'eSIM Pro Admin'
admin.site.index_title = 'Gestión de la Plataforma eSIM'
