@echo off
cls
echo ===============================
echo     eSIM Pro - Inicio Rapido
echo ===============================
echo.

echo Verificando entorno...
C:\Users\nayel\Esim\.venv\Scripts\python.exe -c "import django; print('✅ Django', django.get_version(), 'listo')"

echo.
echo 🚀 Iniciando Backend Django (Puerto 8000)...
cd /d "C:\Users\nayel\Esim\backend"
start "eSIM Backend" cmd /c "title eSIM Backend - Django & C:\Users\nayel\Esim\.venv\Scripts\python.exe manage.py runserver & pause"

echo.
echo ⏳ Esperando 5 segundos...
timeout /t 5 /nobreak >nul

echo.
echo 🌐 Iniciando Frontend (Puerto 3000)...
cd /d "C:\Users\nayel\Esim"
start "eSIM Frontend" cmd /c "title eSIM Frontend - Python Server & C:\Users\nayel\Esim\.venv\Scripts\python.exe serve_frontend.py & pause"

echo.
echo ===============================
echo ✅ SERVIDORES INICIADOS
echo.
echo 🔙 Backend:  http://localhost:8000
echo 🖥️  Frontend: http://localhost:3000
echo.
echo Ambos servidores se abren en ventanas separadas
echo.
echo 📱 ¿Quieres iniciar la app móvil también?
echo    1. Sí, iniciar app móvil
echo    2. No, solo web
echo.
set /p choice="Elige una opción (1 o 2): "

if "%choice%"=="1" (
    echo.
    echo 📱 Iniciando configuración móvil...
    cd /d "C:\Users\nayel\Esim\mobile"
    call setup-mobile.bat
)

echo.
echo Cierra este terminal cuando termines
echo ===============================
echo.
pause
