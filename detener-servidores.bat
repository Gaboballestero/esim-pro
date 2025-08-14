@echo off
echo ===============================
echo   Deteniendo eSIM Pro
echo ===============================
echo.

echo 🛑 Cerrando servidores de eSIM Pro...

taskkill /f /fi "WindowTitle eq eSIM Backend*" 2>nul
taskkill /f /fi "WindowTitle eq eSIM Frontend*" 2>nul

echo.
echo ✅ Servidores detenidos
echo.
pause
