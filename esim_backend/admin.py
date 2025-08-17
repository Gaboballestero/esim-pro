"""
Configuración del panel de administración de Django
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Country, DataPlan, Order, ESim

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin para el modelo User personalizado"""
    list_display = ['username', 'email', 'first_name', 'last_name', 'is_premium', 'total_orders', 'date_joined']
    list_filter = ['is_staff', 'is_active', 'is_premium', 'preferred_language', 'date_joined']
    search_fields = ['username', 'email', 'first_name', 'last_name', 'phone']
    ordering = ['-date_joined']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Información eSIM', {
            'fields': ('phone', 'country_code', 'preferred_language', 'is_premium', 'total_orders')
        }),
    )

@admin.register(Country)
class CountryAdmin(admin.ModelAdmin):
    """Admin para países"""
    list_display = ['flag_emoji', 'name', 'code', 'region', 'is_popular', 'is_active']
    list_filter = ['region', 'is_popular', 'is_active']
    search_fields = ['name', 'code']
    ordering = ['name']
    
    list_editable = ['is_popular', 'is_active']

@admin.register(DataPlan)
class DataPlanAdmin(admin.ModelAdmin):
    """Admin para planes de datos"""
    list_display = [
        'name', 'plan_type', 'data_amount_gb', 'validity_days', 
        'price_usd', 'discount_percentage', 'is_popular', 'is_featured', 'is_active'
    ]
    list_filter = [
        'plan_type', 'is_popular', 'is_featured', 'is_active',
        'supports_5g', 'supports_hotspot', 'includes_calls', 'includes_sms'
    ]
    search_fields = ['name', 'slug', 'countries__name', 'network_operators']
    ordering = ['-is_featured', '-is_popular', 'price_usd']
    
    list_editable = ['is_popular', 'is_featured', 'is_active']
    filter_horizontal = ['countries']
    prepopulated_fields = {'slug': ('name',)}
    
    fieldsets = [
        ('Información Básica', {
            'fields': ('name', 'slug', 'plan_type', 'countries')
        }),
        ('Características del Plan', {
            'fields': (
                'data_amount_gb', 'is_unlimited', 'validity_days',
                'supports_5g', 'supports_hotspot', 'includes_calls', 'includes_sms'
            )
        }),
        ('Precios', {
            'fields': ('price_usd', 'original_price_usd')
        }),
        ('Marketing', {
            'fields': ('is_popular', 'is_featured', 'badge_text')
        }),
        ('Red', {
            'fields': ('network_operators',)
        }),
        ('Estado', {
            'fields': ('is_active',)
        })
    ]

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    """Admin para pedidos"""
    list_display = [
        'id', 'user', 'plan', 'total_amount', 'status', 
        'payment_method', 'created_at', 'completed_at'
    ]
    list_filter = ['status', 'payment_method', 'created_at', 'completed_at']
    search_fields = [
        'id', 'user__username', 'user__email', 'plan__name', 
        'customer_email', 'payment_id'
    ]
    ordering = ['-created_at']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    list_editable = ['status']
    
    fieldsets = [
        ('Información del Pedido', {
            'fields': ('id', 'user', 'plan', 'status')
        }),
        ('Información de Pago', {
            'fields': ('total_amount', 'currency', 'payment_method', 'payment_id')
        }),
        ('Información del Cliente', {
            'fields': ('customer_email', 'customer_phone')
        }),
        ('Fechas', {
            'fields': ('created_at', 'updated_at', 'completed_at')
        })
    ]

@admin.register(ESim)
class ESimAdmin(admin.ModelAdmin):
    """Admin para eSIMs"""
    list_display = [
        'id', 'user', 'plan', 'iccid', 'status', 
        'data_used_gb', 'activated_at', 'expires_at'
    ]
    list_filter = ['status', 'activated_at', 'expires_at', 'created_at']
    search_fields = [
        'id', 'iccid', 'activation_code', 'user__username', 
        'user__email', 'plan__name'
    ]
    ordering = ['-created_at']
    readonly_fields = ['id', 'created_at', 'data_used_gb', 'data_remaining_gb']
    
    list_editable = ['status']
    
    fieldsets = [
        ('Información de la eSIM', {
            'fields': ('id', 'user', 'plan', 'order', 'status')
        }),
        ('Datos de Activación', {
            'fields': ('iccid', 'qr_code', 'activation_code')
        }),
        ('Uso de Datos', {
            'fields': ('data_used_mb', 'data_used_gb', 'data_remaining_gb')
        }),
        ('Fechas', {
            'fields': ('created_at', 'activated_at', 'expires_at')
        })
    ]

# Personalizar el admin site
admin.site.site_header = "eSIM Pro - Panel de Administración"
admin.site.site_title = "eSIM Pro Admin"
admin.site.index_title = "Gestión de la Plataforma eSIM"
