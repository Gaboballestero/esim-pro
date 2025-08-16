#!/bin/bash
echo "Starting Railway deployment..."

PYTHON_CMD="/opt/venv/bin/python"

# Run migrations
echo "Running migrations..."
$PYTHON_CMD manage.py migrate --noinput

# Collect static files
echo "Collecting static files..."
$PYTHON_CMD manage.py collectstatic --noinput || echo "Static files skipped"

# Start the server
echo "Starting Django server on port $PORT..."
exec $PYTHON_CMD manage.py runserver 0.0.0.0:$PORT
