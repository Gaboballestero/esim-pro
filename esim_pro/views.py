from django.http import JsonResponse
from django.contrib.admin.views.decorators import staff_member_required
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta
from users.models import User
from payments.models import Order, Payment
from esims.models import ESim
from plans.models import DataPlan


@staff_member_required
def admin_stats_api(request):
    """API para obtener estadísticas del dashboard de administración"""
    try:
        now = timezone.now()
        today = now.date()
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)
        
        # Estadísticas de usuarios
        users_stats = {
            'total': User.objects.count(),
            'new_this_week': User.objects.filter(date_joined__gte=week_ago).count(),
            'new_this_month': User.objects.filter(date_joined__gte=month_ago).count(),
            'verified': User.objects.filter(is_verified=True).count(),
            'with_orders': User.objects.filter(orders__isnull=False).distinct().count(),
            'with_active_esims': User.objects.filter(esims__status='active').distinct().count(),
        }
        
        # Estadísticas de órdenes
        orders_stats = {
            'total': Order.objects.count(),
            'completed': Order.objects.filter(status='completed').count(),
            'pending': Order.objects.filter(status='pending').count(),
            'processing': Order.objects.filter(status='processing').count(),
            'failed': Order.objects.filter(status='failed').count(),
            'this_week': Order.objects.filter(created_at__gte=week_ago).count(),
            'this_month': Order.objects.filter(created_at__gte=month_ago).count(),
        }
        
        # Estadísticas de ingresos
        total_revenue = Order.objects.filter(status='completed').aggregate(
            total=Sum('total_amount'))['total'] or 0
        week_revenue = Order.objects.filter(
            status='completed', created_at__gte=week_ago
        ).aggregate(total=Sum('total_amount'))['total'] or 0
        month_revenue = Order.objects.filter(
            status='completed', created_at__gte=month_ago
        ).aggregate(total=Sum('total_amount'))['total'] or 0
        
        revenue_stats = {
            'total': float(total_revenue),
            'this_week': float(week_revenue),
            'this_month': float(month_revenue),
            'avg_order_value': float(total_revenue / orders_stats['completed']) if orders_stats['completed'] > 0 else 0,
        }
        
        # Estadísticas de eSIMs
        esims_stats = {
            'total': ESim.objects.count(),
            'created': ESim.objects.filter(status='created').count(),
            'activated': ESim.objects.filter(status='activated').count(),
            'active': ESim.objects.filter(status='active').count(),
            'suspended': ESim.objects.filter(status='suspended').count(),
            'expired': ESim.objects.filter(status='expired').count(),
            'cancelled': ESim.objects.filter(status='cancelled').count(),
        }
        
        # Planes más populares
        popular_plans = list(DataPlan.objects.annotate(
            order_count=Count('order')
        ).values('id', 'name', 'order_count').order_by('-order_count')[:5])
        
        # Últimas órdenes
        recent_orders = []
        for order in Order.objects.select_related('user', 'plan').order_by('-created_at')[:10]:
            recent_orders.append({
                'id': str(order.id),
                'order_number': order.order_number,
                'user_email': order.user.email,
                'plan_name': order.plan.name,
                'status': order.status,
                'total_amount': float(order.total_amount),
                'created_at': order.created_at.isoformat(),
            })
        
        # Top usuarios por gasto
        top_users = []
        for user in User.objects.annotate(
            total_spent=Sum('orders__total_amount', filter=Q(orders__status='completed'))
        ).order_by('-total_spent')[:5]:
            if user.total_spent:
                top_users.append({
                    'id': user.id,
                    'email': user.email,
                    'full_name': f"{user.first_name} {user.last_name}" if user.first_name else user.email.split('@')[0],
                    'total_spent': float(user.total_spent),
                    'orders_count': user.orders.filter(status='completed').count(),
                })
        
        # Datos para gráficos - órdenes por día (última semana)
        daily_orders = []
        for i in range(7):
            date = today - timedelta(days=i)
            count = Order.objects.filter(created_at__date=date).count()
            daily_orders.append({
                'date': date.isoformat(),
                'count': count
            })
        daily_orders.reverse()
        
        # Distribución de métodos de pago
        payment_methods = list(Order.objects.values('payment_method').annotate(
            count=Count('id')
        ).order_by('-count'))
        
        response_data = {
            'success': True,
            'data': {
                'users': users_stats,
                'orders': orders_stats,
                'revenue': revenue_stats,
                'esims': esims_stats,
                'popular_plans': popular_plans,
                'recent_orders': recent_orders,
                'top_users': top_users,
                'daily_orders': daily_orders,
                'payment_methods': payment_methods,
            },
            'generated_at': now.isoformat(),
        }
        
        return JsonResponse(response_data)
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


def dashboard_summary(request):
    """Vista simple para resumen del dashboard"""
    if not request.user.is_staff:
        return JsonResponse({'error': 'Unauthorized'}, status=403)
    
    # Estadísticas básicas
    stats = {
        'users_count': User.objects.count(),
        'orders_count': Order.objects.count(),
        'active_esims_count': ESim.objects.filter(status='active').count(),
        'total_revenue': float(Order.objects.filter(status='completed').aggregate(
            total=Sum('total_amount'))['total'] or 0),
    }
    
    return JsonResponse(stats)
