"""
Sistema de pricing estratégico para Hablaris
Optimiza márgenes manteniendo competitividad
"""
from typing import Dict

class HablarisPricingEngine:
    """Motor de precios inteligente para Hablaris"""
    
    def __init__(self):
        # Márgenes objetivo por tipo de plan
        self.target_margins = {
            'budget': 0.35,      # 35% - Planes económicos
            'standard': 0.45,    # 45% - Planes estándar  
            'premium': 0.55,     # 55% - Planes premium
            'unlimited': 0.60    # 60% - Planes ilimitados
        }
        
        # Precios de referencia competitiva
        self.competitor_prices = {
            'airalo': 1.0,       # Precio base de referencia
            'holafly': 1.15,     # +15% vs Airalo
            'nomad': 1.05,       # +5% vs Airalo
            'keepgo': 0.95       # -5% vs Airalo
        }
        
        # Factores de ajuste por región
        self.region_factors = {
            'europe': 1.0,       # Base
            'north_america': 1.1, # +10%
            'asia_pacific': 0.9,  # -10%
            'latin_america': 0.85, # -15%
            'africa_middle_east': 1.2, # +20%
            'global': 1.15       # +15%
        }
    
    def calculate_optimal_price(self, 
                              wholesale_cost: float,
                              plan_category: str,
                              region: str,
                              data_amount_gb: int,
                              validity_days: int) -> Dict:
        """Calcular precio óptimo para un plan"""
        
        # 1. Precio base con margen objetivo
        target_margin = self.target_margins.get(plan_category, 0.45)
        base_price = wholesale_cost / (1 - target_margin)
        
        # 2. Ajuste por región
        region_factor = self.region_factors.get(region, 1.0)
        regional_price = base_price * region_factor
        
        # 3. Ajuste por valor percibido (€/GB/día)
        value_per_gb_day = regional_price / (data_amount_gb * validity_days)
        
        # Si el valor por GB/día es muy alto, ajustar
        if value_per_gb_day > 0.50:  # Máximo €0.50 por GB/día
            regional_price = 0.50 * data_amount_gb * validity_days
        
        # 4. Redondeo a precios psicológicos
        final_price = self.round_to_psychological_price(regional_price)
        
        # 5. Verificar competitividad
        competitiveness = self.check_competitiveness(
            final_price, data_amount_gb, validity_days, region
        )
        
        return {
            'wholesale_cost': wholesale_cost,
            'recommended_price': final_price,
            'margin_euro': final_price - wholesale_cost,
            'margin_percent': ((final_price - wholesale_cost) / final_price) * 100,
            'value_per_gb': final_price / data_amount_gb,
            'value_per_day': final_price / validity_days,
            'competitiveness': competitiveness,
            'pricing_breakdown': {
                'base_price': base_price,
                'regional_adjustment': regional_price,
                'psychological_rounding': final_price
            }
        }
    
    def round_to_psychological_price(self, price: float) -> float:
        """Redondear a precios psicológicos"""
        if price < 10:
            # Para precios < €10, redondear a .49 o .99
            if price < 5:
                return round(price - 0.01, 2)  # €4.99, €3.99, etc.
            else:
                return round(price - 0.51, 2) + 0.50  # €7.50, €8.50, etc.
        elif price < 50:
            # Para precios €10-50, redondear a .95 o .00
            return round(price - 0.05, 2) + 0.00 if price % 5 < 2.5 else round(price - 0.05, 2)
        else:
            # Para precios >€50, redondear a múltiplos de 5
            return round(price / 5) * 5
    
    def check_competitiveness(self, price: float, data_gb: int, 
                            validity_days: int, region: str) -> Dict:
        """Verificar competitividad vs mercado"""
        
        # Estimar precio de Airalo para comparación
        estimated_airalo_price = self.estimate_airalo_price(data_gb, validity_days, region)
        
        price_difference = price - estimated_airalo_price
        percentage_difference = (price_difference / estimated_airalo_price) * 100
        
        if percentage_difference <= -5:
            level = 'very_competitive'
            message = f'Excelente: {percentage_difference:.1f}% más barato que Airalo'
        elif percentage_difference <= 5:
            level = 'competitive' 
            message = f'Competitivo: Solo {percentage_difference:.1f}% vs Airalo'
        elif percentage_difference <= 15:
            level = 'acceptable'
            message = f'Aceptable: {percentage_difference:.1f}% más caro que Airalo'
        else:
            level = 'expensive'
            message = f'Caro: {percentage_difference:.1f}% más caro que Airalo'
            
        return {
            'level': level,
            'message': message,
            'vs_airalo': {
                'our_price': price,
                'airalo_estimated': estimated_airalo_price,
                'difference_euro': price_difference,
                'difference_percent': percentage_difference
            }
        }
    
    def estimate_airalo_price(self, data_gb: int, validity_days: int, region: str) -> float:
        """Estimar precio de Airalo para comparación"""
        
        # Fórmulas basadas en análisis de precios reales de Airalo
        base_formulas = {
            'europe': {
                '1gb_7d': 4.50,   '3gb_15d': 11.00,  '5gb_30d': 16.00,
                '10gb_30d': 26.00, '20gb_30d': 42.00
            },
            'north_america': {
                '1gb_7d': 5.00,   '3gb_15d': 13.00,  '5gb_30d': 20.00,
                '10gb_30d': 35.00, '20gb_30d': 55.00
            },
            'asia_pacific': {
                '1gb_7d': 4.00,   '3gb_15d': 10.00,  '5gb_30d': 15.00,
                '10gb_30d': 28.00, '20gb_30d': 45.00
            }
        }
        
        region_prices = base_formulas.get(region, base_formulas['europe'])
        
        # Interpolación simple basada en GB y días
        price_per_gb = 2.50 if region == 'europe' else 3.00
        price_per_day = 0.50
        
        estimated = (data_gb * price_per_gb) + (validity_days * price_per_day)
        
        # Ajustar con factores de descuento por volumen
        if data_gb >= 20:
            estimated *= 0.85  # 15% descuento
        elif data_gb >= 10:
            estimated *= 0.90  # 10% descuento
            
        return max(estimated, 3.00)  # Precio mínimo €3

