#!/usr/bin/env python3
"""
Hablaris eSIM Platform
Entry point for Railway deployment
"""

import os
import sys
import django
from django.core.wsgi import get_wsgi_application

# Add backend to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'esim_backend.settings')

# Get WSGI application
django.setup()
application = get_wsgi_application()

if __name__ == "__main__":
    from django.core.management import execute_from_command_line
    execute_from_command_line(sys.argv)
