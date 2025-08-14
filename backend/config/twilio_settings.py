"""
Settings específicos para testing con Twilio Super SIM
Configuración adicional para settings.py
"""

import os
from pathlib import Path

# =============================================================================
# TWILIO SUPER SIM SETTINGS
# =============================================================================

# Credenciales Twilio
TWILIO_ACCOUNT_SID = os.getenv('TWILIO_ACCOUNT_SID', '')
TWILIO_AUTH_TOKEN = os.getenv('TWILIO_AUTH_TOKEN', '') 
TWILIO_SUPERSIM_FLEET_SID = os.getenv('TWILIO_SUPERSIM_FLEET_SID', '')
TWILIO_RATE_PLAN_SID = os.getenv('TWILIO_RATE_PLAN_SID', '')

# URLs base
TWILIO_BASE_URL = 'https://supersim.twilio.com/v1'
TWILIO_CONSOLE_URL = 'https://console.twilio.com/us1/develop/iot/supersim'

# =============================================================================
# CONFIGURACIÓN DE ESIM PROVIDERS
# =============================================================================

ESIM_PROVIDERS = {
    'active_provider': 'twilio',  # Proveedor activo para testing
    'providers': {
        'twilio': {
            'name': 'Twilio Super SIM',
            'enabled': True,
            'api_class': 'services.esim_providers.twilio_service.TwilioSuperSimService',
            'config': {
                'account_sid': TWILIO_ACCOUNT_SID,
                'auth_token': TWILIO_AUTH_TOKEN,
                'fleet_sid': TWILIO_SUPERSIM_FLEET_SID,
                'rate_plan_sid': TWILIO_RATE_PLAN_SID
            }
        },
        'oneglobal': {
            'name': '1GLOBAL',
            'enabled': False,  # Para implementar más adelante
            'api_class': 'services.esim_providers.oneglobal_service.OneGlobalService'
        }
    }
}

# =============================================================================
# CONFIGURACIÓN DE PRICING PARA TWILIO
# =============================================================================

TWILIO_PRICING = {
    # Costos base de Twilio (aproximados)
    'sim_activation_fee': 2.00,      # $2 por activación de SIM
    'data_cost_per_mb': 0.01,        # $0.01 por MB
    'sms_cost_per_message': 0.05,    # $0.05 por SMS
    'monthly_fee': 0.00,             # Sin costo mensual
    
    # Márgenes de Hablaris
    'markup_percentage': 60,         # 60% markup
    'minimum_price': 5.00,           # Precio mínimo $5
    'currency': 'USD'
}

# Configuración de planes predefinidos
HABLARIS_TWILIO_PLANS = {
    'test_1gb_global': {
        'name': 'Test Global 1GB',
        'data_limit_mb': 1024,
        'validity_days': 30,
        'countries': ['US', 'GB', 'DE', 'ES', 'FR'],
        'cost_usd': 8.00,
        'price_usd': 15.00,
        'features': ['data_only', 'hotspot']
    },
    'test_5gb_europe': {
        'name': 'Test Europa 5GB', 
        'data_limit_mb': 5120,
        'validity_days': 30,
        'countries': ['ES', 'FR', 'DE', 'IT', 'PT'],
        'cost_usd': 25.00,
        'price_usd': 45.00,
        'features': ['data_only', 'hotspot']
    }
}

# =============================================================================
# CONFIGURACIÓN DE CACHE
# =============================================================================

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'hablaris-cache',
        'TIMEOUT': 300,  # 5 minutos por defecto
        'OPTIONS': {
            'MAX_ENTRIES': 1000,
        }
    }
}

# Cache específico para Twilio
TWILIO_CACHE_SETTINGS = {
    'sim_details_timeout': 300,      # 5 minutos
    'usage_stats_timeout': 60,       # 1 minuto
    'rate_plans_timeout': 3600,      # 1 hora
    'countries_timeout': 86400       # 24 horas
}

# =============================================================================
# LOGGING PARA TWILIO
# =============================================================================

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'detailed': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'detailed',
        },
        'file': {
            'class': 'logging.FileHandler',
            'filename': 'logs/twilio_integration.log',
            'formatter': 'detailed',
        },
    },
    'loggers': {
        'services.esim_providers.twilio_service': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
        'scripts.test_twilio_integration': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}
