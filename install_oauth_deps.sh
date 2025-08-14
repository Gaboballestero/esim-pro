#!/bin/bash

# Script para instalar dependencias de OAuth para eSIM Pro

echo "🔐 Instalando dependencias de autenticación social..."

# Instalar dependencias principales
pip install google-auth==2.25.0
pip install google-auth-oauthlib==1.1.0
pip install google-auth-httplib2==0.2.0
pip install PyJWT==2.8.0
pip install cryptography==41.0.7
pip install requests==2.31.0

# Dependencias adicionales para OAuth
pip install python-social-auth==0.3.6
pip install social-auth-app-django==5.4.0

echo "✅ Dependencias instaladas correctamente"

echo "🔧 Configuración requerida:"
echo "1. Configurar Google OAuth en Google Console"
echo "2. Configurar Apple Sign In en Apple Developer"
echo "3. Actualizar oauth_config.py con tus credenciales"
echo "4. Agregar las configuraciones a settings.py"

echo "📱 Para el frontend móvil:"
echo "1. Instalar @react-native-google-signin/google-signin"
echo "2. Instalar @invertase/react-native-apple-authentication"
echo "3. Configurar iOS y Android para OAuth"
