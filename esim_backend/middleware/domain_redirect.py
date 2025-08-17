"""
Middleware para manejar redirecciones de dominio
"""
from django.conf import settings
from django.http import HttpResponsePermanentRedirect


class DomainRedirectMiddleware:
    """
    Middleware para redirigir de hablaris.com a www.hablaris.com
    """
    
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Obtener el host actual
        host = request.get_host().lower()
        
        # Si es el dominio raíz sin www, redirigir a www
        if host == 'hablaris.com':
            redirect_url = f"https://www.hablaris.com{request.get_full_path()}"
            return HttpResponsePermanentRedirect(redirect_url)
        
        response = self.get_response(request)
        return response
