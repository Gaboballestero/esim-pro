#!/usr/bin/env python
"""
Script para verificar e instalar dependencias de eSIM Pro
"""
import subprocess
import sys
import os
from pathlib import Path

def run_command(command, cwd=None):
    """Ejecuta un comando y retorna el resultado"""
    try:
        result = subprocess.run(command, shell=True, cwd=cwd, capture_output=True, text=True)
        return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        return False, "", str(e)

def main():
    print("🔧 Verificando entorno de eSIM Pro...")
    
    # Verificar que estamos en el directorio correcto
    project_root = Path(__file__).parent
    backend_dir = project_root / "backend"
    
    if not backend_dir.exists():
        print("❌ Error: Directorio backend no encontrado")
        return False
    
    # Verificar Python virtual environment
    venv_python = project_root / ".venv" / "Scripts" / "python.exe"
    if not venv_python.exists():
        print("❌ Error: Entorno virtual no encontrado")
        return False
    
    print(f"✅ Entorno virtual encontrado: {venv_python}")
    
    # Verificar Django
    success, stdout, stderr = run_command(f'"{venv_python}" -c "import django; print(django.get_version())"')
    if success:
        print(f"✅ Django instalado: {stdout.strip()}")
    else:
        print("❌ Django no encontrado, instalando...")
        success, _, _ = run_command(f'"{venv_python}" -m pip install django djangorestframework django-cors-headers pillow')
        if success:
            print("✅ Django instalado correctamente")
        else:
            print("❌ Error instalando Django")
            return False
    
    # Verificar migraciones
    print("🔄 Aplicando migraciones...")
    success, stdout, stderr = run_command(f'"{venv_python}" manage.py migrate', cwd=backend_dir)
    if success:
        print("✅ Migraciones aplicadas")
    else:
        print(f"⚠️ Error en migraciones: {stderr}")
    
    print("\n🎉 ¡Entorno verificado y listo!")
    return True

if __name__ == "__main__":
    main()
