# Configuración de Testing con Twilio Super SIM para Hablaris
# Variables de entorno para desarrollo y testing

import os

# =============================================================================
# TWILIO SUPER SIM CONFIGURATION
# =============================================================================

# Credenciales de Twilio (obtener de https://console.twilio.com/)
TWILIO_ACCOUNT_SID = os.getenv('TWILIO_ACCOUNT_SID', '')
TWILIO_AUTH_TOKEN = os.getenv('TWILIO_AUTH_TOKEN', '')

# Super SIM específico
TWILIO_SUPERSIM_FLEET_SID = os.getenv('TWILIO_SUPERSIM_FLEET_SID', '')

# URLs base
TWILIO_BASE_URL = 'https://supersim.twilio.com/v1'
TWILIO_CONSOLE_URL = 'https://console.twilio.com/us1/develop/iot/supersim'

# =============================================================================
# CONFIGURACIÓN DE TESTING
# =============================================================================

# Configuración para ambiente de desarrollo
TWILIO_TESTING = {
    'enabled': True,
    'auto_create_plans': True,
    'default_data_limit': 1048576000,  # 1GB en bytes
    'test_countries': ['US', 'GB', 'DE', 'ES', 'FR'],
    'webhook_base_url': 'https://your-ngrok-url.ngrok.io'  # Para testing local
}

# Planes de prueba predefinidos
TWILIO_TEST_PLANS = {
    'basic_1gb': {
        'unique_name': 'hablaris_test_1gb',
        'friendly_name': 'Hablaris Test 1GB',
        'data_limit': 1073741824,  # 1GB
        'data_enabled': True,
        'messaging_enabled': False,
        'voice_enabled': False
    },
    'premium_5gb': {
        'unique_name': 'hablaris_test_5gb', 
        'friendly_name': 'Hablaris Test 5GB',
        'data_limit': 5368709120,  # 5GB
        'data_enabled': True,
        'messaging_enabled': True,
        'voice_enabled': False
    }
}

# Configuración de precios para testing
TWILIO_PRICING = {
    'base_sim_cost': 2.00,      # $2 por SIM
    'data_cost_per_mb': 0.01,   # $0.01 por MB
    'sms_cost': 0.05,           # $0.05 por SMS
    'markup_percentage': 50     # 50% markup para testing
}

# Webhooks para eventos de Twilio
TWILIO_WEBHOOKS = {
    'sim_ready': '/api/webhooks/twilio/sim-ready/',
    'sim_active': '/api/webhooks/twilio/sim-active/',
    'data_usage': '/api/webhooks/twilio/data-usage/',
    'data_limit': '/api/webhooks/twilio/data-limit/'
}
