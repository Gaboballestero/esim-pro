@echo off
title eSIM App - Configuración para Android Emulator
color 0A

echo.
echo 📱 eSIM App - Configuración Android Emulator
echo ===========================================
echo.

echo 🔍 Verificando Android SDK...

:: Verificar si Android SDK está instalado
if exist "%LOCALAPPDATA%\Android\Sdk\emulator\emulator.exe" (
    echo ✅ Android SDK encontrado
    goto check_avd
)

if exist "%ANDROID_HOME%\emulator\emulator.exe" (
    echo ✅ Android SDK encontrado en ANDROID_HOME
    goto check_avd
)

echo ❌ Android SDK no encontrado
echo.
echo 📋 Para instalar Android SDK:
echo    1. Descarga Android Studio: https://developer.android.com/studio
echo    2. Instala Android Studio
echo    3. Abre Android Studio y ve a Tools ^> SDK Manager
echo    4. Instala Android SDK y crea un AVD (Android Virtual Device)
echo.
echo 💡 Alternativamente, puedes usar Expo Go web en tu navegador
echo.
pause
exit /b 1

:check_avd
echo.
echo 📋 Instrucciones para usar Android Emulator:
echo.
echo 1. 🚀 Abre Android Studio
echo 2. 📱 Ve a Tools ^> AVD Manager
echo 3. ✨ Crea un nuevo AVD si no tienes uno
echo 4. ▶️  Inicia el emulador
echo 5. 🔧 Vuelve aquí y presiona cualquier tecla
echo.
pause

echo.
echo 🔧 Configurando para Android Emulator...

:: Android Emulator usa 10.0.2.2 para acceder al host
echo 📝 Configurando URL para Android Emulator...

echo.
echo ✅ Configuración lista para Android Emulator
echo.
echo 📋 Próximos pasos:
echo    1. 🔥 Ejecuta Django: python manage.py runserver 0.0.0.0:8000
echo    2. 📱 Abre tu emulador Android
echo    3. 💫 Ejecuta: npx expo start en mobile/Esim
echo    4. 📲 Selecciona "Run on Android device/emulator"
echo.
pause
