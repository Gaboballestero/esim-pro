"""
Configuración del panel de administración de Django - SÚPER DASHBOARD 🚀
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from django.db.models import Sum, Count, Avg, Q
from django.urls import reverse, path
from django.utils.safestring import mark_safe
from django.template.response import TemplateResponse
from django.http import JsonResponse
from .models import User, Country, DataPlan, Order, ESim
import json
from datetime import datetime, timedelta

# ===== CONFIGURACIÓN GLOBAL DEL ADMIN SÚPER POTENTE =====
admin.site.site_header = "🚀 eSIM Pro - Dashboard de Administración SÚPER"
admin.site.site_title = "eSIM Pro Admin"
admin.site.index_title = "🎯 Panel de Control Principal"

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin para el modelo User personalizado - CON DASHBOARD DE CONSUMO"""
    list_display = [
        'username', 'email', 'user_status_display', 'orders_summary', 
        'total_spent_display', 'data_usage_display', 'last_activity', 'is_premium'
    ]
    list_filter = ['is_staff', 'is_active', 'is_premium', 'preferred_language', 'date_joined']
    search_fields = ['username', 'email', 'first_name', 'last_name', 'phone']
    ordering = ['-date_joined']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('📱 Información eSIM', {
            'fields': ('phone', 'country_code', 'preferred_language', 'is_premium', 'total_orders')
        }),
        ('📊 Estadísticas de Uso', {
            'fields': ('get_total_data_used', 'get_active_esims_count', 'get_total_spent'),
            'classes': ('collapse',)
        }),
    )
    
    def user_status_display(self, obj):
        active_esims = ESim.objects.filter(user=obj, status='activated').count()
        if active_esims > 0:
            return format_html('<span style="color: green;">✅ Activo ({} eSIMs)</span>', active_esims)
        elif obj.orders.exists():
            return format_html('<span style="color: orange;">⏳ Cliente</span>')
        else:
            return format_html('<span style="color: gray;">👤 Registrado</span>')
    user_status_display.short_description = 'Estado'
    
    def orders_summary(self, obj):
        total_orders = obj.orders.count()
        completed = obj.orders.filter(status='completed').count()
        return format_html(
            '<strong>{} pedidos</strong><br><small>{} completados</small>',
            total_orders, completed
        )
    orders_summary.short_description = 'Pedidos'
    
    def total_spent_display(self, obj):
        total = obj.orders.filter(status='completed').aggregate(total=Sum('total_amount'))['total'] or 0
        return format_html('<strong style="color: green;">${:.2f}</strong>', total)
    total_spent_display.short_description = 'Total Gastado'
    
    def data_usage_display(self, obj):
        esims = ESim.objects.filter(user=obj, status='activated')
        if esims.exists():
            total_used = sum([esim.data_used_mb for esim in esims]) / 1024  # Convert to GB
            return format_html('<span style="color: blue;">{:.2f} GB usados</span>', total_used)
        return format_html('<span style="color: gray;">Sin uso</span>')
    data_usage_display.short_description = 'Uso de Datos'
    
    def last_activity(self, obj):
        last_order = obj.orders.order_by('-created_at').first()
        if last_order:
            days_ago = (datetime.now().date() - last_order.created_at.date()).days
            return format_html('<small>Hace {} días</small>', days_ago)
        return format_html('<small>Nunca</small>')
    last_activity.short_description = 'Última Actividad'

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
    """Admin para eSIMs - CON MONITOREO EN TIEMPO REAL"""
    list_display = [
        'iccid_display', 'user_info', 'plan_info', 'status', 'status_display', 
        'usage_progress_bar', 'activation_info', 'remaining_days', 'revenue_generated'
    ]
    list_filter = ['status', 'activated_at', 'expires_at', 'created_at', 'plan__plan_type']
    search_fields = [
        'id', 'iccid', 'activation_code', 'user__username', 
        'user__email', 'plan__name'
    ]
    ordering = ['-created_at']
    readonly_fields = ['id', 'created_at', 'data_used_gb', 'data_remaining_gb', 'usage_percentage']
    
    list_editable = ['status']
    
    fieldsets = [
        ('📱 Información de la eSIM', {
            'fields': ('id', 'user', 'plan', 'order', 'status')
        }),
        ('🔐 Datos de Activación', {
            'fields': ('iccid', 'qr_code', 'activation_code')
        }),
        ('📊 CONSUMO EN TIEMPO REAL', {
            'fields': ('data_used_mb', 'data_used_gb', 'data_remaining_gb', 'usage_percentage'),
            'description': 'Monitoreo del consumo de datos del cliente'
        }),
        ('📅 Fechas Importantes', {
            'fields': ('created_at', 'activated_at', 'expires_at')
        })
    ]
    
    def iccid_display(self, obj):
        return format_html(
            '<code style="background: #f0f0f0; padding: 2px 4px; border-radius: 3px;">{}</code>',
            obj.iccid[:15] + '...' if len(obj.iccid) > 15 else obj.iccid
        )
    iccid_display.short_description = '📱 ICCID'
    
    def user_info(self, obj):
        return format_html(
            '<strong>{}</strong><br><small style="color: #666;">{}</small>',
            obj.user.username, obj.user.email
        )
    user_info.short_description = '👤 Cliente'
    
    def plan_info(self, obj):
        return format_html(
            '<strong>{}</strong><br>'
            '<small>💾 {} GB | ⏱️ {} días | 💰 ${}</small>',
            obj.plan.name, obj.plan.data_amount_gb, 
            obj.plan.validity_days, obj.plan.price_usd
        )
    plan_info.short_description = '📋 Plan'
    
    def status_display(self, obj):
        colors = {
            'created': '#3498db',     # Azul
            'activated': '#2ecc71',   # Verde  
            'suspended': '#f39c12',   # Naranja
            'expired': '#e74c3c'      # Rojo
        }
        icons = {
            'created': '⚡',
            'activated': '✅', 
            'suspended': '⏸️',
            'expired': '❌'
        }
        
        return format_html(
            '<span style="color: {}; font-weight: bold; font-size: 14px;">'
            '{} {}</span>',
            colors.get(obj.status, '#333'), 
            icons.get(obj.status, '❓'),
            obj.get_status_display()
        )
    status_display.short_description = '📡 Estado'
    
    def usage_progress_bar(self, obj):
        if obj.plan and obj.plan.data_amount_gb > 0:
            total_mb = obj.plan.data_amount_gb * 1024
            used_mb = obj.data_used_mb
            percentage = (used_mb / total_mb) * 100 if total_mb > 0 else 0
            remaining_gb = (total_mb - used_mb) / 1024
            
            # Colores según el porcentaje de uso
            if percentage < 50:
                color = '#2ecc71'  # Verde
            elif percentage < 80:
                color = '#f39c12'  # Naranja
            else:
                color = '#e74c3c'  # Rojo
            
            return format_html(
                '<div style="width: 120px;">'
                '<div style="background: #ecf0f1; border-radius: 10px; overflow: hidden;">'
                '<div style="width: {:.1f}%; background: {}; height: 15px; '
                'border-radius: 10px; transition: width 0.3s;"></div>'
                '</div>'
                '<small style="display: block; margin-top: 2px; text-align: center;">'
                '<strong>{:.1f}%</strong><br>'
                '<span style="color: {};">{:.2f} GB restantes</span>'
                '</small>'
                '</div>',
                min(percentage, 100), color, percentage, color, remaining_gb
            )
        return format_html('<small style="color: #7f8c8d;">No disponible</small>')
    usage_progress_bar.short_description = '📊 Consumo'
    
    def activation_info(self, obj):
        if obj.activated_at:
            days_active = (datetime.now().date() - obj.activated_at.date()).days
            return format_html(
                '<span style="color: #2ecc71;">✅ Activa</span><br>'
                '<small>Hace {} días</small>',
                days_active
            )
        else:
            days_created = (datetime.now().date() - obj.created_at.date()).days
            return format_html(
                '<span style="color: #f39c12;">⏳ Pendiente</span><br>'
                '<small>Creada hace {} días</small>',
                days_created
            )
    activation_info.short_description = '🚀 Activación'
    
    def remaining_days(self, obj):
        if obj.expires_at:
            remaining = (obj.expires_at.date() - datetime.now().date()).days
            if remaining > 7:
                color = '#2ecc71'  # Verde
            elif remaining > 0:
                color = '#f39c12'  # Naranja
            else:
                color = '#e74c3c'  # Rojo
                
            return format_html(
                '<span style="color: {}; font-weight: bold;">{} días</span>',
                color, max(remaining, 0)
            )
        return format_html('<span style="color: #7f8c8d;">No definido</span>')
    remaining_days.short_description = '⏰ Días Restantes'
    
    def revenue_generated(self, obj):
        if obj.order:
            return format_html(
                '<strong style="color: #2ecc71;">${:.2f}</strong>',
                obj.order.total_amount
            )
        return format_html('<span style="color: #7f8c8d;">$0.00</span>')
    revenue_generated.short_description = '💰 Ingresos'

