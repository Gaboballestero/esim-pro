#!/usr/bin/env python
import os
import subprocess
import sys

def main():
    """Start the Django application"""
    print("Starting Django application...")
    
    # Get port from environment
    port = os.environ.get('PORT', '8000')
    
    try:
        # Run migrations
        print("Running migrations...")
        subprocess.run([sys.executable, 'manage.py', 'migrate'], check=True)
        
        # Collect static files (skip if fails)
        print("Collecting static files...")
        try:
            subprocess.run([sys.executable, 'manage.py', 'collectstatic', '--noinput'], check=True)
        except:
            print("Static files collection skipped")
        
        # Start server
        print(f"Starting server on port {port}...")
        subprocess.run([sys.executable, 'manage.py', 'runserver', f'0.0.0.0:{port}'], check=True)
        
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
