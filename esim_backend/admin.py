from django.contrib import admin
from .models import Country, Region, DataPlan, ESim

# Registro básico de modelos eSIM
@admin.register(Country)
class CountryAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'flag', 'is_popular']
    list_filter = ['is_popular']
    search_fields = ['name', 'code']
    ordering = ['name']

@admin.register(Region)
class RegionAdmin(admin.ModelAdmin):
    list_display = ['name', 'get_countries_count']
    search_fields = ['name']
    
    def get_countries_count(self, obj):
        return obj.countries.count()
    get_countries_count.short_description = 'Países'

@admin.register(DataPlan)
class DataPlanAdmin(admin.ModelAdmin):
    list_display = ['region', 'data_gb', 'duration_days', 'price']
    list_filter = ['region', 'data_gb', 'duration_days']
    search_fields = ['region__name']
    ordering = ['region', 'price']

@admin.register(ESim)
class ESimAdmin(admin.ModelAdmin):
    list_display = ['user', 'data_plan', 'status', 'data_remaining_gb', 'activated_date', 'expires_date']
    list_filter = ['status', 'activated_date', 'data_plan__region']
    search_fields = ['user__username', 'user__email', 'data_plan__region__name']
    readonly_fields = ['activated_date', 'expires_date']
    ordering = ['-activated_date']