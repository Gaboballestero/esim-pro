from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from rest_framework.generics import RetrieveUpdateAPIView
from django.contrib.auth import login, logout
from django.db import models
from .models import User, UserProfile
from .serializers import (
    UserRegistrationSerializer, 
    UserLoginSerializer, 
    UserSerializer, 
    UserProfileSerializer,
    UserProfileUpdateSerializer,
    ChangePasswordSerializer
)


class RegisterView(APIView):
    """Vista para registro de usuarios"""
    
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, created = Token.objects.get_or_create(user=user)
            
            return Response({
                'message': 'Usuario registrado exitosamente',
                'token': token.key,
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """Vista para login de usuarios"""
    
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            login(request, user)
            token, created = Token.objects.get_or_create(user=user)
            
            return Response({
                'message': 'Login exitoso',
                'token': token.key,
                'user': UserSerializer(user).data
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    """Vista para logout de usuarios"""
    
    def post(self, request):
        try:
            request.user.auth_token.delete()
            logout(request)
            return Response({
                'message': 'Logout exitoso'
            }, status=status.HTTP_200_OK)
        except:
            return Response({
                'error': 'Error al cerrar sesión'
            }, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(APIView):
    """Vista para ver y actualizar perfil de usuario"""
    
    def get(self, request):
        """Obtener información del perfil del usuario"""
        user = request.user
        # Asegurar que el usuario tenga un perfil
        profile, created = UserProfile.objects.get_or_create(user=user)
        
        user_data = UserSerializer(user).data
        return Response({
            'user': user_data,
            'message': 'Perfil obtenido exitosamente'
        }, status=status.HTTP_200_OK)
    
    def put(self, request):
        """Actualizar perfil del usuario"""
        user = request.user
        profile, created = UserProfile.objects.get_or_create(user=user)
        
        serializer = UserProfileUpdateSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            
            # Devolver los datos actualizados
            updated_user = UserSerializer(user).data
            return Response({
                'user': updated_user,
                'message': 'Perfil actualizado exitosamente'
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def patch(self, request):
        """Actualización parcial del perfil"""
        return self.put(request)


class ChangePasswordView(APIView):
    """Vista para cambiar contraseña"""
    
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = request.user
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            
            return Response({
                'message': 'Contraseña cambiada exitosamente'
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def verify_email(request):
    """Verificar email del usuario"""
    token = request.data.get('token')
    
    if not token:
        return Response({
            'error': 'Token requerido'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(verification_token=token)
        user.is_verified = True
        user.verification_token = ''
        user.save()
        
        return Response({
            'message': 'Email verificado exitosamente'
        }, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        return Response({
            'error': 'Token inválido'
        }, status=status.HTTP_400_BAD_REQUEST)


class UserStatsView(APIView):
    """Vista para obtener estadísticas del usuario"""
    
    def get(self, request):
        user = request.user
        
        # Importar modelos de eSIM si existen
        try:
            from esims.models import ESim, Order
            
            # Estadísticas de eSIMs
            total_esims = ESim.objects.filter(user=user).count()
            active_esims = ESim.objects.filter(user=user, status='ACTIVE').count()
            
            # Estadísticas de órdenes
            total_orders = Order.objects.filter(user=user).count()
            total_spent = Order.objects.filter(
                user=user, 
                status='COMPLETED'
            ).aggregate(total=models.Sum('total_amount'))['total'] or 0
            
        except ImportError:
            # Si no existen los modelos de eSIM, usar valores por defecto
            total_esims = 0
            active_esims = 0
            total_orders = 0
            total_spent = 0
        
        stats = {
            'profile': {
                'member_since': user.date_joined.strftime('%Y-%m-%d'),
                'is_verified': user.is_verified,
                'total_esims': total_esims,
                'active_esims': active_esims,
            },
            'usage': {
                'total_orders': total_orders,
                'total_spent': float(total_spent),
                'preferred_currency': user.profile.preferred_currency if hasattr(user, 'profile') else 'USD',
            }
        }
        
        return Response({
            'stats': stats,
            'message': 'Estadísticas obtenidas exitosamente'
        }, status=status.HTTP_200_OK)


class DeleteAccountView(APIView):
    """Vista para eliminar cuenta de usuario"""
    
    def post(self, request):
        password = request.data.get('password')
        
        if not password:
            return Response({
                'error': 'Contraseña requerida para eliminar la cuenta'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user = request.user
        
        if not user.check_password(password):
            return Response({
                'error': 'Contraseña incorrecta'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Eliminar token de autenticación
            user.auth_token.delete()
        except:
            pass
        
        # Eliminar usuario (esto también eliminará el perfil por CASCADE)
        user.delete()
        
        return Response({
            'message': 'Cuenta eliminada exitosamente'
        }, status=status.HTTP_200_OK)
