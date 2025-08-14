@echo off
echo.
echo 🚀 eSIM App - Configurador de Túnel
echo ================================
echo.

if "%1"=="" (
    echo ❌ Error: Proporciona la URL del túnel
    echo.
    echo 📝 Uso: setup-tunnel.bat https://abc123.ngrok.io
    echo.
    echo 💡 Ejemplos:
    echo    setup-tunnel.bat https://abc123.ngrok.io
    echo    setup-tunnel.bat https://def456.ngrok-free.app
    echo.
    pause
    exit /b 1
)

:: Validar que sea HTTPS
echo %1 | findstr /i "https://" >nul
if %errorlevel% neq 0 (
    echo ❌ Error: Usa una URL HTTPS para iOS
    echo 📝 Ejemplo correcto: https://abc123.ngrok.io
    pause
    exit /b 1
)

echo 🔧 Actualizando configuración con túnel: %1
node update-tunnel.js %1

if %errorlevel% neq 0 (
    echo.
    echo ❌ Error al actualizar configuración
    pause
    exit /b 1
)

echo.
echo ✅ ¡Túnel configurado correctamente!
echo.
echo 📋 Configuración actualizada:
echo    🔗 Túnel: %1/api
echo    🔄 USE_REAL_API: true
echo.
echo 📱 Próximos pasos:
echo    1. ✅ Reinicia Expo Go en tu iPhone
echo    2. 🧪 Prueba registrarte desde la app
echo    3. 📊 Si funciona, verás logs en Django
echo.
echo ⚠️  Recuerda: Mantén ngrok ejecutándose
echo.
pause
