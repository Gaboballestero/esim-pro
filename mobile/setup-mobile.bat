@echo off
echo ===============================
echo   Inicializando App Movil eSIM Pro
echo ===============================
echo.

cd /d "C:\Users\nayel\Esim\mobile"

echo 📱 Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js no encontrado. Por favor instala Node.js desde https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js encontrado

echo.
echo 📦 Verificando dependencias...
if not exist "node_modules" (
    echo Instalando dependencias...
    echo Esto puede tomar varios minutos...
    npm install
    
    if %errorlevel% neq 0 (
        echo ❌ Error instalando dependencias
        echo Intentando con yarn...
        yarn install
        if %errorlevel% neq 0 (
            echo ❌ Error con yarn tambien. Revisa tu conexion a internet
            pause
            exit /b 1
        )
    )
    echo ✅ Dependencias instaladas correctamente
) else (
    echo ✅ Dependencias ya instaladas
)

echo.
echo � Instalando Expo CLI globalmente...
npm install -g @expo/cli >nul 2>&1

echo.
echo �🚀 Iniciando servidor de desarrollo...
echo.
echo ===============================
echo   App Movil Lista!
echo   
echo   Opciones:
echo   - Escanea el QR con Expo Go
echo   - Presiona 'a' para Android
echo   - Presiona 'i' para iOS  
echo   - Presiona 'w' para Web
echo   - Presiona 'r' para recargar
echo ===============================
echo.

echo Iniciando Expo...
start "Expo Server - eSIM Pro Mobile" cmd /k "title Expo - eSIM Pro Mobile & npx expo start"

echo.
echo ✅ Servidor iniciado en nueva ventana
echo 📱 Descarga Expo Go en tu telefono:
echo    - iOS: App Store
echo    - Android: Google Play
echo.
echo Cierra este terminal cuando termines
pause
