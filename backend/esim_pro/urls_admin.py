from django.urls import path, include
from django.contrib import admin
from .admin_site import admin_site
from .views import admin_stats_api

urlpatterns = [
    path('admin/', admin.site.urls),
    path('admin-stats-api/', admin_stats_api, name='admin_stats_api'),
    path('api/auth/', include('users.urls')),
    path('api/plans/', include('plans.urls')),
    path('api/payments/', include('payments.urls')),
    path('api/esims/', include('esims.urls')),
]
