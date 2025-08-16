#!/usr/bin/env python
import os
import sys

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'esim_backend.settings')

# Get port
port = os.environ.get('PORT', '8000')

print(f"Starting Django on port {port}")

# Use os.system for maximum compatibility
os.system(f'python manage.py runserver 0.0.0.0:{port} --insecure')
