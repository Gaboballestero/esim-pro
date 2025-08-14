#!/usr/bin/env python
"""
Entry point for Railway deployment.
Sets up Django and runs management commands.
"""
import os
import sys
import django
from pathlib import Path

# Add the backend directory to Python path
backend_path = Path(__file__).parent / 'backend'
sys.path.insert(0, str(backend_path))

# Change to backend directory
os.chdir(str(backend_path))

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'esim_backend.settings')

# Setup Django
django.setup()

if __name__ == '__main__':
    from django.core.management import execute_from_command_line
    
    # Execute the command passed as argument
    if len(sys.argv) > 1:
        execute_from_command_line(['manage.py'] + sys.argv[1:])
    else:
        print("No command specified")
