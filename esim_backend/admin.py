# Django Admin Configuration - Temporal
# Modelos comentados hasta que estén definidos

from django.contrib import admin

# Configuración básica del admin
admin.site.site_header = "🚀 Hablaris eSIM - Panel de Administración"
admin.site.site_title = "Hablaris Admin" 
admin.site.index_title = "🎯 Panel de Control"

# TODO: Descomentar cuando los modelos estén definidos
# from .models import User, Country, DataPlan, Order, ESim
# 
# @admin.register(User)
# class UserAdmin(admin.ModelAdmin):
#     list_display = ['username', 'email', 'date_joined']
#     search_fields = ['username', 'email']
