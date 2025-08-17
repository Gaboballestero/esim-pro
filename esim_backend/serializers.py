from rest_framework import serializers
from .models import Country, DataPlan, Order, ESim, User

class CountrySerializer(serializers.ModelSerializer):
    """Serializer para países"""
    class Meta:
        model = Country
        fields = [
            'id', 'code', 'name', 'flag_emoji', 'region', 
            'is_popular', 'is_active'
        ]

class DataPlanListSerializer(serializers.ModelSerializer):
    """Serializer simplificado para lista de planes"""
    countries = CountrySerializer(many=True, read_only=True)
    countries_count = serializers.ReadOnlyField()
    discount_percentage = serializers.ReadOnlyField()
    
    class Meta:
        model = DataPlan
        fields = [
            'id', 'name', 'slug', 'plan_type', 'countries', 'countries_count',
            'data_amount_gb', 'is_unlimited', 'validity_days',
            'price_usd', 'original_price_usd', 'discount_percentage',
            'supports_5g', 'supports_hotspot', 'includes_calls', 'includes_sms',
            'is_popular', 'is_featured', 'badge_text', 'network_operators'
        ]

class DataPlanDetailSerializer(serializers.ModelSerializer):
    """Serializer detallado para un plan específico"""
    countries = CountrySerializer(many=True, read_only=True)
    countries_count = serializers.ReadOnlyField()
    discount_percentage = serializers.ReadOnlyField()
    
    class Meta:
        model = DataPlan
        fields = '__all__'

class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer para registro de usuario"""
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'first_name', 'last_name', 
            'phone', 'country_code', 'preferred_language',
            'password', 'password_confirm'
        ]
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Las contraseñas no coinciden")
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer para perfil de usuario"""
    total_orders = serializers.ReadOnlyField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'phone', 'country_code', 'preferred_language', 'is_premium',
            'total_orders', 'date_joined'
        ]
        read_only_fields = ['id', 'username', 'date_joined', 'is_premium', 'total_orders']

class OrderCreateSerializer(serializers.ModelSerializer):
    """Serializer para crear pedidos"""
    class Meta:
        model = Order
        fields = [
            'plan', 'customer_email', 'customer_phone'
        ]
    
    def create(self, validated_data):
        user = self.context['request'].user
        plan = validated_data['plan']
        
        order = Order.objects.create(
            user=user,
            plan=plan,
            total_amount=plan.price_usd,
            customer_email=validated_data['customer_email'],
            customer_phone=validated_data.get('customer_phone', ''),
            status='pending'
        )
        return order

class OrderSerializer(serializers.ModelSerializer):
    """Serializer para mostrar pedidos"""
    plan = DataPlanListSerializer(read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'plan', 'total_amount', 'currency', 'payment_method',
            'status', 'customer_email', 'customer_phone',
            'created_at', 'updated_at', 'completed_at'
        ]

class ESimSerializer(serializers.ModelSerializer):
    """Serializer para eSIMs"""
    plan = DataPlanListSerializer(read_only=True)
    order = OrderSerializer(read_only=True)
    data_used_gb = serializers.ReadOnlyField()
    data_remaining_gb = serializers.ReadOnlyField()
    
    class Meta:
        model = ESim
        fields = [
            'id', 'plan', 'order', 'iccid', 'qr_code', 'activation_code',
            'status', 'data_used_mb', 'data_used_gb', 'data_remaining_gb',
            'activated_at', 'expires_at', 'created_at'
        ]

# Serializers para filtros y búsquedas
class PlanFilterSerializer(serializers.Serializer):
    """Serializer para filtrar planes"""
    countries = serializers.ListField(
        child=serializers.CharField(max_length=2),
        required=False,
        help_text="Códigos de países (ej: ['US', 'ES'])"
    )
    min_data = serializers.IntegerField(required=False, min_value=1)
    max_data = serializers.IntegerField(required=False, min_value=1)
    min_days = serializers.IntegerField(required=False, min_value=1)
    max_days = serializers.IntegerField(required=False, min_value=1)
    min_price = serializers.DecimalField(required=False, max_digits=8, decimal_places=2, min_value=0)
    max_price = serializers.DecimalField(required=False, max_digits=8, decimal_places=2, min_value=0)
    plan_type = serializers.ChoiceField(
        choices=['country', 'regional', 'global'],
        required=False
    )
    supports_5g = serializers.BooleanField(required=False)
    supports_hotspot = serializers.BooleanField(required=False)
    includes_calls = serializers.BooleanField(required=False)
    includes_sms = serializers.BooleanField(required=False)
    is_popular = serializers.BooleanField(required=False)
    is_featured = serializers.BooleanField(required=False)
    search = serializers.CharField(required=False, max_length=100)
    
    def validate(self, data):
        # Validaciones cruzadas
        if 'min_data' in data and 'max_data' in data:
            if data['min_data'] > data['max_data']:
                raise serializers.ValidationError("min_data no puede ser mayor que max_data")
        
        if 'min_days' in data and 'max_days' in data:
            if data['min_days'] > data['max_days']:
                raise serializers.ValidationError("min_days no puede ser mayor que max_days")
        
        if 'min_price' in data and 'max_price' in data:
            if data['min_price'] > data['max_price']:
                raise serializers.ValidationError("min_price no puede ser mayor que max_price")
        
        return data
