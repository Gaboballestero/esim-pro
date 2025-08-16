"""
WSGI config for esim_backend project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/wsgi/
"""

import os
from django.core.wsgi import get_wsgi_application
from django.core.management import execute_from_command_line

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'esim_backend.settings')

# Run migrations on startup
try:
    execute_from_command_line(['manage.py', 'migrate', '--noinput'])
    print("Migrations completed successfully")
except Exception as e:
    print(f"Migration warning: {e}")

# Try to collect static files
try:
    execute_from_command_line(['manage.py', 'collectstatic', '--noinput'])
    print("Static files collected successfully")
except Exception as e:
    print(f"Static files warning: {e}")

application = get_wsgi_application()
