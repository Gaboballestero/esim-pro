from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import SocialAuthTokenSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def social_auth(request):
    """
    Autenticación social con Google o Apple
    
    Endpoint: POST /api/auth/social/
    
    Body:
    {
        "provider": "google" | "apple",
        "id_token": "token_from_provider",
        "user_info": {...}  // Solo para Apple, primera vez
    }
    """
    serializer = SocialAuthTokenSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.validated_data['user']
        
        # Generar tokens JWT
        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token
        
        return Response({
            'success': True,
            'message': 'Autenticación exitosa',
            'data': {
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'username': user.username,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'profile_picture': user.profile_picture,
                    'is_email_verified': user.is_email_verified,
                },
                'tokens': {
                    'access': str(access_token),
                    'refresh': str(refresh),
                }
            }
        }, status=status.HTTP_200_OK)
    
    return Response({
        'success': False,
        'message': 'Error en la autenticación',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def google_auth(request):
    """
    Autenticación específica para Google
    
    Endpoint: POST /api/auth/google/
    
    Body:
    {
        "id_token": "google_id_token"
    }
    """
    data = {
        'provider': 'google',
        'id_token': request.data.get('id_token')
    }
    
    serializer = SocialAuthTokenSerializer(data=data)
    
    if serializer.is_valid():
        user = serializer.validated_data['user']
        
        # Generar tokens JWT
        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token
        
        return Response({
            'success': True,
            'message': 'Autenticación con Google exitosa',
            'data': {
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'username': user.username,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'profile_picture': user.profile_picture,
                    'is_email_verified': user.is_email_verified,
                },
                'tokens': {
                    'access': str(access_token),
                    'refresh': str(refresh),
                }
            }
        }, status=status.HTTP_200_OK)
    
    return Response({
        'success': False,
        'message': 'Error en la autenticación con Google',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def apple_auth(request):
    """
    Autenticación específica para Apple
    
    Endpoint: POST /api/auth/apple/
    
    Body:
    {
        "id_token": "apple_id_token",
        "user_info": {  // Solo la primera vez
            "name": {
                "firstName": "John",
                "lastName": "Doe"
            }
        }
    }
    """
    data = {
        'provider': 'apple',
        'id_token': request.data.get('id_token'),
        'user_info': request.data.get('user_info', {})
    }
    
    serializer = SocialAuthTokenSerializer(data=data)
    
    if serializer.is_valid():
        user = serializer.validated_data['user']
        
        # Generar tokens JWT
        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token
        
        return Response({
            'success': True,
            'message': 'Autenticación con Apple exitosa',
            'data': {
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'username': user.username,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'profile_picture': user.profile_picture,
                    'is_email_verified': user.is_email_verified,
                },
                'tokens': {
                    'access': str(access_token),
                    'refresh': str(refresh),
                }
            }
        }, status=status.HTTP_200_OK)
    
    return Response({
        'success': False,
        'message': 'Error en la autenticación con Apple',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)
