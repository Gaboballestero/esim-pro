from django.urls import path
from . import views

app_name = 'payments'

urlpatterns = [
    # Estas URLs se activarán cuando se configure DRF
    # path('create-intent/', views.CreatePaymentIntentView.as_view(), name='create_intent'),
    # path('confirm/', views.ConfirmPaymentView.as_view(), name='confirm_payment'),
    # path('orders/', views.OrderListView.as_view(), name='order_list'),
    # path('orders/<uuid:pk>/', views.OrderDetailView.as_view(), name='order_detail'),
]
