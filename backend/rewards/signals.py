from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import ReferralCode, LoyaltyPoints

User = get_user_model()


@receiver(post_save, sender=User)
def create_user_rewards_profile(sender, instance, created, **kwargs):
    """Crear perfiles de recompensas cuando se crea un usuario"""
    if created:
        # Crear código de referido
        ReferralCode.objects.create(user=instance)
        
        # Crear perfil de puntos de fidelidad
        LoyaltyPoints.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_rewards_profile(sender, instance, **kwargs):
    """Guardar perfiles de recompensas cuando se actualiza un usuario"""
    if hasattr(instance, 'referral_code'):
        instance.referral_code.save()
    if hasattr(instance, 'loyalty_points'):
        instance.loyalty_points.save()
