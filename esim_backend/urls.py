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
    path('health/', views.health, name='health'),
    path('admin/', admin.site.urls),
    path('api/ping/', views.health, name='api_ping'),
    path('create-admin-emergency/', views.create_admin_emergency, name='create_admin_emergency'),  # Vista temporal
    path('admin-simple/', views.admin_login_simple, name='admin_login_simple'),  # Login sin CSRF
]
