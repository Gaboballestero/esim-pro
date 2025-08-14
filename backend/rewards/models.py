from django.db import models
from django.contrib.auth import get_user_model
import uuid
import string
import random

User = get_user_model()


class ReferralCode(models.Model):
    """Códigos de referido únicos por usuario"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='referral_code')
    code = models.CharField(max_length=10, unique=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    def save(self, *args, **kwargs):
        if not self.code:
            self.code = self.generate_unique_code()
        super().save(*args, **kwargs)
    
    def generate_unique_code(self):
        """Genera un código único de 8 caracteres"""
        while True:
            code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
            if not ReferralCode.objects.filter(code=code).exists():
                return code
    
    def __str__(self):
        return f"{self.user.username} - {self.code}"


class Referral(models.Model):
    """Registro de referidos"""
    referrer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='referrals_made')
    referred = models.ForeignKey(User, on_delete=models.CASCADE, related_name='referral_received')
    referral_code = models.ForeignKey(ReferralCode, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    reward_given = models.BooleanField(default=False)
    reward_amount = models.DecimalField(max_digits=10, decimal_places=2, default=5.00)
    
    class Meta:
        unique_together = ('referrer', 'referred')
    
    def __str__(self):
        return f"{self.referrer.username} → {self.referred.username}"


class LoyaltyPoints(models.Model):
    """Sistema de puntos de fidelidad"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='loyalty_points')
    total_points = models.IntegerField(default=0)
    available_points = models.IntegerField(default=0)
    lifetime_points = models.IntegerField(default=0)
    tier = models.CharField(max_length=20, choices=[
        ('bronze', 'Bronze'),
        ('silver', 'Silver'), 
        ('gold', 'Gold'),
        ('platinum', 'Platinum')
    ], default='bronze')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def add_points(self, points, reason=""):
        """Agregar puntos con razón"""
        self.total_points += points
        self.available_points += points
        self.lifetime_points += points
        self.update_tier()
        self.save()
        
        # Crear registro de transacción
        PointsTransaction.objects.create(
            user=self.user,
            points=points,
            transaction_type='earned',
            reason=reason
        )
    
    def spend_points(self, points, reason=""):
        """Gastar puntos"""
        if self.available_points >= points:
            self.available_points -= points
            self.save()
            
            PointsTransaction.objects.create(
                user=self.user,
                points=-points,
                transaction_type='spent',
                reason=reason
            )
            return True
        return False
    
    def update_tier(self):
        """Actualizar tier basado en puntos lifetime"""
        if self.lifetime_points >= 10000:
            self.tier = 'platinum'
        elif self.lifetime_points >= 5000:
            self.tier = 'gold'
        elif self.lifetime_points >= 1000:
            self.tier = 'silver'
        else:
            self.tier = 'bronze'
    
    def __str__(self):
        return f"{self.user.username} - {self.available_points} points ({self.tier})"


class PointsTransaction(models.Model):
    """Historial de transacciones de puntos"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='points_transactions')
    points = models.IntegerField()
    transaction_type = models.CharField(max_length=20, choices=[
        ('earned', 'Ganados'),
        ('spent', 'Gastados'),
        ('expired', 'Expirados'),
        ('bonus', 'Bonus')
    ])
    reason = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.points} points ({self.transaction_type})"


class Reward(models.Model):
    """Recompensas disponibles"""
    name = models.CharField(max_length=100)
    description = models.TextField()
    points_required = models.IntegerField()
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    reward_type = models.CharField(max_length=20, choices=[
        ('discount', 'Descuento'),
        ('free_data', 'Data Gratis'),
        ('upgrade', 'Upgrade de Plan'),
        ('credit', 'Crédito')
    ])
    is_active = models.BooleanField(default=True)
    max_redemptions = models.IntegerField(null=True, blank=True)
    current_redemptions = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name} - {self.points_required} points"


class RewardRedemption(models.Model):
    """Historial de canje de recompensas"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reward_redemptions')
    reward = models.ForeignKey(Reward, on_delete=models.CASCADE)
    points_spent = models.IntegerField()
    redeemed_at = models.DateTimeField(auto_now_add=True)
    used = models.BooleanField(default=False)
    used_at = models.DateTimeField(null=True, blank=True)
    # order = models.ForeignKey('orders.Order', on_delete=models.SET_NULL, null=True, blank=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.reward.name}"
