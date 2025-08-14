# eSIM Pro Mobile Setup Script
# PowerShell version for better compatibility

Write-Host "===============================" -ForegroundColor Cyan
Write-Host "  Inicializando App Movil eSIM Pro" -ForegroundColor Cyan  
Write-Host "===============================" -ForegroundColor Cyan
Write-Host ""

# Change to mobile directory
Set-Location "C:\Users\nayel\Esim\mobile"

# Check Node.js
Write-Host "📱 Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js no encontrado. Por favor instala Node.js desde https://nodejs.org/" -ForegroundColor Red
    Read-Host "Presiona Enter para continuar"
    exit 1
}

# Check if dependencies are installed
Write-Host ""
Write-Host "📦 Verificando dependencias..." -ForegroundColor Yellow

if (-not (Test-Path "node_modules")) {
    Write-Host "Instalando dependencias..." -ForegroundColor Yellow
    Write-Host "Esto puede tomar varios minutos..." -ForegroundColor Yellow
    
    try {
        npm install
        Write-Host "✅ Dependencias instaladas correctamente" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error instalando dependencias" -ForegroundColor Red
        Write-Host "Intentando con yarn..." -ForegroundColor Yellow
        try {
            yarn install
            Write-Host "✅ Dependencias instaladas con yarn" -ForegroundColor Green
        } catch {
            Write-Host "❌ Error con yarn también. Revisa tu conexión a internet" -ForegroundColor Red
            Read-Host "Presiona Enter para continuar"
            exit 1
        }
    }
} else {
    Write-Host "✅ Dependencias ya instaladas" -ForegroundColor Green
}

# Install Expo CLI globally
Write-Host ""
Write-Host "🔧 Verificando Expo CLI..." -ForegroundColor Yellow
try {
    npm install -g @expo/cli 2>$null
    Write-Host "✅ Expo CLI listo" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Advertencia: No se pudo instalar Expo CLI globalmente" -ForegroundColor Yellow
}

# Start Expo server
Write-Host ""
Write-Host "🚀 Iniciando servidor de desarrollo..." -ForegroundColor Yellow
Write-Host ""
Write-Host "===============================" -ForegroundColor Cyan
Write-Host "   App Movil Lista!" -ForegroundColor Green
Write-Host "" 
Write-Host "   Opciones:" -ForegroundColor White
Write-Host "   - Escanea el QR con Expo Go" -ForegroundColor White
Write-Host "   - Presiona 'a' para Android" -ForegroundColor White
Write-Host "   - Presiona 'i' para iOS" -ForegroundColor White
Write-Host "   - Presiona 'w' para Web" -ForegroundColor White
Write-Host "   - Presiona 'r' para recargar" -ForegroundColor White
Write-Host "===============================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Iniciando Expo..." -ForegroundColor Yellow

# Start Expo in a new window
Start-Process -FilePath "cmd.exe" -ArgumentList "/k", "title Expo - eSIM Pro Mobile && npx expo start"

Write-Host ""
Write-Host "✅ Servidor iniciado en nueva ventana" -ForegroundColor Green
Write-Host "📱 Descarga Expo Go en tu teléfono:" -ForegroundColor Yellow
Write-Host "    - iOS: App Store" -ForegroundColor White
Write-Host "    - Android: Google Play" -ForegroundColor White
Write-Host ""
Write-Host "Presiona cualquier tecla para continuar..." -ForegroundColor Yellow
Read-Host
