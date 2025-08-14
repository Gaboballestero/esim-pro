import requests
import sys

def test_backend_endpoints():
    """Test de endpoints del backend"""
    endpoints = [
        'http://localhost:8000/',
        'http://localhost:8000/api/',
        'http://localhost:8000/api/plans/',
        'http://localhost:8000/api/auth/',
    ]
    
    print("🔍 Testando endpoints del backend...")
    
    for endpoint in endpoints:
        try:
            response = requests.get(endpoint, timeout=5)
            status = "✅" if response.status_code < 400 else "❌"
            print(f"{status} {endpoint} → {response.status_code}")
        except requests.exceptions.RequestException as e:
            print(f"❌ {endpoint} → Error: {e}")
    
    print("\n🔍 Testando conectividad desde frontend...")
    try:
        # Simular una petición desde el frontend
        headers = {
            'Origin': 'http://localhost:3000',
            'Content-Type': 'application/json'
        }
        response = requests.get('http://localhost:8000/api/plans/', headers=headers, timeout=5)
        status = "✅" if response.status_code < 400 else "❌"
        print(f"{status} CORS test → {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"❌ CORS test → Error: {e}")

if __name__ == "__main__":
    test_backend_endpoints()
