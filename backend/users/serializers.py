from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
import requests
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from .models import User, UserProfile


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('email', 'username', 'password', 'password_confirm', 'phone_number')
        
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match.")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        UserProfile.objects.create(user=user)
        return user


class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            user = authenticate(username=email, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials.')
            attrs['user'] = user
        return attrs


class GoogleAuthSerializer(serializers.Serializer):
    id_token = serializers.CharField(required=True)
    
    def validate_id_token(self, value):
        try:
            # Verificar el token de Google
            from google.oauth2 import id_token as google_id_token
            from google.auth.transport import requests as google_requests
            import requests
            
            # Verificar el token con Google
            idinfo = google_id_token.verify_oauth2_token(
                value, 
                google_requests.Request(), 
                audience=None  # Se configurará en settings
            )
            
            if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
                raise serializers.ValidationError('Token inválido.')
            
            return idinfo
        except Exception as e:
            raise serializers.ValidationError(f'Error al verificar token de Google: {str(e)}')
    
    def create_or_get_user(self, validated_data):
        idinfo = validated_data['id_token']
        email = idinfo.get('email')
        first_name = idinfo.get('given_name', '')
        last_name = idinfo.get('family_name', '')
        picture = idinfo.get('picture', '')
        
        try:
            user = User.objects.get(email=email)
            # Actualizar información si es necesario
            if not user.first_name and first_name:
                user.first_name = first_name
            if not user.last_name and last_name:
                user.last_name = last_name
            if not user.profile_picture and picture:
                user.profile_picture = picture
            user.save()
            
        except User.DoesNotExist:
            # Crear nuevo usuario
            username = email.split('@')[0]
            # Asegurar que el username sea único
            counter = 1
            original_username = username
            while User.objects.filter(username=username).exists():
                username = f"{original_username}_{counter}"
                counter += 1
            
            user = User.objects.create_user(
                email=email,
                username=username,
                first_name=first_name,
                last_name=last_name,
                profile_picture=picture,
                is_email_verified=True  # Google ya verificó el email
            )
            UserProfile.objects.create(user=user)
        
        return user


class AppleAuthSerializer(serializers.Serializer):
    id_token = serializers.CharField(required=True)
    user_info = serializers.JSONField(required=False)  # Apple envía info del usuario solo la primera vez
    
    def validate_id_token(self, value):
        try:
            import jwt
            import requests
            from cryptography.hazmat.primitives import serialization
            
            # Obtener las claves públicas de Apple
            response = requests.get('https://appleid.apple.com/auth/keys')
            keys = response.json()['keys']
            
            # Decodificar el header del token para obtener el kid
            header = jwt.get_unverified_header(value)
            kid = header['kid']
            
            # Encontrar la clave correspondiente
            key = None
            for k in keys:
                if k['kid'] == kid:
                    key = k
                    break
            
            if not key:
                raise serializers.ValidationError('Clave no encontrada.')
            
            # Construir la clave pública
            public_key = jwt.algorithms.RSAAlgorithm.from_jwk(key)
            
            # Verificar el token
            payload = jwt.decode(
                value,
                public_key,
                algorithms=['RS256'],
                audience='your.app.bundle.id',  # Se configurará en settings
                issuer='https://appleid.apple.com'
            )
            
            return payload
        except Exception as e:
            raise serializers.ValidationError(f'Error al verificar token de Apple: {str(e)}')
    
    def create_or_get_user(self, validated_data):
        payload = validated_data['id_token']
        user_info = validated_data.get('user_info', {})
        
        email = payload.get('email')
        if not email:
            raise serializers.ValidationError('Email requerido.')
        
        first_name = ''
        last_name = ''
        
        # Apple envía la información del usuario solo la primera vez
        if user_info and 'name' in user_info:
            first_name = user_info['name'].get('firstName', '')
            last_name = user_info['name'].get('lastName', '')
        
        try:
            user = User.objects.get(email=email)
            
        except User.DoesNotExist:
            # Crear nuevo usuario
            username = email.split('@')[0]
            # Asegurar que el username sea único
            counter = 1
            original_username = username
            while User.objects.filter(username=username).exists():
                username = f"{original_username}_{counter}"
                counter += 1
            
            user = User.objects.create_user(
                email=email,
                username=username,
                first_name=first_name,
                last_name=last_name,
                is_email_verified=True  # Apple ya verificó el email
            )
            UserProfile.objects.create(user=user)
        
        return user


class SocialAuthTokenSerializer(serializers.Serializer):
    provider = serializers.ChoiceField(choices=['google', 'apple'])
    id_token = serializers.CharField(required=True)
    user_info = serializers.JSONField(required=False)  # Para Apple
    
    def validate(self, attrs):
        provider = attrs.get('provider')
        id_token = attrs.get('id_token')
        
        if provider == 'google':
            serializer = GoogleAuthSerializer(data={'id_token': id_token})
            if serializer.is_valid():
                user = serializer.create_or_get_user(serializer.validated_data)
                attrs['user'] = user
            else:
                raise serializers.ValidationError(serializer.errors)
                
        elif provider == 'apple':
            data = {'id_token': id_token}
            if 'user_info' in attrs:
                data['user_info'] = attrs['user_info']
            
            serializer = AppleAuthSerializer(data=data)
            if serializer.is_valid():
                user = serializer.create_or_get_user(serializer.validated_data)
                attrs['user'] = user
            else:
                raise serializers.ValidationError(serializer.errors)
        
        return attrs


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ('preferred_language', 'preferred_currency')


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'first_name', 'last_name', 'phone_number', 
                 'country_code', 'date_of_birth', 'profile_picture', 'profile')
        read_only_fields = ('id',)


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    # Campos del usuario
    first_name = serializers.CharField(source='user.first_name', max_length=30, required=False)
    last_name = serializers.CharField(source='user.last_name', max_length=30, required=False)
    phone_number = serializers.CharField(source='user.phone_number', max_length=15, required=False)
    country_code = serializers.CharField(source='user.country_code', max_length=5, required=False)
    date_of_birth = serializers.DateField(source='user.date_of_birth', required=False)
    profile_picture = serializers.URLField(source='user.profile_picture', required=False)
    
    # Campos del perfil
    preferred_language = serializers.CharField(max_length=10, required=False)
    preferred_currency = serializers.CharField(max_length=3, required=False)
    
    class Meta:
        model = UserProfile
        fields = ('first_name', 'last_name', 'phone_number', 'country_code', 
                 'date_of_birth', 'profile_picture', 'preferred_language', 'preferred_currency')
    
    def update(self, instance, validated_data):
        # Actualizar campos del usuario
        user_data = validated_data.pop('user', {})
        user = instance.user
        
        for attr, value in user_data.items():
            setattr(user, attr, value)
        user.save()
        
        # Actualizar campos del perfil
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        return instance


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8)
    confirm_password = serializers.CharField(required=True)
    
    def validate_current_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('La contraseña actual es incorrecta.')
        return value
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError('Las contraseñas nuevas no coinciden.')
        
        # Validar que la nueva contraseña sea diferente a la actual
        if attrs['current_password'] == attrs['new_password']:
            raise serializers.ValidationError('La nueva contraseña debe ser diferente a la actual.')
        
        return attrs
