@echo off
echo ===============================
echo     Iniciando eSIM Pro
echo ===============================
echo.

echo 🔧 Verificando entorno...
python check_environment.py
if %errorlevel% neq 0 (
    echo ❌ Error en la verificacion del entorno
    pause
    exit /b 1
)

echo.
echo 🚀 Iniciando servidores...

echo Iniciando Backend Django...
cd /d "c:\Users\nayel\Esim\backend"
start "Django Server" cmd /k "C:/Users/nayel/Esim/.venv/Scripts/python.exe manage.py runserver"

timeout /t 3

echo Iniciando Frontend con Python...
cd /d "c:\Users\nayel\Esim"
start "Frontend Server" cmd /k "C:/Users/nayel/Esim/.venv/Scripts/python.exe serve_frontend.py"

timeout /t 5

echo.
echo ===============================
echo   Servidores iniciados!
echo   Backend: http://localhost:8000
echo   Frontend: http://localhost:3000
echo ===============================
echo.
echo Presiona cualquier tecla para continuar...
pause
