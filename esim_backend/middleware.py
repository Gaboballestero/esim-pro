"""
Middleware para manejo de dominios - eSIM Pro
"""

class DomainRedirectMiddleware:
    """
    Middleware para redirigir el tráfico entre www y no-www
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        host = request.get_host()
        
        # Si viene de hablaris.com sin www, redirigir a www.hablaris.com
        if host == 'hablaris.com':
            return self.redirect_to_www(request)
        
        response = self.get_response(request)
        return response
    
    def redirect_to_www(self, request):
        from django.http import HttpResponsePermanentRedirect
        protocol = 'https' if request.is_secure() else 'http'
        new_url = f"{protocol}://www.hablaris.com{request.get_full_path()}"
        return HttpResponsePermanentRedirect(new_url)
