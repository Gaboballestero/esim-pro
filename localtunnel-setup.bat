@echo off
title eSIM App - Configuración con LocalTunnel
color 0A

echo.
echo 🚀 eSIM App - Configuración con LocalTunnel
echo ===========================================
echo.

:: Verificar directorio
if not exist "backend\manage.py" (
    echo ❌ Error: Ejecuta desde el directorio raíz del proyecto
    pause
    exit /b 1
)

:: Verificar Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js no encontrado. Instálalo desde https://nodejs.org
    pause
    exit /b 1
)

echo 📦 Instalando localtunnel...
npm install -g localtunnel

if %errorlevel% neq 0 (
    echo ❌ Error instalando localtunnel
    pause
    exit /b 1
)

echo.
echo 🔧 Iniciando servicios...

:: Matar procesos previos
taskkill /f /im python.exe >nul 2>&1
taskkill /f /im node.exe >nul 2>&1

:: Iniciar Django
echo 🔥 Iniciando Django...
cd backend
start "Django Server" cmd /c "python manage.py runserver 0.0.0.0:8000"

:: Esperar Django
echo ⏳ Esperando Django...
timeout /t 5 /nobreak >nul

:: Volver al directorio raíz
cd ..

:: Iniciar localtunnel
echo 🌐 Iniciando túnel HTTPS...
start "LocalTunnel" cmd /k "echo Creando túnel... && lt --port 8000 --subdomain esim-dev-2025"

echo.
echo ✅ ¡Servicios iniciados!
echo.
echo 📋 PASOS IMPORTANTES:
echo.
echo 1. 🔗 Ve a la ventana 'LocalTunnel'
echo 2. 📋 Copia la URL HTTPS (ej: https://esim-dev-2025.loca.lt)
echo 3. 🔧 Ejecuta: cd mobile\Esim && setup-tunnel.bat [URL-HTTPS]
echo 4. 📱 Reinicia Expo Go
echo 5. ✅ Prueba el registro
echo.
echo ⚠️  Si el subdominio está ocupado, cambiará automáticamente
echo.
pause
