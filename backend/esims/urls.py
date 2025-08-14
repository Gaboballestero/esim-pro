from django.urls import path
from . import views

app_name = 'esims'

urlpatterns = [
    # Estas URLs se activarán cuando se configure DRF
    # path('', views.ESimListView.as_view(), name='esim_list'),
    # path('<uuid:pk>/', views.ESimDetailView.as_view(), name='esim_detail'),
    # path('<uuid:pk>/activate/', views.ESimActivateView.as_view(), name='esim_activate'),
    # path('<uuid:pk>/usage/', views.ESimUsageView.as_view(), name='esim_usage'),
]
