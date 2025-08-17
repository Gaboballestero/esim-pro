"""
URL configuration for esim_backend project - eSIM Management Platform
"""
from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('shop/', views.shop, name='shop'),
    path('health/', views.health, name='health'),
    path('admin/', admin.site.urls),
    path('api/ping/', views.health, name='api_ping'),
]