# Ejemplos de uso del motor de precios
def generate_pricing_examples():
    """Generar ejemplos de pricing para diferentes escenarios"""
    
    engine = HablarisPricingEngine()
    
    examples = [
        {
            'plan': 'Europa Budget 3GB - 15 días',
            'wholesale_cost': 6.50,
            'category': 'budget',
            'region': 'europe',
            'data_gb': 3,
            'validity_days': 15
        },
        {
            'plan': 'Europa Standard 5GB - 30 días', 
            'wholesale_cost': 8.50,
            'category': 'standard',
            'region': 'europe',
            'data_gb': 5,
            'validity_days': 30
        },
        {
            'plan': 'USA Premium 10GB - 30 días',
            'wholesale_cost': 15.00,
            'category': 'premium', 
            'region': 'north_america',
            'data_gb': 10,
            'validity_days': 30
        }
    ]
    
    for example in examples:
        result = engine.calculate_optimal_price(
            example['wholesale_cost'],
            example['category'],
            example['region'], 
            example['data_gb'],
            example['validity_days']
        )
        
        print(f"\n🎯 {example['plan']}:")
        print(f"   Costo: €{result['wholesale_cost']:.2f}")
        print(f"   Precio: €{result['recommended_price']:.2f}")
        print(f"   Margen: €{result['margin_euro']:.2f} ({result['margin_percent']:.1f}%)")
        print(f"   Competitividad: {result['competitiveness']['message']}")

if __name__ == "__main__":
    generate_pricing_examples()
