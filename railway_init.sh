#!/bin/bash
# Script de inicialización para Railway

echo "🚀 Iniciando deployment de Hablaris..."

# Ejecutar migraciones
echo "📦 Aplicando migraciones..."
python manage.py migrate --noinput

# Crear superusuario automáticamente
echo "👤 Creando superusuario de admin..."
python manage.py create_admin

echo "✅ Deployment completado. Iniciando servidor..."
