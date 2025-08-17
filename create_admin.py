#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'esim_backend.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Crear superusuario
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser(
        username='admin',
        email='admin@hablaris.com',
        password='HablarisAdmin2025!'
    )
    print("✅ Superusuario creado:")
    print("🔐 Username: admin")
    print("🔐 Password: HablarisAdmin2025!")
    print("🌐 Admin URL: https://www.hablaris.com/admin/")
else:
    print("⚠️  Superusuario ya existe")
