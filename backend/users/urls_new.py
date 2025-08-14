from django.urls import path
from . import views

app_name = 'users'

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('profile/', views.ProfileView.as_view(), name='profile'),
    path('profile/stats/', views.UserStatsView.as_view(), name='user_stats'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change_password'),
    path('verify-email/', views.verify_email, name='verify_email'),
    path('delete-account/', views.DeleteAccountView.as_view(), name='delete_account'),
]
