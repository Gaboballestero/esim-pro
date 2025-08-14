#!/usr/bin/env python
"""
Script para poblar la base de datos con datos de prueba
"""
import os
import sys
import django
from decimal import Decimal

# Configurar Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'esim_backend.settings')
django.setup()

from geolocation.models import Country, NetworkOperator
from rewards.models import Reward, ReferralCode, LoyaltyPoints
from flexible_plans.models import PlanCategory, FlexiblePlan
from django.contrib.auth.models import User


def create_countries():
    """Crear países populares con soporte eSIM"""
    countries_data = [
        # Europa
        {'name': 'España', 'code': 'ES', 'code_3': 'ESP', 'continent': 'Europa', 'region': 'Europa Occidental', 
         'currency': 'EUR', 'language': 'es', 'timezone': 'Europe/Madrid', 'calling_code': '+34',
         'latitude': 40.4637, 'longitude': -3.7492, 'flag_emoji': '🇪🇸', 'is_popular': True},
        
        {'name': 'Francia', 'code': 'FR', 'code_3': 'FRA', 'continent': 'Europa', 'region': 'Europa Occidental',
         'currency': 'EUR', 'language': 'fr', 'timezone': 'Europe/Paris', 'calling_code': '+33',
         'latitude': 46.2276, 'longitude': 2.2137, 'flag_emoji': '🇫🇷', 'is_popular': True},
        
        {'name': 'Italia', 'code': 'IT', 'code_3': 'ITA', 'continent': 'Europa', 'region': 'Europa Meridional',
         'currency': 'EUR', 'language': 'it', 'timezone': 'Europe/Rome', 'calling_code': '+39',
         'latitude': 41.8719, 'longitude': 12.5674, 'flag_emoji': '🇮🇹', 'is_popular': True},
        
        {'name': 'Reino Unido', 'code': 'GB', 'code_3': 'GBR', 'continent': 'Europa', 'region': 'Europa Septentrional',
         'currency': 'GBP', 'language': 'en', 'timezone': 'Europe/London', 'calling_code': '+44',
         'latitude': 55.3781, 'longitude': -3.4360, 'flag_emoji': '🇬🇧', 'is_popular': True},
        
        # América
        {'name': 'Estados Unidos', 'code': 'US', 'code_3': 'USA', 'continent': 'América', 'region': 'América del Norte',
         'currency': 'USD', 'language': 'en', 'timezone': 'America/New_York', 'calling_code': '+1',
         'latitude': 37.0902, 'longitude': -95.7129, 'flag_emoji': '🇺🇸', 'is_popular': True},
        
        {'name': 'Canadá', 'code': 'CA', 'code_3': 'CAN', 'continent': 'América', 'region': 'América del Norte',
         'currency': 'CAD', 'language': 'en', 'timezone': 'America/Toronto', 'calling_code': '+1',
         'latitude': 56.1304, 'longitude': -106.3468, 'flag_emoji': '🇨🇦', 'is_popular': True},
        
        {'name': 'México', 'code': 'MX', 'code_3': 'MEX', 'continent': 'América', 'region': 'América del Norte',
         'currency': 'MXN', 'language': 'es', 'timezone': 'America/Mexico_City', 'calling_code': '+52',
         'latitude': 23.6345, 'longitude': -102.5528, 'flag_emoji': '🇲🇽', 'is_popular': True},
        
        # Asia
        {'name': 'Japón', 'code': 'JP', 'code_3': 'JPN', 'continent': 'Asia', 'region': 'Asia Oriental',
         'currency': 'JPY', 'language': 'ja', 'timezone': 'Asia/Tokyo', 'calling_code': '+81',
         'latitude': 36.2048, 'longitude': 138.2529, 'flag_emoji': '🇯🇵', 'is_popular': True},
        
        {'name': 'Corea del Sur', 'code': 'KR', 'code_3': 'KOR', 'continent': 'Asia', 'region': 'Asia Oriental',
         'currency': 'KRW', 'language': 'ko', 'timezone': 'Asia/Seoul', 'calling_code': '+82',
         'latitude': 35.9078, 'longitude': 127.7669, 'flag_emoji': '🇰🇷', 'is_popular': True},
        
        {'name': 'Singapur', 'code': 'SG', 'code_3': 'SGP', 'continent': 'Asia', 'region': 'Asia Sudoriental',
         'currency': 'SGD', 'language': 'en', 'timezone': 'Asia/Singapore', 'calling_code': '+65',
         'latitude': 1.3521, 'longitude': 103.8198, 'flag_emoji': '🇸🇬', 'is_popular': True},
    ]
    
    created_countries = []
    for data in countries_data:
        country, created = Country.objects.get_or_create(
            code=data['code'],
            defaults={**data, 'esim_supported': True, 'coverage_quality': 'excellent'}
        )
        if created:
            print(f"✅ País creado: {country.flag_emoji} {country.name}")
        created_countries.append(country)
    
    return created_countries


