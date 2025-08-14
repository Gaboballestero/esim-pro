from django.contrib import admin
from django.utils.html import format_html
from .models import Country, DataPlan


@admin.register(Country)
class CountryAdmin(admin.ModelAdmin):
    """Panel de administración para países"""

    list_display = ('name', 'iso_code', 'flag_display', 'currency', 'is_active', 'plans_count')
    list_filter = ('is_active', 'currency')
    search_fields = ('name', 'iso_code')
    list_editable = ('is_active',)
    ordering = ('name',)

    def flag_display(self, obj):
        """Mostrar emoji de bandera"""
        return obj.flag_emoji if obj.flag_emoji else '🏳️'
    flag_display.short_description = 'Bandera'

    def plans_count(self, obj):
        """Contar planes disponibles para este país"""
        return obj.dataplan_set.count()
    plans_count.short_description = 'Planes'


@admin.register(DataPlan)
class DataPlanAdmin(admin.ModelAdmin):
    """Panel de administración para planes de datos"""

    list_display = (
        'name', 'plan_type_display', 'data_amount_display',
        'price_display', 'validity_days', 'is_active', 'countries_count'
    )
    list_filter = ('plan_type', 'validity_days', 'is_active', 'created_at')
    search_fields = ('name', 'description')
    list_editable = ('is_active',)
    filter_horizontal = ('countries',)
    readonly_fields = ('created_at', 'updated_at')

    fieldsets = (
        ('Información Básica', {
            'fields': ('name', 'description', 'plan_type')
        }),
        ('Características Técnicas', {
            'fields': ('data_amount', 'validity_days', 'max_speed')
        }),
        ('Cobertura', {
            'fields': ('countries',)
        }),
        ('Precios y Disponibilidad', {
            'fields': ('price', 'discount_price', 'is_active', 'is_popular')
        }),
        ('Fechas', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def plan_type_display(self, obj):
        """Mostrar tipo de plan con colores"""
        colors = {
            'data_only': '#17a2b8',
            'data_sms': '#28a745',
            'data_voice_sms': '#007bff',
            'unlimited': '#ffc107'
        }
        color = colors.get(obj.plan_type, '#6c757d')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.get_plan_type_display()
        )
    plan_type_display.short_description = 'Tipo'

    def data_amount_display(self, obj):
        """Mostrar cantidad de datos formateada"""
        if obj.data_amount >= 1024:
            return f"{obj.data_amount // 1024} GB"
        return f"{obj.data_amount} MB"
    data_amount_display.short_description = 'Datos'

    def price_display(self, obj):
        """Mostrar precio con descuento si aplica"""
        if obj.discount_price and obj.discount_price < obj.price:
            return format_html(
                '<span style="text-decoration: line-through;">${}</span> <strong style="color: #dc3545;">${}</strong>',
                obj.price, obj.discount_price
            )
        return f"${obj.price}"
    price_display.short_description = 'Precio'

    def countries_count(self, obj):
        """Contar países cubiertos"""
        return obj.countries.count()
    countries_count.short_description = 'Países'

    actions = ['activate_plans', 'deactivate_plans', 'feature_plans']

    def activate_plans(self, request, queryset):
        """Activar planes seleccionados"""
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} planes activados.')
    activate_plans.short_description = 'Activar planes seleccionados'

    def deactivate_plans(self, request, queryset):
        """Desactivar planes seleccionados"""
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} planes desactivados.')
    deactivate_plans.short_description = 'Desactivar planes seleccionados'

    def feature_plans(self, request, queryset):
        """Destacar planes seleccionados"""
        updated = queryset.update(is_popular=True)
        self.message_user(request, f'{updated} planes destacados.')
    feature_plans.short_description = 'Destacar planes seleccionados'
