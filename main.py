#!/usr/bin/env python3
"""
Hablaris eSIM Platform
Entry point for Railway deployment
"""

import os
import sys
import django
from django.core.management import execute_from_command_line

# Add backend to Python path
backend_path = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.insert(0, backend_path)

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'esim_backend.settings')

if __name__ == "__main__":
    # Change to backend directory
    os.chdir(backend_path)
    execute_from_command_line(sys.argv)
