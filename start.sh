#!/bin/bash

# Find Python executable
if command -v python3 &> /dev/null; then
    PYTHON=python3
elif command -v python &> /dev/null; then
    PYTHON=python
else
    echo "Python not found!"
    exit 1
fi

echo "Using Python: $PYTHON"

# Run migrations
$PYTHON manage.py migrate

# Collect static files
$PYTHON manage.py collectstatic --noinput

# Start gunicorn
$PYTHON -m gunicorn esim_backend.wsgi:application --bind 0.0.0.0:$PORT --workers 1
