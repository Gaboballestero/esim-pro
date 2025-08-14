@echo off
title eSIM App - Configuración Automática con ngrok
color 0A

echo.
echo 🚀 eSIM App - Configuración Automática
echo =======================================
echo.

:: Verificar directorio
if not exist "backend\manage.py" (
    echo ❌ Error: Ejecuta desde el directorio raíz del proyecto
    echo 📂 Directorio esperado: C:\Users\nayel\Esim
    pause
    exit /b 1
)

echo 🔍 Verificando ngrok...

:: Verificar si ngrok existe
if exist "ngrok.exe" (
    echo ✅ ngrok encontrado
    goto start_services
)

echo 📥 Descargando ngrok...

:: Descargar ngrok usando PowerShell
powershell -Command "& {Invoke-WebRequest -Uri 'https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip' -OutFile 'ngrok.zip'}"

if not exist "ngrok.zip" (
    echo ❌ Error al descargar ngrok
    echo 📝 Descarga manual desde: https://ngrok.com/download
    pause
    exit /b 1
)

echo 📦 Extrayendo ngrok...
powershell -Command "& {Expand-Archive -Path 'ngrok.zip' -DestinationPath '.' -Force}"
del ngrok.zip

if not exist "ngrok.exe" (
    echo ❌ Error al extraer ngrok
    pause
    exit /b 1
)

:start_services
echo.
echo 🔧 Iniciando servicios...

:: Matar procesos previos de Django
echo 🛑 Deteniendo Django previo...
taskkill /f /im python.exe >nul 2>&1

:: Iniciar Django
echo 🔥 Iniciando Django...
cd backend
start "Django Server" cmd /c "python manage.py runserver 0.0.0.0:8000"

:: Esperar que Django se inicie
echo ⏳ Esperando Django...
timeout /t 5 /nobreak >nul

:: Volver al directorio raíz
cd ..

:: Iniciar ngrok
echo 🌐 Iniciando túnel ngrok...
start "Ngrok Tunnel" cmd /k "echo Copiando URL HTTPS... && ngrok.exe http 8000"

echo.
echo ✅ ¡Servicios iniciados!
echo.
echo 📋 PASOS IMPORTANTES:
echo.
echo 1. 🔗 Ve a la ventana de 'Ngrok Tunnel'
echo 2. 📋 Copia la URL HTTPS (ej: https://abc123.ngrok.io)
echo 3. 🔧 Ejecuta: cd mobile\Esim && setup-tunnel.bat [URL-HTTPS]
echo 4. 📱 Reinicia Expo Go en tu iPhone
echo 5. ✅ Prueba el registro desde la app
echo.
echo ⚠️  IMPORTANTE: Usa la URL HTTPS, no HTTP
echo.
pause
