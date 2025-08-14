@echo off
title eSIM App - Servidor de Desarrollo
color 0A

echo.
echo 🚀 eSIM App - Iniciador Automático
echo ==================================
echo.

:: Verificar si estamos en el directorio correcto
if not exist "backend\manage.py" (
    echo ❌ Error: Ejecuta este script desde el directorio raíz del proyecto eSIM
    echo 📂 Directorio actual: %CD%
    echo 📂 Directorio esperado: C:\Users\nayel\Esim
    pause
    exit /b 1
)

echo 🔍 Verificando dependencias...

:: Verificar Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python no encontrado. Instala Python primero.
    pause
    exit /b 1
)

:: Verificar si ngrok está disponible
where ngrok >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  ngrok no encontrado. Descárgalo de https://ngrok.com/download
    echo 📝 Puedes continuar sin ngrok, pero será mejor tenerlo para iOS
    echo.
)

echo.
echo 🎯 Opciones de inicio:
echo.
echo [1] Django solo (puerto 8000)
echo [2] Django + ngrok (recomendado para móvil)
echo [3] Django puerto 8080 (alternativa)
echo [4] Solo mostrar IPs disponibles
echo.
set /p choice="Selecciona una opción (1-4): "

if "%choice%"=="1" goto start_django
if "%choice%"=="2" goto start_with_ngrok
if "%choice%"=="3" goto start_django_8080
if "%choice%"=="4" goto show_ips

echo ❌ Opción inválida
pause
exit /b 1

:show_ips
echo.
echo 🌐 Direcciones IP disponibles:
ipconfig | findstr /i "IPv4"
echo.
pause
exit /b 0

:start_django
echo.
echo 🔧 Iniciando Django en puerto 8000...
cd backend
python manage.py runserver 0.0.0.0:8000
goto end

:start_django_8080
echo.
echo 🔧 Iniciando Django en puerto 8080...
cd backend
python manage.py runserver 0.0.0.0:8080
goto end

:start_with_ngrok
where ngrok >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ngrok no está instalado. Usando solo Django...
    goto start_django
)

echo.
echo 🔧 Iniciando Django en puerto 8000...
cd backend
start "Django Server" cmd /k "python manage.py runserver 0.0.0.0:8000"

echo ⏳ Esperando que Django se inicie...
timeout /t 5 /nobreak

echo.
echo 🌐 Iniciando túnel ngrok...
start "Ngrok Tunnel" cmd /k "ngrok http 8000"

echo.
echo ✅ ¡Servicios iniciados!
echo.
echo 📋 Próximos pasos:
echo    1. Copia la URL HTTPS de ngrok (ej: https://abc123.ngrok.io)
echo    2. Ve al directorio mobile/Esim/
echo    3. Ejecuta: setup-tunnel.bat [URL-de-ngrok]
echo    4. Reinicia la app móvil
echo    5. Activa USE_REAL_API: true
echo.
pause
goto end

:end
echo.
echo 👋 ¡Hasta luego!
pause
