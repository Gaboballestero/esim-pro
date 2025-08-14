"""
WSGI config for eSIM Pro project.
This file redirects to the actual wsgi.py in the backend folder.
"""

import os
import sys

# Add backend directory to Python path
backend_path = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.insert(0, backend_path)

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'esim_backend.settings')

from esim_backend.wsgi import application
