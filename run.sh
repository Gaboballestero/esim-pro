#!/bin/bash
echo "Starting Railway deployment..."

# Run migrations
echo "Running migrations..."
/opt/venv/bin/python manage.py migrate --noinput || python3 manage.py migrate --noinput || python manage.py migrate --noinput

# Collect static files
echo "Collecting static files..."
/opt/venv/bin/python manage.py collectstatic --noinput || python3 manage.py collectstatic --noinput || echo "Static files skipped"

# Start the server
echo "Starting Django server..."
exec /opt/venv/bin/python manage.py runserver 0.0.0.0:$PORT || exec python3 manage.py runserver 0.0.0.0:$PORT || exec python manage.py runserver 0.0.0.0:$PORT