def create_plan_categories():
    """Crear categorías de planes"""
    categories_data = [
        {'name': 'Viaje Corto', 'description': 'Planes ideales para viajes de 1-7 días', 
         'icon': 'airplane', 'color': '#3B82F6', 'display_order': 1},
        
        {'name': 'Estadía Larga', 'description': 'Planes para viajes largos o residencia temporal',
         'icon': 'home', 'color': '#10B981', 'display_order': 2},
         
        {'name': 'Planes por Horas', 'description': 'Conectividad para conexiones y escalas',
         'icon': 'clock', 'color': '#F59E0B', 'display_order': 3},
         
        {'name': 'Planes Familiares', 'description': 'Planes compartidos para múltiples dispositivos',
         'icon': 'people', 'color': '#8B5CF6', 'display_order': 4},
         
        {'name': 'Datos Ilimitados', 'description': 'Planes sin límite de datos',
         'icon': 'infinite', 'color': '#EF4444', 'display_order': 5},
    ]
    
    created_categories = []
    for data in categories_data:
        category, created = PlanCategory.objects.get_or_create(
            name=data['name'],
            defaults=data
        )
        if created:
            print(f"✅ Categoría creada: {category.name}")
        created_categories.append(category)
    
    return created_categories


def create_flexible_plans(categories, countries):
    """Crear planes flexibles"""
    plans_data = [
        # Planes por horas
        {
            'name': '3 Horas Express',
            'description': 'Perfecto para conexiones de vuelo y necesidades urgentes',
            'category': categories[2],  # Planes por Horas
            'data_amount_gb': Decimal('1.0'),
            'duration_value': 3,
            'duration_unit': 'hours',
            'plan_type': 'hourly',
            'base_price': Decimal('2.99'),
            'features': ['4G', '5G', 'Hotspot'],
            'is_featured': True,
        },
        {
            'name': '12 Horas Viajero',
            'description': 'Ideal para días completos de turismo',
            'category': categories[2],
            'data_amount_gb': Decimal('3.0'),
            'duration_value': 12,
            'duration_unit': 'hours',
            'plan_type': 'hourly',
            'base_price': Decimal('7.99'),
            'features': ['4G', '5G', 'Hotspot', 'VoIP'],
        },
        
        # Viaje corto
        {
            'name': 'Weekend Getaway',
            'description': 'Para escapadas de fin de semana',
            'category': categories[0],  # Viaje Corto
            'data_amount_gb': Decimal('5.0'),
            'duration_value': 3,
            'duration_unit': 'days',
            'plan_type': 'daily',
            'base_price': Decimal('12.99'),
            'features': ['4G', '5G', 'Hotspot', 'VoIP'],
            'is_popular': True,
        },
        {
            'name': 'Semana Perfecta',
            'description': 'Una semana completa de conectividad',
            'category': categories[0],
            'data_amount_gb': Decimal('10.0'),
            'duration_value': 7,
            'duration_unit': 'days',
            'plan_type': 'weekly',
            'base_price': Decimal('24.99'),
            'features': ['4G', '5G', 'Hotspot', 'VoIP'],
            'is_topup_available': True,
            'topup_increment_gb': Decimal('2.0'),
            'topup_price_per_gb': Decimal('3.99'),
            'is_featured': True,
        },
        
        # Estadía larga
        {
            'name': 'Mes Completo',
            'description': 'Para estancias largas y nómadas digitales',
            'category': categories[1],  # Estadía Larga
            'data_amount_gb': Decimal('50.0'),
            'duration_value': 30,
            'duration_unit': 'days',
            'plan_type': 'monthly',
            'base_price': Decimal('79.99'),
            'features': ['4G', '5G', 'Hotspot', 'VoIP', 'Premium Support'],
            'is_topup_available': True,
            'topup_increment_gb': Decimal('5.0'),
            'topup_price_per_gb': Decimal('2.99'),
        },
        
        # Planes familiares
        {
            'name': 'Familia Viajera',
            'description': 'Hasta 5 dispositivos con datos compartidos',
            'category': categories[3],  # Planes Familiares
            'data_amount_gb': Decimal('25.0'),
            'duration_value': 14,
            'duration_unit': 'days',
            'plan_type': 'family',
            'base_price': Decimal('49.99'),
            'max_devices': 5,
            'max_family_members': 5,
            'family_discount_percentage': Decimal('20.0'),
            'features': ['4G', '5G', 'Hotspot', 'VoIP', 'Family Dashboard'],
            'is_featured': True,
        },
        
        # Datos ilimitados
        {
            'name': 'Ilimitado Pro',
            'description': 'Datos verdaderamente ilimitados para usuarios intensivos',
            'category': categories[4],  # Datos Ilimitados
            'is_unlimited': True,
            'duration_value': 7,
            'duration_unit': 'days',
            'plan_type': 'weekly',
            'base_price': Decimal('39.99'),
            'features': ['4G', '5G', 'Hotspot', 'VoIP', 'Priority Network', 'No Throttling'],
            'is_popular': True,
        },
    ]
    
    created_plans = []
    for data in plans_data:
        plan, created = FlexiblePlan.objects.get_or_create(
            name=data['name'],
            defaults=data
        )
        if created:
            print(f"✅ Plan creado: {plan.name} - ${plan.base_price}")
            # Agregar países al plan
            plan.countries.set(countries[:5])  # Primeros 5 países
        created_plans.append(plan)
    
    return created_plans


