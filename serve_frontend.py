#!/usr/bin/env python
"""
Simple HTTP server para servir el frontend de eSIM Pro
"""
import os
import sys
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path

class CustomHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(Path(__file__).parent / "frontend"), **kwargs)

def serve():
    port = 3000
    server_address = ('', port)
    
    # Cambiar al directorio frontend
    frontend_dir = Path(__file__).parent / "frontend"
    if not frontend_dir.exists():
        print(f"❌ Error: Directorio frontend no encontrado en {frontend_dir}")
        return
    
    httpd = HTTPServer(server_address, CustomHandler)
    print(f"🚀 Servidor frontend iniciado en http://localhost:{port}")
    print(f"📁 Sirviendo archivos desde: {frontend_dir}")
    print("✋ Presiona Ctrl+C para detener el servidor")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Servidor detenido")
        httpd.server_close()

if __name__ == "__main__":
    serve()
