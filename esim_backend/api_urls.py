"""
URLs de la API REST para la tienda eSIM
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api_views import (
    CountryViewSet, DataPlanViewSet, OrderViewSet, 
    ESimViewSet, UserViewSet
)

# Crear router principal
router = DefaultRouter()
router.register('countries', CountryViewSet, basename='country')
router.register('plans', DataPlanViewSet, basename='dataplan')
router.register('orders', OrderViewSet, basename='order')
router.register('esims', ESimViewSet, basename='esim')
router.register('users', UserViewSet, basename='user')

urlpatterns = [
    # API REST principal
    path('', include(router.urls)),
    
    # Endpoints de autenticación (simplificado)
    path('auth/', include('rest_framework.urls')),
]
