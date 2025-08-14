@echo off
title eSIM App - Desarrollo Local Fácil
color 0A

echo.
echo 🚀 eSIM App - Desarrollo Local (Sin complicaciones)
echo ===============================================
echo.

:: Verificar directorio
if not exist "backend\manage.py" (
    echo ❌ Error: Ejecuta desde C:\Users\nayel\Esim
    pause
    exit /b 1
)

echo 🔧 Iniciando servicios locales...

:: Detener procesos previos
taskkill /f /im python.exe >nul 2>&1
taskkill /f /im node.exe >nul 2>&1

:: Iniciar Django
echo 🔥 Iniciando Django backend...
cd backend
start "Django Backend" cmd /k "echo ✅ Django ejecutándose en http://localhost:8000 && python manage.py runserver 0.0.0.0:8000"

:: Esperar Django
timeout /t 3 /nobreak >nul

:: Iniciar Expo
echo 📱 Iniciando Expo desarrollo...
cd ..\mobile\Esim
start "Expo Dev" cmd /k "echo ✅ Abriendo Expo... && npx expo start"

echo.
echo ✅ ¡Todo iniciado!
echo.
echo 📋 Opciones disponibles:
echo.
echo 🌐 NAVEGADOR WEB (MÁS FÁCIL):
echo    1. En la ventana de Expo, presiona 'w' para abrir en navegador
echo    2. Tu app se abrirá en http://localhost:19006
echo    3. ¡No necesitas teléfono ni túneles!
echo.
echo 📱 ANDROID EMULATOR:
echo    1. Abre Android Studio
echo    2. Inicia un emulador Android
echo    3. En Expo, presiona 'a' para Android
echo.
echo 📲 TELÉFONO FÍSICO:
echo    1. Instala Expo Go en tu teléfono
echo    2. Escanea el QR code de Expo
echo.
echo 💡 Recomendación: Usa la opción WEB para desarrollo rápido
echo.
pause
