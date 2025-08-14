from django.urls import path
from . import views

app_name = 'geolocation'

urlpatterns = [
    # Países
    path('countries/', views.CountriesListView.as_view(), name='countries_list'),
    path('countries/<str:code>/', views.CountryDetailView.as_view(), name='country_detail'),
    path('search-countries/', views.search_countries, name='search_countries'),
    
    # Detección de ubicación
    path('detect-location/', views.detect_location, name='detect_location'),
    path('location-history/', views.LocationHistoryView.as_view(), name='location_history'),
    path('travel-stats/', views.travel_stats, name='travel_stats'),
    
    # Patrones de viaje
    path('travel-pattern/', views.TravelPatternView.as_view(), name='travel_pattern'),
    
    # Alertas
    path('alerts/', views.GeofenceAlertsView.as_view(), name='geofence_alerts'),
    path('alerts/<int:alert_id>/acknowledge/', views.acknowledge_alert, name='acknowledge_alert'),
]
