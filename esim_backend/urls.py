"""
URL configuration for esim_backend project - eSIM Management Platform
"""
from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('shop/', views.shop, name='shop'),
    path('store/', views.store, name='store'),
    path('store/auth/', views.store_auth, name='store_auth'),
    path('create-admin-user/', views.create_admin_user, name='create_admin_user'),  # Vista temporal
    path('health/', views.health, name='health'),
    path('admin/', admin.site.urls),
    path('api/ping/', views.health, name='api_ping'),
    # Vistas temporales para debugging en producción
    path('create-admin-temp/', views.create_admin_view, name='create_admin_temp'),
    path('debug-templates/', views.debug_templates_view, name='debug_templates'),
]
