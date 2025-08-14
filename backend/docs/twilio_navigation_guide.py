"""
GUÍA VISUAL PARA TWILIO CONSOLE 2025
Ubicaciones actualizadas en la interfaz en inglés
"""

# =============================================================================
# NAVEGACIÓN EN TWILIO CONSOLE (INTERFAZ 2025)
# =============================================================================

TWILIO_NAVIGATION_GUIDE = {
    "account_info": {
        "location": "Dashboard → Account Info (sidebar izquierdo)",
        "items_to_copy": {
            "account_sid": "Empieza con 'AC' - 34 caracteres",
            "auth_token": "Click 'View' para mostrarlo - 32 caracteres"
        }
    },
    
    "super_sim_access": {
        "option_1": "Console → Develop → IoT → Programmable Connectivity",
        "option_2": "Console → Develop → Connectivity → Super SIM", 
        "option_3": "Console → Products → IoT → Super SIM",
        "search_terms": ["Super SIM", "IoT", "Connectivity", "Programmable"]
    },
    
    "fleet_management": {
        "current_names": ["Fleets", "Networks", "SIM Groups"],
        "location": "Super SIM → Fleets (o Networks)",
        "create_button": ["Create Fleet", "Create Network", "New Fleet"]
    },
    
    "rate_plans": {
        "current_names": ["Rate Plans", "Pricing Plans", "Data Plans", "Usage Plans"],
        "location": "Super SIM → Rate Plans",
        "create_button": ["Create Rate Plan", "Create Plan", "New Rate Plan"]
    },
    
    "sim_management": {
        "current_names": ["SIMs", "Devices", "Connectivity"],
        "location": "Super SIM → SIMs",
        "actions": ["Order SIMs", "Create SIM", "Import SIMs"]
    }
}

# =============================================================================
# CONFIGURACIÓN DETALLADA PARA CADA SECCIÓN
# =============================================================================

FLEET_CONFIGURATION = {
    "required_fields": {
        "unique_name": "hablaris-testing",
        "friendly_name": "Hablaris Testing Fleet",
        "commands_enabled": False,
        "sms_commands_enabled": False
    },
    "optional_fields": {
        "commands_url": "",  # Dejar vacío por ahora
        "commands_method": "POST"
    }
}

RATE_PLAN_CONFIGURATION = {
    "basic_plan": {
        "unique_name": "hablaris-basic-1gb",
        "friendly_name": "Hablaris Basic 1GB",
        "data_enabled": True,
        "data_limit": 1073741824,  # 1GB en bytes
        "data_metering": "payg",   # pay-as-you-go
        "messaging_enabled": False,
        "voice_enabled": False,
        "national_roaming_enabled": True,
        "international_roaming": ["US", "GB", "DE", "ES", "FR"]
    },
    "premium_plan": {
        "unique_name": "hablaris-premium-5gb",
        "friendly_name": "Hablaris Premium 5GB",
        "data_enabled": True,
        "data_limit": 5368709120,  # 5GB en bytes
        "data_metering": "payg",
        "messaging_enabled": True,
        "voice_enabled": False,
        "national_roaming_enabled": True,
        "international_roaming": ["US", "GB", "DE", "ES", "FR", "IT", "PT", "NL"]
    }
}

# =============================================================================
# TÉRMINOS DE BÚSQUEDA SI NO ENCUENTRAS LAS SECCIONES
# =============================================================================

SEARCH_TERMS = {
    "if_cant_find_supersim": [
        "IoT",
        "Connectivity", 
        "Programmable Connectivity",
        "Super SIM",
        "SIM Management",
        "Mobile"
    ],
    
    "if_cant_find_fleets": [
        "Fleet",
        "Network",
        "SIM Group",
        "Device Group",
        "SIM Management"
    ],
    
    "if_cant_find_rate_plans": [
        "Rate Plan",
        "Pricing Plan", 
        "Data Plan",
        "Usage Plan",
        "Billing Plan"
    ]
}

# =============================================================================
# TROUBLESHOOTING COMÚN
# =============================================================================

COMMON_ISSUES = {
    "account_not_enabled": {
        "problem": "No aparece Super SIM en el menú",
        "solution": "Ir a Console → Billing → Add-ons → Habilitar Super SIM"
    },
    
    "no_credit": {
        "problem": "No puedo crear SIMs de prueba",
        "solution": "Añadir al menos $10 USD a la cuenta en Billing"
    },
    
    "regions_limited": {
        "problem": "No aparecen todos los países",
        "solution": "Algunos países requieren activación manual - contactar soporte"
    },
    
    "api_keys_missing": {
        "problem": "No encuentro las API keys",
        "solution": "Account SID y Auth Token están en Dashboard → Account Info"
    }
}
