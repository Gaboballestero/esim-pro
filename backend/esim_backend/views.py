from django.http import JsonResponse
from django.shortcuts import render

def home(request):
    """Vista principal de bienvenida"""
    return JsonResponse({
        'message': '¡Bienvenido a eSIM Pro!',
        'status': 'success',
        'version': '1.0.0',
        'description': 'API REST para gestión de eSIMs - Plataforma tipo Holafly',
        'endpoints': {
            'admin': '/admin/',
            'api_docs': 'Próximamente con DRF',
        }
    })

def health(request):
    """Health check endpoint"""
    return JsonResponse({
        'status': 'healthy',
        'service': 'eSIM Pro Backend'
    })
