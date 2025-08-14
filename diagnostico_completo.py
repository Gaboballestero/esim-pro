#!/usr/bin/env python3
"""
🎯 DIAGNÓSTICO COMPLETO - eSIM Pro
Evalúa el estado actual y proporciona plan de acción específico
"""

import os
import json
import subprocess
from datetime import datetime

def print_header(title, emoji="🎯"):
    print(f"\n{'='*60}")
    print(f"{emoji} {title}")
    print('='*60)

def print_section(title, emoji="📋"):
    print(f"\n{emoji} {title}")
    print('-'*40)

def check_file_exists(path, description):
    """Verifica si un archivo existe y retorna estado"""
    if os.path.exists(path):
        print(f"✅ {description}: {path}")
        return True
    else:
        print(f"❌ {description}: {path} (NO ENCONTRADO)")
        return False

def check_backend_status():
    """Verifica estado completo del backend"""
    print_section("ESTADO DEL BACKEND", "🏗️")
    
    backend_files = {
        "backend/manage.py": "Archivo principal Django",
        "backend/esim_backend/settings.py": "Configuración principal",
        "backend/users/models.py": "Modelos de usuarios",
        "backend/plans/models.py": "Modelos de planes",
        "backend/esims/models.py": "Modelos de eSIMs",
        "backend/payments/models.py": "Modelos de pagos",
        "backend/db.sqlite3": "Base de datos"
    }
    
    status = {}
    for file_path, description in backend_files.items():
        status[file_path] = check_file_exists(file_path, description)
    
    # Verificar configuración
    print(f"\n🔧 Verificando configuración...")
    try:
        with open("backend/esim_backend/settings.py", 'r', encoding='utf-8') as f:
            settings_content = f.read()
            
        if "'users'," in settings_content and not "# 'users'," in settings_content:
            print("✅ App 'users' habilitada")
        else:
            print("⚠️  App 'users' deshabilitada")
            
        if "AUTH_USER_MODEL = 'users.User'" in settings_content:
            print("✅ Modelo de usuario personalizado configurado")
        else:
            print("⚠️  Usando modelo de usuario por defecto")
            
    except Exception as e:
        print(f"❌ Error leyendo settings: {e}")
    
    return status

def check_frontend_status():
    """Verifica estado del frontend"""
    print_section("ESTADO DEL FRONTEND", "📱")
    
    frontend_files = {
        "mobile/package.json": "Configuración del proyecto",
        "mobile/App.tsx": "Componente principal",
        "mobile/src/services/AuthService.ts": "Servicio de autenticación",
        "mobile/src/screens/ProfileScreen.tsx": "Pantalla de perfil",
        "mobile/src/screens/ShopScreen.tsx": "Pantalla de tienda",
        "mobile/src/contexts/AuthContext.tsx": "Contexto de autenticación"
    }
    
    status = {}
    for file_path, description in frontend_files.items():
        status[file_path] = check_file_exists(file_path, description)
    
    # Verificar configuración de AuthService
    print(f"\n🔧 Verificando AuthService...")
    try:
        with open("mobile/src/services/AuthService.ts", 'r', encoding='utf-8') as f:
            auth_content = f.read()
            
        if "DEMO_MODE = true" in auth_content:
            print("⚠️  AuthService en MODO DEMO")
            print("💡 Cambiar a DEMO_MODE = false para conectar al backend")
        elif "DEMO_MODE = false" in auth_content:
            print("✅ AuthService configurado para backend real")
        else:
            print("❓ No se encontró configuración DEMO_MODE")
            
    except Exception as e:
        print(f"❌ Error leyendo AuthService: {e}")
    
    return status

def check_integration_readiness():
    """Verifica preparación para integraciones"""
    print_section("PREPARACIÓN PARA INTEGRACIONES", "🔗")
    
    print("📍 APIs de eSIM disponibles:")
    esim_providers = [
        ("Truphone", "https://developer.truphone.com/", "Fácil integración, buena cobertura"),
        ("Airalo", "https://partners.airalo.com/", "Gran variedad de países"),
        ("1GLOBAL", "https://1global.com/developers/", "Cobertura premium"),
        ("GigSky", "https://www.gigsky.com/business", "Enfoque B2B")
    ]
    
    for name, url, description in esim_providers:
        print(f"  • {name}: {description}")
        print(f"    URL: {url}")
    
    print(f"\n💳 Pasarelas de pago:")
    payment_providers = [
        ("Stripe", "Recomendado - Fácil integración", "✅"),
        ("PayPal", "Amplia aceptación", "✅"),
        ("Apple Pay", "Nativo en iOS", "🟡"),
        ("Google Pay", "Nativo en Android", "🟡")
    ]
    
    for name, description, status in payment_providers:
        print(f"  {status} {name}: {description}")

def check_deployment_readiness():
    """Verifica preparación para deployment"""
    print_section("PREPARACIÓN PARA DEPLOYMENT", "🚀")
    
    print("🏗️ Opciones de infraestructura:")
    deployment_options = [
        ("Railway", "Más fácil, $5-20/mes", "🟢 Recomendado para empezar"),
        ("DigitalOcean", "Balanceado, $10-50/mes", "🟡 Buena opción"),
        ("AWS", "Escalable, $20-100+/mes", "🔴 Más complejo"),
        ("Heroku", "Simple, $7-25/mes", "🟡 Funciona bien")
    ]
    
    for platform, cost, recommendation in deployment_options:
        print(f"  • {platform}: {cost} - {recommendation}")
    
    print(f"\n📱 Stores y distribución:")
    stores = [
        ("TestFlight (iOS)", "Beta testing", "Gratis"),
        ("Play Console (Android)", "Beta testing", "$25 una vez"),
        ("App Store", "Lanzamiento iOS", "$99/año"),
        ("Google Play", "Lanzamiento Android", "$25 una vez")
    ]
    
    for store, purpose, cost in stores:
        print(f"  • {store}: {purpose} - {cost}")

