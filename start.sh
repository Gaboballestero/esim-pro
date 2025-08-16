#!/bin/bash
set -e

echo "Starting Django application..."

# Find Python executable
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
elif [ -f "/opt/venv/bin/python" ]; then
    PYTHON_CMD="/opt/venv/bin/python"
else
    echo "Python not found!"
    exit 1
fi

echo "Using Python: $PYTHON_CMD"

# Get port
PORT=${PORT:-8000}

# Run migrations
echo "Running migrations..."
$PYTHON_CMD manage.py migrate --noinput

# Collect static files
echo "Collecting static files..."
$PYTHON_CMD manage.py collectstatic --noinput || echo "Static files collection skipped"

# Start server
echo "Starting server on port $PORT..."
exec $PYTHON_CMD manage.py runserver 0.0.0.0:$PORT
