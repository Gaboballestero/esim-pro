#!/bin/bash
set -e

echo "Running Django migrations..."
python manage.py migrate

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Starting Gunicorn server..."
exec gunicorn esim_backend.wsgi:application --bind 0.0.0.0:$PORT --workers 1
