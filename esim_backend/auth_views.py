"""
API Views para autenticación unificada web/móvil
Incluye autenticación social con Google y Apple
"""

import os
import json
import requests
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
import logging

logger = logging.getLogger(__name__)

@csrf_exempt
@require_http_methods(["POST"])
def login_view(request):
    """Login tradicional con email/password"""
    try:
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return JsonResponse({
                'success': False,
                'error': 'Email y contraseña requeridos'
            }, status=400)
        
        # Buscar usuario por email
        try:
            user = User.objects.get(email=email)
            username = user.username
        except User.DoesNotExist:
            return JsonResponse({
                'success': False,
                'error': 'Usuario no encontrado'
            }, status=401)
        
        # Autenticar
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)
            
            return JsonResponse({
                'success': True,
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'username': user.username,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                },
                'message': 'Login exitoso'
            })
        else:
            return JsonResponse({
                'success': False,
                'error': 'Credenciales inválidas'
            }, status=401)
            
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'JSON inválido'
        }, status=400)
    except Exception as e:
        logger.error(f"Error en login: {e}")
        return JsonResponse({
            'success': False,
            'error': 'Error interno del servidor'
        }, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def register_view(request):
    """Registro de nuevos usuarios"""
    try:
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')
        first_name = data.get('first_name', '')
        last_name = data.get('last_name', '')
        
        if not email or not password:
            return JsonResponse({
                'success': False,
                'error': 'Email y contraseña requeridos'
            }, status=400)
        
        # Verificar si el usuario ya existe
        if User.objects.filter(email=email).exists():
            return JsonResponse({
                'success': False,
                'error': 'Ya existe un usuario con este email'
            }, status=400)
        
        # Crear usuario
        username = email  # Usar email como username
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )
        
        # Auto-login después del registro
        login(request, user)
        
        return JsonResponse({
            'success': True,
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
            },
            'message': 'Registro exitoso'
        })
        
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'JSON inválido'
        }, status=400)
    except Exception as e:
        logger.error(f"Error en registro: {e}")
        return JsonResponse({
            'success': False,
            'error': 'Error interno del servidor'
        }, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def logout_view(request):
    """Logout de usuario"""
    try:
        logout(request)
        return JsonResponse({
            'success': True,
            'message': 'Logout exitoso'
        })
    except Exception as e:
        logger.error(f"Error en logout: {e}")
        return JsonResponse({
            'success': False,
            'error': 'Error en logout'
        }, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def google_auth(request):
    """Redirección a Google OAuth"""
    try:
        # En producción, configurar URLs reales
        google_oauth_url = "https://accounts.google.com/oauth2/auth"
        client_id = os.getenv('GOOGLE_CLIENT_ID', 'tu-google-client-id')
        redirect_uri = os.getenv('GOOGLE_REDIRECT_URI', 'http://localhost:8000/api/auth/google/callback')
        
        params = {
            'client_id': client_id,
            'redirect_uri': redirect_uri,
            'scope': 'openid email profile',
            'response_type': 'code',
            'access_type': 'offline',
            'prompt': 'consent'
        }
        
        # Construir URL de Google OAuth
        auth_url = f"{google_oauth_url}?{'&'.join([f'{k}={v}' for k, v in params.items()])}"
        
        return JsonResponse({
            'success': True,
            'auth_url': auth_url,
            'message': 'Redirigir a Google OAuth'
        })
        
    except Exception as e:
        logger.error(f"Error en Google auth: {e}")
        return JsonResponse({
            'success': False,
            'error': 'Error en autenticación Google'
        }, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def google_callback(request):
    """Callback de Google OAuth"""
    try:
        code = request.GET.get('code')
        
        if not code:
            return JsonResponse({
                'success': False,
                'error': 'Código de autorización no recibido'
            }, status=400)
        
        # Intercambiar código por token
        token_url = "https://oauth2.googleapis.com/token"
        token_data = {
            'client_id': os.getenv('GOOGLE_CLIENT_ID'),
            'client_secret': os.getenv('GOOGLE_CLIENT_SECRET'),
            'code': code,
            'grant_type': 'authorization_code',
            'redirect_uri': os.getenv('GOOGLE_REDIRECT_URI', 'http://localhost:8000/api/auth/google/callback')
        }
        
        token_response = requests.post(token_url, data=token_data)
        token_json = token_response.json()
        
        if 'access_token' not in token_json:
            return JsonResponse({
                'success': False,
                'error': 'Error obteniendo token de Google'
            }, status=400)
        
        # Obtener info del usuario de Google
        user_info_url = f"https://www.googleapis.com/oauth2/v2/userinfo?access_token={token_json['access_token']}"
        user_response = requests.get(user_info_url)
        user_data = user_response.json()
        
        # Crear o buscar usuario
        email = user_data.get('email')
        
        if not email:
            return JsonResponse({
                'success': False,
                'error': 'No se pudo obtener email de Google'
            }, status=400)
        
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'username': email,
                'first_name': user_data.get('given_name', ''),
                'last_name': user_data.get('family_name', ''),
            }
        )
        
        # Login automático
        login(request, user)
        
        # Redirigir al frontend
        frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
        
        return JsonResponse({
            'success': True,
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
            },
            'redirect_url': f'{frontend_url}/dashboard-simple',
            'message': 'Login con Google exitoso'
        })
        
    except Exception as e:
        logger.error(f"Error en Google callback: {e}")
        return JsonResponse({
            'success': False,
            'error': 'Error procesando callback de Google'
        }, status=500)

@csrf_exempt
@require_http_methods(["GET"])  
def apple_auth(request):
    """Autenticación con Apple (placeholder)"""
    try:
        # Por ahora retornamos una respuesta placeholder
        # En producción necesitarás configurar Apple Sign In
        return JsonResponse({
            'success': False,
            'error': 'Apple Sign In en desarrollo',
            'message': 'Esta funcionalidad estará disponible próximamente'
        }, status=501)
        
    except Exception as e:
        logger.error(f"Error en Apple auth: {e}")
        return JsonResponse({
            'success': False,
            'error': 'Error en autenticación Apple'
        }, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def user_profile(request):
    """Obtener perfil del usuario autenticado"""
    try:
        if not request.user.is_authenticated:
            return JsonResponse({
                'success': False,
                'error': 'Usuario no autenticado'
            }, status=401)
        
        user = request.user
        return JsonResponse({
            'success': True,
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'date_joined': user.date_joined.isoformat(),
                'last_login': user.last_login.isoformat() if user.last_login else None,
            }
        })
        
    except Exception as e:
        logger.error(f"Error obteniendo perfil: {e}")
        return JsonResponse({
            'success': False,
            'error': 'Error obteniendo perfil'
        }, status=500)
