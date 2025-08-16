#!/usr/bin/env python
import os
import subprocess
import sys

print("Starting Django application...")

# Get port from environment
port = os.environ.get('PORT', '8000')

try:
    # Run migrations
    print("Running migrations...")
    subprocess.run([sys.executable, 'manage.py', 'migrate', '--noinput'])
    
    # Collect static files (skip if fails)
    print("Collecting static files...")
    try:
        subprocess.run([sys.executable, 'manage.py', 'collectstatic', '--noinput'])
    except:
        print("Static files collection skipped")
    
    # Start server
    print(f"Starting server on port {port}...")
    os.system(f'python manage.py runserver 0.0.0.0:{port}')
    
except Exception as e:
    print(f"Error: {e}")
    # Direct fallback
    os.system(f'python manage.py migrate --noinput || true')
    os.system(f'python manage.py collectstatic --noinput || true')
    os.system(f'python manage.py runserver 0.0.0.0:{port}')
