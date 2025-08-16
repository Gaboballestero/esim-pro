#!/usr/bin/env python
import os
import sys
import subprocess

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'esim_backend.settings')

# Get port
port = os.environ.get('PORT', '8000')

print(f"Starting Django on port {port}")
print("Python executable:", sys.executable)
print("Python version:", sys.version)

try:
    # Try to run migrations
    print("Running migrations...")
    subprocess.run([sys.executable, 'manage.py', 'migrate', '--noinput'], check=False)
    print("Migrations completed (or skipped)")
except Exception as e:
    print(f"Migration error: {e}")

# Start server using subprocess instead of os.system
try:
    print(f"Starting Django server on 0.0.0.0:{port}")
    subprocess.run([sys.executable, 'manage.py', 'runserver', f'0.0.0.0:{port}', '--insecure'], check=True)
except Exception as e:
    print(f"Server start error: {e}")
    # Fallback to os.system
    print("Trying fallback method...")
    os.system(f'python manage.py runserver 0.0.0.0:{port} --insecure')
