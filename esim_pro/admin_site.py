from django.contrib.admin import AdminSite
from django.shortcuts import render
from django.http import HttpResponse
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta
from users.models import User
from payments.models import Order, Payment
from esims.models import ESim
from plans.models import DataPlan


class CustomAdminSite(AdminSite):
    site_header = 'eSIM Pro - Panel de Administración'
    site_title = 'eSIM Pro Admin'
    index_title = 'Dashboard de Administración'
    
    def index(self, request, extra_context=None):
        """Vista principal del dashboard personalizado"""
        extra_context = extra_context or {}
        
        # Estadísticas generales
        now = timezone.now()
        today = now.date()
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)
        
        # Usuarios
        total_users = User.objects.count()
        new_users_week = User.objects.filter(date_joined__gte=week_ago).count()
        verified_users = User.objects.filter(is_verified=True).count()
        
        # Órdenes
        total_orders = Order.objects.count()
        completed_orders = Order.objects.filter(status='completed').count()
        pending_orders = Order.objects.filter(status='pending').count()
        orders_this_week = Order.objects.filter(created_at__gte=week_ago).count()
        
        # Ingresos
        total_revenue = Order.objects.filter(status='completed').aggregate(
            total=Sum('total_amount')
        )['total'] or 0
        
        revenue_this_week = Order.objects.filter(
            status='completed',
            created_at__gte=week_ago
        ).aggregate(total=Sum('total_amount'))['total'] or 0
        
        revenue_this_month = Order.objects.filter(
            status='completed',
            created_at__gte=month_ago
        ).aggregate(total=Sum('total_amount'))['total'] or 0
        
        # eSIMs
        total_esims = ESim.objects.count()
        active_esims = ESim.objects.filter(status='active').count()
        created_esims = ESim.objects.filter(status='created').count()
        expired_esims = ESim.objects.filter(status='expired').count()
        
        # Planes más populares
        popular_plans = DataPlan.objects.annotate(
            order_count=Count('order')
        ).order_by('-order_count')[:5]
        
        # Últimas órdenes
        recent_orders = Order.objects.select_related('user', 'plan').order_by('-created_at')[:10]
        
        # Usuarios top (por gasto)
        top_users = User.objects.annotate(
            total_spent=Sum('orders__total_amount', filter=Q(orders__status='completed'))
        ).order_by('-total_spent')[:5]
        
        extra_context.update({
            # Estadísticas generales
            'total_users': total_users,
            'new_users_week': new_users_week,
            'verified_users': verified_users,
            'verification_rate': (verified_users / total_users * 100) if total_users > 0 else 0,
            
            # Órdenes
            'total_orders': total_orders,
            'completed_orders': completed_orders,
            'pending_orders': pending_orders,
            'orders_this_week': orders_this_week,
            'completion_rate': (completed_orders / total_orders * 100) if total_orders > 0 else 0,
            
            # Ingresos
            'total_revenue': total_revenue,
            'revenue_this_week': revenue_this_week,
            'revenue_this_month': revenue_this_month,
            'avg_order_value': (total_revenue / completed_orders) if completed_orders > 0 else 0,
            
            # eSIMs
            'total_esims': total_esims,
            'active_esims': active_esims,
            'created_esims': created_esims,
            'expired_esims': expired_esims,
            'activation_rate': (active_esims / total_esims * 100) if total_esims > 0 else 0,
            
            # Datos para gráficos y listas
            'popular_plans': popular_plans,
            'recent_orders': recent_orders,
            'top_users': top_users,
        })
        
        return super().index(request, extra_context)


# Instancia del admin site personalizado
admin_site = CustomAdminSite(name='custom_admin')

# Función para obtener estadísticas rápidas (para API)
def get_admin_stats():
    """Devuelve estadísticas para API o JSON"""
    now = timezone.now()
    today = now.date()
    week_ago = today - timedelta(days=7)
    
    stats = {
        'users': {
            'total': User.objects.count(),
            'new_this_week': User.objects.filter(date_joined__gte=week_ago).count(),
            'verified': User.objects.filter(is_verified=True).count(),
        },
        'orders': {
            'total': Order.objects.count(),
            'completed': Order.objects.filter(status='completed').count(),
            'pending': Order.objects.filter(status='pending').count(),
            'this_week': Order.objects.filter(created_at__gte=week_ago).count(),
        },
        'revenue': {
            'total': float(Order.objects.filter(status='completed').aggregate(
                total=Sum('total_amount'))['total'] or 0),
            'this_week': float(Order.objects.filter(
                status='completed', created_at__gte=week_ago
            ).aggregate(total=Sum('total_amount'))['total'] or 0),
        },
        'esims': {
            'total': ESim.objects.count(),
            'active': ESim.objects.filter(status='active').count(),
            'created': ESim.objects.filter(status='created').count(),
        }
    }
    
    return stats
