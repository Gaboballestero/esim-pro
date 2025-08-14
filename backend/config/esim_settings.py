# eSIM Provider Settings para Hablaris
# Configuración de proveedores de eSIM

# =============================================================================
# AIRALO CONFIGURATION
# =============================================================================
AIRALO_CLIENT_ID = os.getenv('AIRALO_CLIENT_ID', '')
AIRALO_CLIENT_SECRET = os.getenv('AIRALO_CLIENT_SECRET', '')
AIRALO_SANDBOX = os.getenv('AIRALO_SANDBOX', 'True').lower() == 'true'
AIRALO_WEBHOOK_SECRET = os.getenv('AIRALO_WEBHOOK_SECRET', '')

# URLs de Airalo
AIRALO_BASE_URL = 'https://sandbox-partners.airalo.com/api/v2' if AIRALO_SANDBOX else 'https://partners.airalo.com/api/v2'

# =============================================================================
# 1GLOBAL CONFIGURATION (Para futura implementación)
# =============================================================================
ONEGLOBAL_API_KEY = os.getenv('ONEGLOBAL_API_KEY', '')
ONEGLOBAL_SECRET = os.getenv('ONEGLOBAL_SECRET', '')
ONEGLOBAL_SANDBOX = os.getenv('ONEGLOBAL_SANDBOX', 'True').lower() == 'true'

# =============================================================================
# TWILIO SUPER SIM CONFIGURATION (Para futura implementación)
# =============================================================================
TWILIO_ACCOUNT_SID = os.getenv('TWILIO_ACCOUNT_SID', '')
TWILIO_AUTH_TOKEN = os.getenv('TWILIO_AUTH_TOKEN', '')
TWILIO_SUPERSIM_FLEET_SID = os.getenv('TWILIO_SUPERSIM_FLEET_SID', '')

# =============================================================================
# ESIM PROVIDER SETTINGS
# =============================================================================
ESIM_PROVIDERS = {
    'primary': 'airalo',  # Proveedor principal
    'backup': [],         # Proveedores de respaldo
    'testing': 'airalo'   # Proveedor para testing
}

# Configuración de márgenes por proveedor
ESIM_MARGINS = {
    'airalo': {
        'default': 0.35,      # 35% margen por defecto
        'premium': 0.45,      # 45% para planes premium
        'bulk': 0.25,         # 25% para órdenes grandes
    },
    '1global': {
        'default': 0.50,      # 50% margen por defecto
        'premium': 0.60,      # 60% para planes premium
        'bulk': 0.40,         # 40% para órdenes grandes
    },
    'twilio': {
        'default': 0.40,      # 40% margen por defecto
        'premium': 0.50,      # 50% para planes premium
        'bulk': 0.30,         # 30% para órdenes grandes
    }
}

# Configuración de cache para planes
ESIM_CACHE_SETTINGS = {
    'plans_cache_timeout': 3600,      # 1 hora
    'usage_cache_timeout': 300,       # 5 minutos
    'countries_cache_timeout': 86400,  # 24 horas
}

# Configuración de webhooks
ESIM_WEBHOOK_SETTINGS = {
    'airalo_webhook_url': '/api/webhooks/airalo/',
    'verify_signatures': True,
    'timeout': 30,
}

# Configuración de retry para APIs
ESIM_API_RETRY = {
    'max_retries': 3,
    'retry_delay': 1,
    'backoff_factor': 2,
}
