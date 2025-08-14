"""
URL configuration for esim_backend project - eSIM Management Platform
"""
from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('health/', views.health, name='health'),
    path('admin/', admin.site.urls),
    path('api/ping/', views.health, name='api_ping'),  # Endpoint específico para Railway healthcheck
]

# Serve static files during development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
