from django.contrib import admin
from .models import Country, NetworkOperator, LocationHistory, TravelPattern, GeofenceAlert, IPGeolocation


@admin.register(Country)
class CountryAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'continent', 'esim_supported', 'coverage_quality', 'is_popular', 'display_order')
    list_filter = ('continent', 'esim_supported', 'coverage_quality', 'is_popular')
    search_fields = ('name', 'code', 'code_3')
    list_editable = ('esim_supported', 'is_popular', 'display_order')
    ordering = ('display_order', 'name')


@admin.register(NetworkOperator)
class NetworkOperatorAdmin(admin.ModelAdmin):
    list_display = ('name', 'country', 'network_type', 'coverage_percentage', 'is_primary')
    list_filter = ('network_type', 'is_primary', 'country__continent')
    search_fields = ('name', 'country__name')


@admin.register(LocationHistory)
class LocationHistoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'country', 'city', 'detection_method', 'is_roaming', 'detected_at')
    list_filter = ('detection_method', 'is_roaming', 'detected_at', 'country')
    search_fields = ('user__username', 'country__name', 'city')
    readonly_fields = ('detected_at',)


@admin.register(TravelPattern)
class TravelPatternAdmin(admin.ModelAdmin):
    list_display = ('user', 'typical_data_usage', 'budget_range', 'average_trip_duration')
    list_filter = ('typical_data_usage', 'budget_range', 'prefers_unlimited')
    search_fields = ('user__username',)


@admin.register(GeofenceAlert)
class GeofenceAlertAdmin(admin.ModelAdmin):
    list_display = ('user', 'country', 'alert_type', 'is_active', 'acknowledged', 'created_at')
    list_filter = ('alert_type', 'is_active', 'acknowledged', 'created_at')
    search_fields = ('user__username', 'country__name', 'title')


@admin.register(IPGeolocation)
class IPGeolocationAdmin(admin.ModelAdmin):
    list_display = ('ip_address', 'country', 'city', 'source', 'last_updated')
    list_filter = ('source', 'last_updated', 'country')
    search_fields = ('ip_address', 'country__name', 'city')
