from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Custom User Model"""
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=15, blank=True)
    country_code = models.CharField(max_length=5, default='+1')
    is_verified = models.BooleanField(default=False)
    is_email_verified = models.BooleanField(default=False)
    date_of_birth = models.DateField(null=True, blank=True)
    profile_picture = models.URLField(blank=True)
    
    # Campos para autenticación social
    google_id = models.CharField(max_length=100, blank=True, unique=True, null=True)
    apple_id = models.CharField(max_length=100, blank=True, unique=True, null=True)
    social_auth_provider = models.CharField(
        max_length=20, 
        choices=[
            ('email', 'Email'),
            ('google', 'Google'),
            ('apple', 'Apple'),
        ],
        default='email'
    )
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    def __str__(self):
        return self.email


class UserProfile(models.Model):
    """Extended User Profile"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    preferred_language = models.CharField(max_length=10, default='es')
    preferred_currency = models.CharField(max_length=3, default='USD')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Profile of {self.user.email}"