def generate_action_plan():
    """Genera plan de acción específico"""
    print_section("PLAN DE ACCIÓN INMEDIATO", "⚡")
    
    actions = [
        {
            "priority": "🔴 CRÍTICO",
            "task": "Habilitar modelos en el backend",
            "commands": [
                "cd backend",
                "# Descomentar apps en settings.py",
                "python manage.py makemigrations",
                "python manage.py migrate",
                "python manage.py createsuperuser"
            ],
            "time": "30 minutos"
        },
        {
            "priority": "🔴 CRÍTICO", 
            "task": "Conectar frontend con backend",
            "commands": [
                "# En AuthService.ts cambiar:",
                "private DEMO_MODE = false;",
                "# Probar login/logout real"
            ],
            "time": "15 minutos"
        },
        {
            "priority": "🟡 IMPORTANTE",
            "task": "Configurar API de eSIM de prueba",
            "commands": [
                "# Crear cuenta en Truphone/Airalo",
                "# Obtener API keys de sandbox",
                "# Configurar en .env"
            ],
            "time": "2 horas"
        },
        {
            "priority": "🟡 IMPORTANTE",
            "task": "Configurar pagos en sandbox",
            "commands": [
                "# Crear cuenta Stripe test",
                "# Configurar webhooks",
                "# Integrar en frontend"
            ],
            "time": "3 horas"
        },
        {
            "priority": "🟢 MEJORA",
            "task": "Setup de producción",
            "commands": [
                "# Elegir plataforma de hosting",
                "# Configurar dominio",
                "# Setup CI/CD"
            ],
            "time": "1 día"
        }
    ]
    
    for i, action in enumerate(actions, 1):
        print(f"\n{i}. {action['priority']} {action['task']} ({action['time']})")
        for cmd in action['commands']:
            print(f"   {cmd}")

def estimate_timeline():
    """Estima timeline hasta lanzamiento"""
    print_section("TIMELINE ESTIMADO", "📅")
    
    phases = [
        {
            "phase": "Fase 1: Backend Funcional",
            "duration": "1-2 días",
            "tasks": [
                "Habilitar modelos y migraciones",
                "Configurar admin panel completo", 
                "Conectar frontend con backend",
                "Testing básico de autenticación"
            ]
        },
        {
            "phase": "Fase 2: Integraciones Básicas", 
            "duration": "3-5 días",
            "tasks": [
                "Integrar API de eSIM (sandbox)",
                "Configurar pagos (sandbox)",
                "Implementar flujo de compra básico",
                "Testing end-to-end"
            ]
        },
        {
            "phase": "Fase 3: Producción y Lanzamiento",
            "duration": "5-7 días", 
            "tasks": [
                "Setup de infraestructura",
                "Configurar APIs de producción",
                "Build y deploy",
                "Submit a stores"
            ]
        }
    ]
    
    total_days = 0
    for phase in phases:
        print(f"\n📊 {phase['phase']} ({phase['duration']})")
        for task in phase['tasks']:
            print(f"   • {task}")
        # Extraer días máximos
        duration_parts = phase['duration'].split('-')
        if len(duration_parts) == 2:
            max_days = int(duration_parts[1].split()[0])
            total_days += max_days
    
    print(f"\n🎯 TIEMPO TOTAL ESTIMADO: {total_days} días (aprox. {total_days//7} semanas)")
    print(f"📅 Fecha estimada de lanzamiento: {datetime.now().strftime('%d/%m/%Y')} + {total_days} días")

def main():
    print_header("DIAGNÓSTICO COMPLETO eSIM PRO", "🎯")
    print(f"Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Cambiar al directorio del proyecto si existe
    if os.path.exists("backend") or os.path.exists("mobile"):
        print("✅ Directorio del proyecto encontrado")
    else:
        print("❌ No se encontró el directorio del proyecto")
        return
    
    # Ejecutar diagnósticos
    backend_status = check_backend_status()
    frontend_status = check_frontend_status()
    check_integration_readiness()
    check_deployment_readiness()
    generate_action_plan()
    estimate_timeline()
    
    # Resumen final
    print_header("RESUMEN EJECUTIVO", "📊")
    
    backend_ready = sum(backend_status.values()) / len(backend_status) * 100
    frontend_ready = sum(frontend_status.values()) / len(frontend_status) * 100
    
    print(f"🏗️  Backend: {backend_ready:.0f}% completo")
    print(f"📱 Frontend: {frontend_ready:.0f}% completo")
    print(f"🎯 Estado general: {(backend_ready + frontend_ready) / 2:.0f}% listo para desarrollo")
    
    if backend_ready > 80 and frontend_ready > 80:
        print(f"\n🎉 ¡Excelente! Tu app está muy bien estructurada.")
        print(f"🚀 Siguiente paso: Habilitar backend completo y conectar con frontend")
    elif backend_ready > 60 or frontend_ready > 60:
        print(f"\n👍 Buen progreso. Necesitas enfocarte en las integraciones.")
        print(f"🔧 Siguiente paso: Completar configuración básica")
    else:
        print(f"\n⚠️  Necesitas completar la configuración básica primero.")
        print(f"📚 Revisar documentación: ROADMAP_LANZAMIENTO.md")
    
    print(f"\n📖 Documentación completa: ROADMAP_LANZAMIENTO.md")
    print(f"🔧 Siguiente comando sugerido: cd backend && python manage.py makemigrations")

if __name__ == "__main__":
    main()
