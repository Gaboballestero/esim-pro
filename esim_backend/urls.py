"""
URL configuration for esim_backend project - eSIM Management Platform
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from . import views
from . import api_urls

urlpatterns = [
    # Landing pages
    path('', views.home, name='home'),
    path('shop/', views.shop, name='shop'),
    path('store/', views.store, name='store'),
    path('store/auth/', views.store_auth, name='store_auth'),
    
    # API REST endpoints
    path('api/', include(api_urls)),
    
    # System endpoints
    path('health/', views.health, name='health'),
    path('admin/', admin.site.urls),
    path('api/ping/', views.health, name='api_ping'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
