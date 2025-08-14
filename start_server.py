#!/usr/bin/env python3
import os
import subprocess
import sys

def main():
    """Start the Django application"""
    print("Starting Django application...")
    
    # Get port from environment
    port = os.environ.get('PORT', '8000')
    
    # Run migrations
    print("Running migrations...")
    subprocess.run([sys.executable, 'manage.py', 'migrate'], check=True)
    
    # Collect static files
    print("Collecting static files...")
    subprocess.run([sys.executable, 'manage.py', 'collectstatic', '--noinput'], check=True)
    
    # Start server
    print(f"Starting server on port {port}...")
    subprocess.run([sys.executable, 'manage.py', 'runserver', f'0.0.0.0:{port}'], check=True)

if __name__ == '__main__':
    main()