def create_rewards():
    """Crear recompensas disponibles"""
    rewards_data = [
        {
            'name': '$5 de Descuento',
            'description': 'Descuento de $5 en tu próxima compra',
            'points_required': 500,
            'discount_amount': Decimal('5.00'),
            'reward_type': 'discount',
        },
        {
            'name': '10% de Descuento',
            'description': 'Descuento del 10% en cualquier plan',
            'points_required': 750,
            'discount_percentage': Decimal('10.00'),
            'reward_type': 'discount',
        },
        {
            'name': '1GB Gratis',
            'description': '1GB adicional gratis en tu próximo plan',
            'points_required': 300,
            'reward_type': 'free_data',
        },
        {
            'name': 'Upgrade a Premium',
            'description': 'Upgrade gratuito a plan premium por una semana',
            'points_required': 1000,
            'reward_type': 'upgrade',
        },
        {
            'name': '$20 de Crédito',
            'description': 'Crédito de $20 para usar en cualquier momento',
            'points_required': 2000,
            'discount_amount': Decimal('20.00'),
            'reward_type': 'credit',
        },
    ]
    
    for data in rewards_data:
        reward, created = Reward.objects.get_or_create(
            name=data['name'],
            defaults=data
        )
        if created:
            print(f"✅ Recompensa creada: {reward.name} - {reward.points_required} puntos")


def create_test_user():
    """Crear usuario de prueba"""
    user, created = User.objects.get_or_create(
        username='testuser',
        defaults={
            'email': 'test@esimpro.com',
            'first_name': 'Usuario',
            'last_name': 'Prueba',
        }
    )
    if created:
        user.set_password('test123456')
        user.save()
        print(f"✅ Usuario de prueba creado: {user.username}")
        
        # Crear código de referido y puntos
        referral_code, _ = ReferralCode.objects.get_or_create(user=user)
        loyalty_points, _ = LoyaltyPoints.objects.get_or_create(
            user=user,
            defaults={
                'total_points': 1500,
                'available_points': 1200,
                'lifetime_points': 1500,
                'tier': 'silver'
            }
        )
        print(f"✅ Código de referido: {referral_code.code}")
        print(f"✅ Puntos de fidelidad: {loyalty_points.available_points} puntos ({loyalty_points.tier})")
    
    return user


def main():
    """Función principal"""
    print("🚀 Iniciando población de base de datos...")
    
    # Crear datos básicos
    print("\n📍 Creando países...")
    countries = create_countries()
    
    print("\n📂 Creando categorías de planes...")
    categories = create_plan_categories()
    
    print("\n📋 Creando planes flexibles...")
    plans = create_flexible_plans(categories, countries)
    
    print("\n🎁 Creando recompensas...")
    create_rewards()
    
    print("\n👤 Creando usuario de prueba...")
    user = create_test_user()
    
    print("\n✅ ¡Base de datos poblada exitosamente!")
    print(f"📊 Resumen:")
    print(f"   - {len(countries)} países creados")
    print(f"   - {len(categories)} categorías de planes")
    print(f"   - {len(plans)} planes flexibles")
    print(f"   - Usuario de prueba: {user.username}")
    print(f"\n🌐 Puedes acceder al admin en: http://localhost:8000/admin/")
    print(f"📱 APIs disponibles en: http://localhost:8000/api/")


if __name__ == '__main__':
    main()
