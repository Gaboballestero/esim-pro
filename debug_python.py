#!/usr/bin/env python3
import sys
import os

print("Python executable:", sys.executable)
print("Python version:", sys.version)
print("Python path:", sys.path[0])
print("Current working directory:", os.getcwd())

# List all files in current directory
print("Files in current directory:")
for f in os.listdir('.'):
    print(f"  {f}")

# Try to import Django
try:
    import django
    print("Django version:", django.get_version())
except Exception as e:
    print("Django import error:", e)

# Check manage.py
if os.path.exists('manage.py'):
    print("manage.py exists ✓")
else:
    print("manage.py NOT FOUND ✗")

print("Environment variables:")
for key in ['PORT', 'DJANGO_SETTINGS_MODULE', 'PYTHONPATH']:
    print(f"  {key}: {os.environ.get(key, 'NOT SET')}")
