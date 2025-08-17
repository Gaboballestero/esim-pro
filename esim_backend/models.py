from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Country(models.Model):
    """Países disponibles para eSIM"""
    name = models.CharField(max_length=100, unique=True, verbose_name="País")
    code = models.CharField(max_length=3, unique=True, verbose_name="Código ISO")
    flag = models.CharField(max_length=10, verbose_name="Emoji Flag")
    is_popular = models.BooleanField(default=False, verbose_name="¿Es popular?")
    
    class Meta:
        verbose_name = "País"
        verbose_name_plural = "Países"
        ordering = ['name']
    
    def __str__(self):
        return f"{self.flag} {self.name}"

class Region(models.Model):
    """Regiones geográficas que agrupan países"""
    name = models.CharField(max_length=100, unique=True, verbose_name="Región")
    countries = models.ManyToManyField(Country, verbose_name="Países")
    
    class Meta:
        verbose_name = "Región"
        verbose_name_plural = "Regiones"
        ordering = ['name']
    
    def __str__(self):
        return self.name

class DataPlan(models.Model):
    """Planes de datos eSIM"""
    region = models.ForeignKey(Region, on_delete=models.CASCADE, verbose_name="Región")
    data_gb = models.IntegerField(verbose_name="Datos (GB)")
    duration_days = models.IntegerField(verbose_name="Duración (días)")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Precio USD")
    
    class Meta:
        verbose_name = "Plan de Datos"
        verbose_name_plural = "Planes de Datos"
        ordering = ['region', 'price']
    
    def __str__(self):
        return f"{self.region.name} - {self.data_gb}GB / {self.duration_days}d - ${self.price}"

class ESim(models.Model):
    """eSIMs de usuarios"""
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('active', 'Activo'),
        ('expired', 'Vencido'),
        ('cancelled', 'Cancelado'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Usuario")
    data_plan = models.ForeignKey(DataPlan, on_delete=models.CASCADE, verbose_name="Plan de Datos")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name="Estado")
    data_remaining_gb = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="GB Restantes")
    activated_date = models.DateTimeField(null=True, blank=True, verbose_name="Fecha Activación")
    expires_date = models.DateTimeField(null=True, blank=True, verbose_name="Fecha Vencimiento")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Creado")
    
    class Meta:
        verbose_name = "eSIM"
        verbose_name_plural = "eSIMs"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.data_plan.region.name} ({self.status})"
    
    def save(self, *args, **kwargs):
        # Auto-set data remaining when created
        if not self.pk and not self.data_remaining_gb:
            self.data_remaining_gb = self.data_plan.data_gb
        super().save(*args, **kwargs)