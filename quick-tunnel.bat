@echo off
title eSIM App - Túnel Simple
color 0A

echo.
echo 🚀 eSIM App - Túnel Simple (Sin registro)
echo ========================================
echo.

:: Verificar si Django está ejecutándose
netstat -an | findstr ":8000" >nul
if %errorlevel% neq 0 (
    echo 🔧 Iniciando Django primero...
    cd backend
    start "Django Server" cmd /c "python manage.py runserver 0.0.0.0:8000"
    cd ..
    echo ⏳ Esperando Django...
    timeout /t 8 /nobreak >nul
)

echo 📦 Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js requerido. Descarga: https://nodejs.org
    pause
    exit /b 1
)

echo 🌐 Instalando y ejecutando localtunnel...
npx localtunnel --port 8000

pause
