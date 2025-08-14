"""
Análisis de Rentabilidad - Proveedores eSIM para Hablaris
Comparativa real de márgenes y competitividad
"""

# =============================================================================
# ANÁLISIS DE RENTABILIDAD POR PROVEEDOR
# =============================================================================

RENTABILITY_ANALYSIS = {
    'airalo_b2b': {
        'name': 'Airalo B2B',
        'conflict_level': 'ALTO',
        'margin_potential': '20-35%',
        'competition_risk': 'CRÍTICO',
        'pros': [
            'API bien documentada',
            'Fácil integración',
            'Buena cobertura'
        ],
        'cons': [
            'Compite directo con nosotros',
            'Clientes pueden comparar precios',
            'Márgenes muy limitados',
            'Imposible diferenciarse'
        ],
        'example_pricing': {
            'plan': 'Europa 5GB - 7 días',
            'airalo_b2c_price': 15.00,  # Precio que ve el cliente en Airalo
            'our_cost_b2b': 12.50,      # Lo que nos cobra Airalo B2B
            'our_selling_price': 18.00, # Lo que debemos cobrar
            'margin_euro': 5.50,
            'margin_percent': 30.5,
            'problem': 'Cliente puede comprar en Airalo por €15 vs €18 nuestro'
        },
        'recommendation': 'EVITAR - Conflicto directo'
    },
    
    'oneglobal': {
        'name': '1GLOBAL',
        'conflict_level': 'NINGUNO',
        'margin_potential': '50-70%',
        'competition_risk': 'BAJO',
        'pros': [
            'B2B puro - no vende al consumidor',
            'Márgenes altos',
            'Marca blanca completa',
            'API moderna y robusta',
            'Cobertura premium'
        ],
        'cons': [
            'Setup fee inicial',
            'Depósito mínimo',
            'Proceso onboarding más lento'
        ],
        'example_pricing': {
            'plan': 'Europa 5GB - 7 días',
            'market_reference': 15.00,    # Precio de mercado (Airalo)
            'our_cost_b2b': 8.50,         # Lo que nos cobra 1GLOBAL
            'our_selling_price': 16.00,   # Precio competitivo
            'margin_euro': 7.50,
            'margin_percent': 46.9,
            'advantage': 'Precio competitivo + margen alto'
        },
        'recommendation': 'ALTAMENTE RECOMENDADO'
    },
    
    'twilio_supersim': {
        'name': 'Twilio Super SIM',
        'conflict_level': 'NINGUNO',
        'margin_potential': '45-65%',
        'competition_risk': 'NINGUNO',
        'pros': [
            'Enfoque enterprise puro',
            'Sin competencia B2C',
            'APIs superiores',
            'Infraestructura propia',
            'Escalabilidad ilimitada'
        ],
        'cons': [
            'Más complejo de integrar',
            'Requiere conocimiento técnico',
            'Cobertura menor en algunos países'
        ],
        'example_pricing': {
            'plan': 'Europa 5GB - 7 días',
            'market_reference': 15.00,
            'our_cost_b2b': 9.00,
            'our_selling_price': 16.50,
            'margin_euro': 7.50,
            'margin_percent': 45.5,
            'advantage': 'Control total + buena rentabilidad'
        },
        'recommendation': 'RECOMENDADO - Para largo plazo'
    },
    
    'bics_truphone': {
        'name': 'BICS/Truphone',
        'conflict_level': 'BAJO',
        'margin_potential': '40-55%',
        'competition_risk': 'BAJO',
        'pros': [
            'Wholesaler establecido',
            'Buenos márgenes',
            'Cobertura global sólida',
            'Sin competencia directa'
        ],
        'cons': [
            'Proceso más burocrático',
            'Volúmenes mínimos altos',
            'API menos moderna'
        ],
        'example_pricing': {
            'plan': 'Europa 5GB - 7 días',
            'market_reference': 15.00,
            'our_cost_b2b': 9.50,
            'our_selling_price': 16.00,
            'margin_euro': 6.50,
            'margin_percent': 40.6,
            'advantage': 'Estabilidad + buenos márgenes'
        },
        'recommendation': 'OPCIÓN SÓLIDA'
    }
}

# =============================================================================
# ESTRATEGIA RECOMENDADA PARA HABLARIS
# =============================================================================

RECOMMENDED_STRATEGY = {
    'phase_1_mvp': {
        'primary_provider': '1GLOBAL',
        'rationale': [
            'Sin conflicto de competencia',
            'Márgenes altos desde el inicio',
            'API moderna fácil de integrar',
            'Marca blanca completa'
        ],
        'timeline': '0-6 meses',
        'investment': '$2000-5000 inicial'
    },
    
    'phase_2_growth': {
        'primary_provider': '1GLOBAL',
        'secondary_provider': 'Twilio Super SIM',
        'rationale': [
            'Diversificación de riesgo',
            'Mejores precios por volumen',
            'Redundancia operacional',
            'Optimización por destino'
        ],
        'timeline': '6-18 meses',
        'investment': '$10000-20000'
    },
    
    'phase_3_scale': {
        'multi_provider': ['1GLOBAL', 'Twilio', 'BICS'],
        'rationale': [
            'Negociación de mejores términos',
            'Optimización por país/operador',
            'Máxima redundancia',
            'Flexibilidad comercial'
        ],
        'timeline': '18+ meses',
        'investment': '$50000+'
    }
}

# =============================================================================
# COMPARATIVA DE COMPETITIVIDAD
# =============================================================================

COMPETITIVE_ANALYSIS = {
    'market_leaders_b2c': {
        'airalo': {'avg_price': 15.00, 'coverage': '200+ países'},
        'holafly': {'avg_price': 19.00, 'coverage': '160+ países'}, 
        'nomad': {'avg_price': 16.00, 'coverage': '120+ países'},
        'esimdb': {'avg_price': 14.00, 'coverage': '100+ países'}
    },
    
    'hablaris_positioning': {
        'with_1global': {
            'avg_price': 16.50,  # Competitivo
            'margin': '47%',     # Excelente
            'positioning': 'Premium con precio competitivo'
        },
        'with_airalo_b2b': {
            'avg_price': 18.50,  # Caro vs competencia
            'margin': '32%',     # Regular
            'positioning': 'Difícil de justificar precio'
        }
    }
}
