"""
URL configuration for esim_backend project - eSIM Management Platform
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from . import views
from . import api_views
from . import api_1ot_views
from . import auth_views
# from . import admin_views

urlpatterns = [
    path('', views.home, name='home'),
    path('health/', views.health, name='health'),
    path('admin/', admin.site.urls),
    
    # API endpoints para tests de Twilio
    path('api/', api_views.api_root, name='api_root'),
    path('api/ping/', views.health, name='api_ping'),  # Endpoint específico para Railway healthcheck
    path('api/test-credentials/', api_views.test_credentials, name='test_credentials'),
    path('api/esim/create/', api_views.create_esim, name='create_esim'),
    path('api/esim/usage/<str:sim_sid>/', api_views.check_usage, name='check_usage'),
    
    # API endpoints para 1oT 
    path('api/1ot/test-credentials/', api_1ot_views.test_1ot_credentials, name='test_1ot_credentials'),
    path('api/1ot/esim/create/', api_1ot_views.create_1ot_esim, name='create_1ot_esim'),
    path('api/1ot/esim/usage/<str:esim_id>/', api_1ot_views.check_1ot_usage, name='check_1ot_usage'),
    
    # API endpoints para autenticación unificada
    path('api/auth/login/', auth_views.login_view, name='auth_login'),
    path('api/auth/register/', auth_views.register_view, name='auth_register'),
    path('api/auth/logout/', auth_views.logout_view, name='auth_logout'),
    path('api/auth/google/', auth_views.google_auth, name='google_auth'),
    path('api/auth/google/callback/', auth_views.google_callback, name='google_callback'),
    path('api/auth/apple/', auth_views.apple_auth, name='apple_auth'),
    path('api/auth/profile/', auth_views.user_profile, name='user_profile'),
    
    # API endpoints de administración - Temporalmente comentados
    # path('api/admin/stats/', admin_views.admin_stats_api, name='admin_stats_api'),
    # path('api/admin/summary/', admin_views.dashboard_summary, name='dashboard_summary'),
    
    # API endpoints principales
    path('api/auth/', include('users.urls')),
    path('api/plans/', include('plans.urls')),
    path('api/esims/', include('esims.urls')),
    path('api/payments/', include('payments.urls')),
    path('api/support/', include('support.urls')),
    path('api/rewards/', include('rewards.urls')),
    path('api/geo/', include('geolocation.urls')),
]

# Servir archivos media en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
