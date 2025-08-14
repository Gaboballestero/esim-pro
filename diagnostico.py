#!/usr/bin/env python3
"""
Diagnóstico del Sistema eSIM Pro
Verifica el estado de la aplicación y proporciona recomendaciones
"""

import os
import sys
import subprocess
import json
from datetime import datetime

def print_header(title):
    print(f"\n{'='*60}")
    print(f"🎯 {title}")
    print('='*60)

def print_section(title):
    print(f"\n📋 {title}")
    print('-'*40)

def check_expo_status():
    """Verifica si Expo está corriendo"""
    print_section("ESTADO DE EXPO")
    
    try:
        # Verificar si el metro bundler está corriendo
        result = subprocess.run(['netstat', '-an'], capture_output=True, text=True)
        
        expo_ports = ['19000', '19001', '19002']  # Puertos típicos de Expo
        running_ports = []
        
        for port in expo_ports:
            if f":{port}" in result.stdout:
                running_ports.append(port)
        
        if running_ports:
            print(f"✅ Expo ejecutándose en puertos: {', '.join(running_ports)}")
            return True
        else:
            print("❌ Expo no está ejecutándose")
            print("💡 Ejecuta: npx expo start")
            return False
            
    except Exception as e:
        print(f"❌ Error verificando Expo: {e}")
        return False

def check_django_status():
    """Verifica si Django está corriendo"""
    print_section("ESTADO DE DJANGO")
    
    try:
        result = subprocess.run(['netstat', '-an'], capture_output=True, text=True)
        
        if ":8000" in result.stdout:
            print("✅ Django ejecutándose en puerto 8000")
            return True
        else:
            print("❌ Django no está ejecutándose")
            print("💡 Ejecuta: python manage.py runserver")
            return False
            
    except Exception as e:
        print(f"❌ Error verificando Django: {e}")
        return False

def check_mobile_config():
    """Verifica configuración del móvil"""
    print_section("CONFIGURACIÓN MÓVIL")
    
    # Verificar que AuthService esté configurado
    auth_service_path = "mobile/src/services/AuthService.ts"
    
    if os.path.exists(auth_service_path):
        with open(auth_service_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        if "DEMO_MODE = true" in content:
            print("⚠️  AuthService en modo DEMO")
            print("💡 Para conectar al backend: cambiar DEMO_MODE = false")
        elif "DEMO_MODE = false" in content:
            print("✅ AuthService configurado para backend real")
        
        if "localhost:8000" in content:
            print("✅ URL del backend configurada")
        else:
            print("❌ URL del backend no encontrada")
    else:
        print("❌ AuthService no encontrado")

def check_phone_connection():
    """Consejos para conexión con teléfono"""
    print_section("CONEXIÓN CON TELÉFONO")
    
    print("📱 Para que la app cargue en tu teléfono:")
    print("1. ✅ Asegúrate que tu PC y teléfono estén en la misma red WiFi")
    print("2. ✅ Escanea el QR de Expo con la app Expo Go")
    print("3. ✅ Si no funciona, prueba modo túnel: npx expo start --tunnel")
    print("4. ✅ Verifica que Windows Firewall no bloquee el puerto 19000")
    
    print("\n🔧 Comandos útiles:")
    print("   npx expo start --tunnel     # Modo túnel (más lento pero funciona siempre)")
    print("   npx expo start --localhost  # Solo localhost")
    print("   npx expo start --lan        # Red local (recomendado)")
    
    print("\n🔍 Troubleshooting:")
    print("   - Si sale 'Network response timed out': usar --tunnel")
    print("   - Si la app se queda en blanco: revisar logs de Metro")
    print("   - Si no conecta al backend: verificar DEMO_MODE en AuthService")

def check_admin_access():
    """Verifica acceso al panel admin"""
    print_section("PANEL DE ADMINISTRACIÓN")
    
    print("🏛️  Acceso al Admin Panel:")
    print("   URL: http://localhost:8000/admin/")
    print("   Usuario: admin")
    print("   Password: [la que configuraste]")
    
    print("\n📊 Funcionalidades disponibles:")
    print("   ✅ Gestión de usuarios (incluye datos OAuth)")
    print("   ✅ Monitoreo de autenticaciones Google/Apple")
    print("   ✅ Estadísticas de uso")
    print("   ✅ Configuración de planes y precios")

def main():
    print_header("DIAGNÓSTICO eSIM PRO")
    print(f"Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Cambiar al directorio del proyecto
    if os.path.exists("backend"):
        os.chdir("backend")
    
    django_ok = check_django_status()
    
    os.chdir("..")  # Volver al directorio raíz
    
    if os.path.exists("mobile"):
        os.chdir("mobile")
    
    expo_ok = check_expo_status()
    check_mobile_config()
    
    os.chdir("..")  # Volver al directorio raíz
    
    check_phone_connection()
    check_admin_access()
    
    print_header("RESUMEN Y PRÓXIMOS PASOS")
    
    if django_ok and expo_ok:
        print("🎉 ¡Excelente! Ambos servicios están corriendo")
        print("\n🚀 Próximos pasos:")
        print("1. Configura AuthService (DEMO_MODE = false)")
        print("2. Prueba la conexión móvil-backend")
        print("3. Configura datos reales en el admin panel")
    else:
        print("⚠️  Algunos servicios necesitan atención")
        if not django_ok:
            print("   - Iniciar Django: python manage.py runserver")
        if not expo_ok:
            print("   - Iniciar Expo: npx expo start")
    
    print("\n📚 Documentación completa: ADMIN_GUIDE.md")

if __name__ == "__main__":
    main()
