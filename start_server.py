#!/usr/bin/env python3
import os
import subprocess
import sys
import shutil

def find_python():
    """Find the Python executable"""
    # Try different Python commands in order of preference
    python_commands = ['python3', 'python', '/usr/local/bin/python3', '/usr/bin/python3']
    
    for cmd in python_commands:
        if shutil.which(cmd):
            print(f"Found Python at: {cmd}")
            return cmd
    
    # If nothing found, use sys.executable
    print(f"Using sys.executable: {sys.executable}")
    return sys.executable

def main():
    """Start the Django application"""
    print("Starting Django application...")
    
    # Find Python executable
    python_cmd = find_python()
    
    # Get port from environment
    port = os.environ.get('PORT', '8000')
    
    try:
        # Run migrations
        print("Running migrations...")
        result = subprocess.run([python_cmd, 'manage.py', 'migrate'], 
                              capture_output=True, text=True, timeout=300)
        if result.returncode != 0:
            print(f"Migration error: {result.stderr}")
        else:
            print("Migrations completed successfully")
        
        # Collect static files
        print("Collecting static files...")
        result = subprocess.run([python_cmd, 'manage.py', 'collectstatic', '--noinput'], 
                              capture_output=True, text=True, timeout=300)
        if result.returncode != 0:
            print(f"Collectstatic warning: {result.stderr}")
        else:
            print("Static files collected successfully")
        
        # Start server
        print(f"Starting server on port {port}...")
        subprocess.run([python_cmd, 'manage.py', 'runserver', f'0.0.0.0:{port}'])
        
    except Exception as e:
        print(f"Error: {e}")
        # Try with direct python command as fallback
        print("Trying fallback approach...")
        os.system(f'python3 manage.py migrate')
        os.system(f'python3 manage.py collectstatic --noinput')
        os.system(f'python3 manage.py runserver 0.0.0.0:{port}')

if __name__ == '__main__':
    main()
