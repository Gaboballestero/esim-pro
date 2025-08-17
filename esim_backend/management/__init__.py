"""
Comando Django para crear datos de prueba para la tienda eSIM
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from esim_backend.models import Country, DataPlan
from decimal import Decimal

User = get_user_model()

class Command(BaseCommand):
    help = 'Crear datos de prueba para la tienda eSIM'

    def add_arguments(self, parser):
        parser.add_argument(
            '--reset',
            action='store_true',
            help='Eliminar datos existentes antes de crear nuevos',
        )

    def handle(self, *args, **options):
        if options['reset']:
            self.stdout.write('Eliminando datos existentes...')
            Country.objects.all().delete()
            DataPlan.objects.all().delete()

        self.stdout.write('Creando países...')
        self.create_countries()
        
        self.stdout.write('Creando planes eSIM...')
        self.create_data_plans()
        
        self.stdout.write('Creando usuario admin de prueba...')
        self.create_admin_user()
        
        self.stdout.write(
            self.style.SUCCESS('✅ Datos de prueba creados exitosamente!')
        )

    def create_countries(self):
        """Crear países populares"""
        countries_data = [
            # Europa
            {'code': 'ES', 'name': 'España', 'flag_emoji': '🇪🇸', 'region': 'europe', 'is_popular': True},
            {'code': 'FR', 'name': 'Francia', 'flag_emoji': '🇫🇷', 'region': 'europe', 'is_popular': True},
            {'code': 'IT', 'name': 'Italia', 'flag_emoji': '🇮🇹', 'region': 'europe', 'is_popular': True},
            {'code': 'DE', 'name': 'Alemania', 'flag_emoji': '🇩🇪', 'region': 'europe', 'is_popular': True},
            {'code': 'GB', 'name': 'Reino Unido', 'flag_emoji': '🇬🇧', 'region': 'europe', 'is_popular': True},
            {'code': 'NL', 'name': 'Países Bajos', 'flag_emoji': '🇳🇱', 'region': 'europe'},
            {'code': 'CH', 'name': 'Suiza', 'flag_emoji': '🇨🇭', 'region': 'europe'},
            {'code': 'AT', 'name': 'Austria', 'flag_emoji': '🇦🇹', 'region': 'europe'},
            
            # América del Norte
            {'code': 'US', 'name': 'Estados Unidos', 'flag_emoji': '🇺🇸', 'region': 'north_america', 'is_popular': True},
            {'code': 'CA', 'name': 'Canadá', 'flag_emoji': '🇨🇦', 'region': 'north_america', 'is_popular': True},
            {'code': 'MX', 'name': 'México', 'flag_emoji': '🇲🇽', 'region': 'north_america', 'is_popular': True},
            
            # Asia
            {'code': 'JP', 'name': 'Japón', 'flag_emoji': '🇯🇵', 'region': 'asia', 'is_popular': True},
            {'code': 'KR', 'name': 'Corea del Sur', 'flag_emoji': '🇰🇷', 'region': 'asia', 'is_popular': True},
            {'code': 'TH', 'name': 'Tailandia', 'flag_emoji': '🇹🇭', 'region': 'asia', 'is_popular': True},
            {'code': 'SG', 'name': 'Singapur', 'flag_emoji': '🇸🇬', 'region': 'asia'},
            {'code': 'HK', 'name': 'Hong Kong', 'flag_emoji': '🇭🇰', 'region': 'asia'},
            
            # Oceanía
            {'code': 'AU', 'name': 'Australia', 'flag_emoji': '🇦🇺', 'region': 'oceania', 'is_popular': True},
            {'code': 'NZ', 'name': 'Nueva Zelanda', 'flag_emoji': '🇳🇿', 'region': 'oceania'},
        ]
        
        countries = []
        for data in countries_data:
            country, created = Country.objects.get_or_create(
                code=data['code'],
                defaults=data
            )
            countries.append(country)
            if created:
                self.stdout.write(f'  ✅ {country}')
        
        return countries

    def create_data_plans(self):
        """Crear planes eSIM variados"""
        
        # Obtener países
        spain = Country.objects.get(code='ES')
        france = Country.objects.get(code='FR')
        italy = Country.objects.get(code='IT')
        germany = Country.objects.get(code='DE')
        uk = Country.objects.get(code='GB')
        usa = Country.objects.get(code='US')
        canada = Country.objects.get(code='CA')
        japan = Country.objects.get(code='JP')
        thailand = Country.objects.get(code='TH')
        australia = Country.objects.get(code='AU')
        
        europe_countries = Country.objects.filter(region='europe')
        
        plans_data = [
            # Planes individuales populares
            {
                'name': 'España 5GB - 15 días',
                'slug': 'spain-5gb-15d',
                'plan_type': 'country',
                'countries': [spain],
                'data_amount_gb': 5,
                'validity_days': 15,
                'price_usd': Decimal('12.99'),
                'original_price_usd': Decimal('17.99'),
                'supports_5g': True,
                'supports_hotspot': True,
                'is_popular': True,
                'badge_text': 'MÁS POPULAR',
                'network_operators': 'Orange, Vodafone, Movistar'
            },
            {
                'name': 'Estados Unidos 10GB - 30 días',
                'slug': 'usa-10gb-30d',
                'plan_type': 'country',
                'countries': [usa],
                'data_amount_gb': 10,
                'validity_days': 30,
                'price_usd': Decimal('24.99'),
                'original_price_usd': Decimal('34.99'),
                'supports_5g': True,
                'supports_hotspot': True,
                'includes_calls': True,
                'is_popular': True,
                'badge_text': 'INCLUYE LLAMADAS',
                'network_operators': 'Verizon, AT&T, T-Mobile'
            },
            {
                'name': 'Japón 8GB - 21 días',
                'slug': 'japan-8gb-21d',
                'plan_type': 'country',
                'countries': [japan],
                'data_amount_gb': 8,
                'validity_days': 21,
                'price_usd': Decimal('19.99'),
                'supports_5g': True,
                'supports_hotspot': True,
                'is_featured': True,
                'network_operators': 'NTT Docomo, SoftBank, au'
            },
            {
                'name': 'Tailandia 6GB - 20 días',
                'slug': 'thailand-6gb-20d',
                'plan_type': 'country',
                'countries': [thailand],
                'data_amount_gb': 6,
                'validity_days': 20,
                'price_usd': Decimal('14.99'),
                'supports_5g': True,
                'supports_hotspot': True,
                'is_popular': True,
                'network_operators': 'AIS, dtac, TrueMove'
            },
            
            # Planes regionales
            {
                'name': 'Europa 20GB - 30 días',
                'slug': 'europe-20gb-30d',
                'plan_type': 'regional',
                'countries': list(europe_countries),
                'data_amount_gb': 20,
                'validity_days': 30,
                'price_usd': Decimal('39.99'),
                'original_price_usd': Decimal('59.99'),
                'supports_5g': True,
                'supports_hotspot': True,
                'is_featured': True,
                'badge_text': 'MEJOR VALOR',
                'network_operators': 'Principales operadores europeos'
            },
            {
                'name': 'Europa 50GB - 60 días',
                'slug': 'europe-50gb-60d',
                'plan_type': 'regional',
                'countries': list(europe_countries),
                'data_amount_gb': 50,
                'validity_days': 60,
                'price_usd': Decimal('79.99'),
                'original_price_usd': Decimal('119.99'),
                'supports_5g': True,
                'supports_hotspot': True,
                'includes_calls': True,
                'includes_sms': True,
                'is_featured': True,
                'badge_text': 'PLAN COMPLETO',
                'network_operators': 'Principales operadores europeos'
            },
            
            # Planes globales
            {
                'name': 'Global 15GB - 30 días',
                'slug': 'global-15gb-30d',
                'plan_type': 'global',
                'countries': list(Country.objects.all()),
                'data_amount_gb': 15,
                'validity_days': 30,
                'price_usd': Decimal('49.99'),
                'original_price_usd': Decimal('69.99'),
                'supports_5g': True,
                'supports_hotspot': True,
                'is_featured': True,
                'badge_text': 'COBERTURA MUNDIAL',
                'network_operators': 'Operadores globales premium'
            },
            
            # Planes económicos
            {
                'name': 'Francia 3GB - 7 días',
                'slug': 'france-3gb-7d',
                'plan_type': 'country',
                'countries': [france],
                'data_amount_gb': 3,
                'validity_days': 7,
                'price_usd': Decimal('8.99'),
                'supports_5g': True,
                'supports_hotspot': True,
                'network_operators': 'Orange, SFR, Bouygues'
            },
            {
                'name': 'Italia 4GB - 10 días',
                'slug': 'italy-4gb-10d',
                'plan_type': 'country',
                'countries': [italy],
                'data_amount_gb': 4,
                'validity_days': 10,
                'price_usd': Decimal('11.99'),
                'supports_5g': True,
                'supports_hotspot': True,
                'network_operators': 'TIM, Vodafone, WindTre'
            },
        ]
        
        for plan_data in plans_data:
            countries = plan_data.pop('countries')
            plan, created = DataPlan.objects.get_or_create(
                slug=plan_data['slug'],
                defaults=plan_data
            )
            if created:
                plan.countries.set(countries)
                self.stdout.write(f'  ✅ {plan}')

    def create_admin_user(self):
        """Crear usuario admin de prueba"""
        if not User.objects.filter(username='admin').exists():
            user = User.objects.create_superuser(
                username='admin',
                email='admin@hablaris.com',
                password='HablarisAdmin2025!'
            )
            self.stdout.write(f'  ✅ Usuario admin creado: {user.username}')
