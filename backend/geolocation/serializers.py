from rest_framework import serializers
from .models import Country, NetworkOperator, LocationHistory, TravelPattern, GeofenceAlert


class CountrySerializer(serializers.ModelSerializer):
    operators_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Country
        fields = ('id', 'name', 'code', 'code_3', 'continent', 'region', 
                 'currency', 'language', 'timezone', 'calling_code',
                 'latitude', 'longitude', 'esim_supported', 'coverage_quality',
                 'flag_emoji', 'is_popular', 'operators_count')
    
    def get_operators_count(self, obj):
        return obj.operators.count()


class NetworkOperatorSerializer(serializers.ModelSerializer):
    country_name = serializers.CharField(source='country.name', read_only=True)
    
    class Meta:
        model = NetworkOperator
        fields = ('id', 'name', 'country_name', 'network_type', 
                 'frequency_bands', 'coverage_percentage', 'is_primary')


class LocationHistorySerializer(serializers.ModelSerializer):
    country_name = serializers.CharField(source='country.name', read_only=True)
    country_flag = serializers.CharField(source='country.flag_emoji', read_only=True)
    
    class Meta:
        model = LocationHistory
        fields = ('id', 'country_name', 'country_flag', 'city', 
                 'latitude', 'longitude', 'detected_at', 'detection_method',
                 'accuracy', 'is_roaming')
        read_only_fields = ('id', 'detected_at')


class TravelPatternSerializer(serializers.ModelSerializer):
    frequent_countries_data = CountrySerializer(source='frequent_countries', many=True, read_only=True)
    
    class Meta:
        model = TravelPattern
        fields = ('id', 'frequent_countries_data', 'preferred_regions',
                 'average_trip_duration', 'typical_data_usage', 
                 'prefers_unlimited', 'budget_range')


class GeofenceAlertSerializer(serializers.ModelSerializer):
    country_name = serializers.CharField(source='country.name', read_only=True)
    country_flag = serializers.CharField(source='country.flag_emoji', read_only=True)
    
    class Meta:
        model = GeofenceAlert
        fields = ('id', 'country_name', 'country_flag', 'alert_type',
                 'title', 'message', 'action_button', 'action_url',
                 'is_active', 'triggered_at', 'acknowledged', 'created_at')
        read_only_fields = ('id', 'triggered_at', 'created_at')


class LocationDetectionSerializer(serializers.Serializer):
    """Serializer para detectar ubicación"""
    latitude = serializers.DecimalField(max_digits=10, decimal_places=7, required=False)
    longitude = serializers.DecimalField(max_digits=10, decimal_places=7, required=False)
    accuracy = serializers.IntegerField(required=False)
    method = serializers.ChoiceField(
        choices=['gps', 'ip', 'manual'],
        default='gps'
    )


class CountrySearchSerializer(serializers.Serializer):
    """Serializer para búsqueda de países"""
    query = serializers.CharField(max_length=100)
    continent = serializers.CharField(max_length=50, required=False)
    esim_only = serializers.BooleanField(default=True)
