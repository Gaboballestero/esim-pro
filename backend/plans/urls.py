from django.urls import path
from . import views

app_name = 'plans'

urlpatterns = [
    path('', views.plans_list, name='plans_list'),
    path('countries/', views.countries_list, name='countries_list'),
]
