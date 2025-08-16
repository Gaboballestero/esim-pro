#!/usr/bin/env python
import os
import subprocess
import sys

print("Starting Django application...")

# Get port from environment
port = os.environ.get('PORT', '8000')

# Find Python executable
python_paths = [
    '/opt/venv/bin/python',
    '/usr/bin/python3',
    '/usr/bin/python',
    sys.executable
]

python_cmd = None
for path in python_paths:
    if os.path.exists(path):
        python_cmd = path
        break

if not python_cmd:
    python_cmd = 'python3'

print(f"Using Python: {python_cmd}")

try:
    # Run migrations
    print("Running migrations...")
    os.system(f'{python_cmd} manage.py migrate --noinput')
    
    # Collect static files (skip if fails)
    print("Collecting static files...")
    os.system(f'{python_cmd} manage.py collectstatic --noinput || echo "Static files skipped"')
    
    # Start server
    print(f"Starting server on port {port}...")
    os.system(f'{python_cmd} manage.py runserver 0.0.0.0:{port}')
    
except Exception as e:
    print(f"Error: {e}")
    # Final fallback
    os.system(f'python3 manage.py migrate --noinput || python manage.py migrate --noinput')
    os.system(f'python3 manage.py collectstatic --noinput || python manage.py collectstatic --noinput')
    os.system(f'python3 manage.py runserver 0.0.0.0:{port} || python manage.py runserver 0.0.0.0:{port}')
