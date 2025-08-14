from django.contrib import admin
from .models import PlanCategory, FlexiblePlan, PlanCountryCoverage, CustomPlanBuilder, PlanRecommendation, PlanComparison


@admin.register(PlanCategory)
class PlanCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'display_order', 'is_active')
    list_editable = ('display_order', 'is_active')
    ordering = ('display_order', 'name')


@admin.register(FlexiblePlan)
class FlexiblePlanAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'plan_type', 'base_price', 'duration_display', 'is_active', 'is_featured', 'is_popular')
    list_filter = ('category', 'plan_type', 'is_active', 'is_featured', 'is_popular')
    search_fields = ('name', 'description')
    list_editable = ('is_active', 'is_featured', 'is_popular')
    
    def duration_display(self, obj):
        return obj.get_duration_display()
    duration_display.short_description = 'Duración'


@admin.register(PlanCountryCoverage)
class PlanCountryCoverageAdmin(admin.ModelAdmin):
    list_display = ('plan', 'country', 'coverage_quality', 'local_price', 'allows_5g')
    list_filter = ('coverage_quality', 'allows_5g', 'country__continent')
    search_fields = ('plan__name', 'country__name')


@admin.register(CustomPlanBuilder)
class CustomPlanBuilderAdmin(admin.ModelAdmin):
    list_display = ('user', 'name', 'data_amount_gb', 'duration_days', 'calculated_price', 'is_active')
    list_filter = ('is_active', 'includes_5g', 'includes_hotspot')
    search_fields = ('user__username', 'name')
    filter_horizontal = ('selected_countries',)


@admin.register(PlanRecommendation)
class PlanRecommendationAdmin(admin.ModelAdmin):
    list_display = ('user', 'plan', 'recommendation_reason', 'confidence_score', 'user_purchased')
    list_filter = ('recommendation_reason', 'user_purchased', 'shown_to_user')
    search_fields = ('user__username', 'plan__name')


@admin.register(PlanComparison)
class PlanComparisonAdmin(admin.ModelAdmin):
    list_display = ('user', 'name', 'target_country', 'created_at')
    search_fields = ('user__username', 'name')
    filter_horizontal = ('plans',)