# Personalizar el admin site
admin.site.site_header = "🚀 eSIM Pro - Dashboard de Administración SÚPER"
admin.site.site_title = "eSIM Pro Admin"
admin.site.index_title = "🎯 Panel de Control Principal"

# ===== CLASE PERSONALIZADA PARA DASHBOARD DE ESTADÍSTICAS =====
class CustomAdminSite(admin.AdminSite):
    """Admin Site personalizado con dashboard de estadísticas"""
    
    def index(self, request, extra_context=None):
        """Dashboard personalizado con estadísticas en tiempo real"""
        
        # 📊 ESTADÍSTICAS GENERALES
        stats = {
            'total_users': User.objects.count(),
            'active_users': User.objects.filter(is_active=True).count(),
            'premium_users': User.objects.filter(is_premium=True).count(),
            'total_orders': Order.objects.count(),
            'completed_orders': Order.objects.filter(status='completed').count(),
            'pending_orders': Order.objects.filter(status__in=['pending', 'processing']).count(),
            'total_esims': ESim.objects.count(),
            'active_esims': ESim.objects.filter(status='activated').count(),
            'total_revenue': Order.objects.filter(status='completed').aggregate(
                total=Sum('total_amount'))['total'] or 0,
            'total_data_plans': DataPlan.objects.filter(is_active=True).count(),
            'total_countries': Country.objects.filter(is_active=True).count(),
        }
        
        # 📈 ESTADÍSTICAS DE LOS ÚLTIMOS 30 DÍAS
        thirty_days_ago = datetime.now() - timedelta(days=30)
        recent_stats = {
            'new_users_30d': User.objects.filter(date_joined__gte=thirty_days_ago).count(),
            'orders_30d': Order.objects.filter(created_at__gte=thirty_days_ago).count(),
            'revenue_30d': Order.objects.filter(
                created_at__gte=thirty_days_ago, 
                status='completed'
            ).aggregate(total=Sum('total_amount'))['total'] or 0,
            'activated_esims_30d': ESim.objects.filter(activated_at__gte=thirty_days_ago).count(),
        }
        
        # 🔥 TOP PLANES MÁS VENDIDOS
        top_plans = DataPlan.objects.annotate(
            order_count=Count('orders')
        ).filter(order_count__gt=0).order_by('-order_count')[:5]
        
        # 🌍 TOP PAÍSES MÁS POPULARES
        top_countries = Country.objects.annotate(
            plan_count=Count('dataplans__orders')
        ).filter(plan_count__gt=0).order_by('-plan_count')[:5]
        
        # 💰 USUARIOS QUE MÁS GASTAN
        top_spenders = User.objects.annotate(
            total_spent=Sum('orders__total_amount')
        ).filter(total_spent__gt=0).order_by('-total_spent')[:5]
        
        # 📊 CONSUMO DE DATOS PROMEDIO
        avg_data_usage = ESim.objects.filter(
            status='activated'
        ).aggregate(avg_usage=Avg('data_used_mb'))['avg_usage'] or 0
        
        extra_context = extra_context or {}
        extra_context.update({
            'stats': stats,
            'recent_stats': recent_stats,
            'top_plans': top_plans,
            'top_countries': top_countries,
            'top_spenders': top_spenders,
            'avg_data_usage_gb': avg_data_usage / 1024 if avg_data_usage else 0,
            'dashboard_title': '🎯 Dashboard Principal - eSIM Pro',
        })
        
        return super().index(request, extra_context)

# Aplicar el dashboard personalizado
admin.site.__class__ = CustomAdminSite
