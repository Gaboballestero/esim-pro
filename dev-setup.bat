@echo off
title eSIM Development - Configuración Completa
color 0A

echo.
echo 🚀 eSIM Development - Configuración Paso a Paso
echo ===============================================
echo.

echo 📋 Este script te ayudará a conectar la app móvil con Django
echo.

echo 🔍 Verificando ngrok...
where ngrok >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ngrok no está instalado
    echo.
    echo 📥 Opciones para instalar ngrok:
    echo    1. Descarga: https://ngrok.com/download
    echo    2. Descomprime ngrok.exe en este directorio
    echo    3. Crea cuenta gratuita en https://dashboard.ngrok.com/signup
    echo    4. Ejecuta: ngrok config add-authtoken TU_TOKEN
    echo.
    echo 💡 O usa localtunnel: npm install -g localtunnel
    pause
    exit /b 1
)

echo ✅ ngrok encontrado
echo.

echo 🎯 Selecciona el modo de desarrollo:
echo.
echo [1] Solo Django (para pruebas locales)
echo [2] Django + ngrok (para móvil con HTTPS)
echo [3] Verificar configuración actual
echo [4] Limpiar y reiniciar todo
echo.
set /p choice="Opción (1-4): "

if "%choice%"=="1" goto django_only
if "%choice%"=="2" goto django_ngrok
if "%choice%"=="3" goto check_config
if "%choice%"=="4" goto clean_restart

echo ❌ Opción inválida
pause
exit /b 1

:django_only
echo.
echo 🔥 Iniciando solo Django...
cd backend
start "Django Server" cmd /k "echo ✅ Django en http://localhost:8000 && python manage.py runserver 0.0.0.0:8000"
echo ✅ Django iniciado en http://localhost:8000
goto end

:django_ngrok
echo.
echo 🔥 Iniciando Django...
cd backend
start "Django Server" cmd /k "python manage.py runserver 0.0.0.0:8000"
timeout /t 3 /nobreak >nul

echo 🌐 Iniciando túnel ngrok...
cd ..
start "Ngrok Tunnel" cmd /k "echo 📋 Copia la URL HTTPS de abajo && ngrok http 8000"

echo.
echo ✅ Servicios iniciados
echo.
echo 📋 PRÓXIMOS PASOS:
echo    1. 🔗 Copia la URL HTTPS de ngrok (ej: https://abc123.ngrok.io)
echo    2. 📱 Ejecuta: cd mobile\Esim && setup-tunnel.bat [URL-HTTPS]
echo    3. 🎯 Activa USE_REAL_API: true en app.ts
echo    4. 📲 Prueba en tu iPhone
goto end

:check_config
echo.
echo 🔍 Verificando configuración actual...
echo.
type mobile\Esim\src\config\app.ts | findstr "USE_REAL_API\|REAL_AUTH"
echo.
netstat -an | findstr ":8000" >nul
if %errorlevel% equ 0 (
    echo ✅ Django ejecutándose en puerto 8000
) else (
    echo ❌ Django no está ejecutándose
)
echo.
pause
goto end

:clean_restart
echo.
echo 🧹 Limpiando procesos...
taskkill /f /im python.exe >nul 2>&1
taskkill /f /im ngrok.exe >nul 2>&1
echo ✅ Procesos limpiados
echo 💡 Ejecuta el script otra vez para reiniciar
goto end

:end
echo.
pause
