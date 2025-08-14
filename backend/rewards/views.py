from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings
from .models import ReferralCode, Referral, LoyaltyPoints, PointsTransaction, Reward, RewardRedemption
from .serializers import (
    ReferralCodeSerializer, ReferralSerializer, LoyaltyPointsSerializer,
    PointsTransactionSerializer, RewardSerializer, RewardRedemptionSerializer,
    ReferFriendSerializer
)

User = get_user_model()


class ReferralCodeView(generics.RetrieveAPIView):
    """Obtener código de referido del usuario"""
    serializer_class = ReferralCodeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        referral_code, created = ReferralCode.objects.get_or_create(user=self.request.user)
        return referral_code


class MyReferralsView(generics.ListAPIView):
    """Lista de referidos del usuario"""
    serializer_class = ReferralSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Referral.objects.filter(referrer=self.request.user)


class LoyaltyPointsView(generics.RetrieveAPIView):
    """Puntos de fidelidad del usuario"""
    serializer_class = LoyaltyPointsSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        loyalty_points, created = LoyaltyPoints.objects.get_or_create(user=self.request.user)
        return loyalty_points


class PointsHistoryView(generics.ListAPIView):
    """Historial de puntos del usuario"""
    serializer_class = PointsTransactionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return PointsTransaction.objects.filter(user=self.request.user)


class AvailableRewardsView(generics.ListAPIView):
    """Recompensas disponibles"""
    serializer_class = RewardSerializer
    permission_classes = []  # Público para mostrar recompensas disponibles
    
    def get_queryset(self):
        return Reward.objects.filter(is_active=True)


class MyRedemptionsView(generics.ListAPIView):
    """Historial de canjes del usuario"""
    serializer_class = RewardRedemptionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return RewardRedemption.objects.filter(user=self.request.user)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def redeem_reward(request, reward_id):
    """Canjear una recompensa"""
    try:
        reward = Reward.objects.get(id=reward_id, is_active=True)
        loyalty_points = LoyaltyPoints.objects.get(user=request.user)
        
        # Verificar si tiene suficientes puntos
        if loyalty_points.available_points < reward.points_required:
            return Response({
                'error': 'No tienes suficientes puntos para esta recompensa'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Verificar límite de canjes
        if reward.max_redemptions and reward.current_redemptions >= reward.max_redemptions:
            return Response({
                'error': 'Esta recompensa ya no está disponible'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Realizar el canje
        if loyalty_points.spend_points(reward.points_required, f"Canje: {reward.name}"):
            redemption = RewardRedemption.objects.create(
                user=request.user,
                reward=reward,
                points_spent=reward.points_required
            )
            
            # Actualizar contador de canjes
            reward.current_redemptions += 1
            reward.save()
            
            return Response({
                'message': 'Recompensa canjeada exitosamente',
                'redemption_id': redemption.id
            }, status=status.HTTP_200_OK)
        
        return Response({
            'error': 'Error al procesar el canje'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    except Reward.DoesNotExist:
        return Response({
            'error': 'Recompensa no encontrada'
        }, status=status.HTTP_404_NOT_FOUND)
    except LoyaltyPoints.DoesNotExist:
        return Response({
            'error': 'Perfil de puntos no encontrado'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def refer_friend(request):
    """Enviar invitación de referido"""
    serializer = ReferFriendSerializer(data=request.data)
    
    if serializer.is_valid():
        email = serializer.validated_data['email']
        message = serializer.validated_data.get('message', '')
        
        # Obtener código de referido
        referral_code, _ = ReferralCode.objects.get_or_create(user=request.user)
        
        # Enviar email de invitación
        subject = f"{request.user.username} te invita a eSIM Pro"
        email_message = f"""
        ¡Hola!
        
        {request.user.username} te ha invitado a unirte a eSIM Pro, la mejor app para eSIMs de viaje.
        
        Usa el código {referral_code.code} al registrarte y recibe $5 de descuento en tu primera compra.
        ¡Ambos recibirán recompensas!
        
        {message}
        
        Descarga la app ahora: https://esimpro.com/download
        
        ¡Buen viaje!
        El equipo de eSIM Pro
        """
        
        try:
            send_mail(
                subject,
                email_message,
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )
            
            return Response({
                'message': 'Invitación enviada exitosamente'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': 'Error al enviar la invitación'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def validate_referral_code(request):
    """Validar código de referido al registrarse"""
    code = request.data.get('code', '').upper()
    
    try:
        referral_code = ReferralCode.objects.get(code=code, is_active=True)
        
        # Verificar que no se refiera a sí mismo
        if referral_code.user == request.user:
            return Response({
                'error': 'No puedes usar tu propio código de referido'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'valid': True,
            'referrer': referral_code.user.username,
            'reward_amount': 5.00
        }, status=status.HTTP_200_OK)
        
    except ReferralCode.DoesNotExist:
        return Response({
            'valid': False,
            'error': 'Código de referido inválido'
        }, status=status.HTTP_400_BAD_REQUEST)
