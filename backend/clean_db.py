#!/usr/bin/env python
"""
Script para limpiar la base de datos de Railway
"""
import os
import django
from django.conf import settings
from django.core.management import execute_from_command_line

if __name__ == '__main__':
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'esim_backend.settings')
    django.setup()
    
    # Solo ejecutar migraciones core de Django
    from django.core.management import call_command
    
    print("🧹 Limpiando base de datos...")
    try:
        call_command('migrate', '--run-syncdb', verbosity=2)
        print("✅ Base de datos limpia creada")
    except Exception as e:
        print(f"❌ Error: {e}")
        print("🔄 Intentando con flush...")
        try:
            call_command('flush', '--noinput')
            call_command('migrate', verbosity=2)
            print("✅ Base de datos recreada exitosamente")
        except Exception as e2:
            print(f"❌ Error crítico: {e2}")
