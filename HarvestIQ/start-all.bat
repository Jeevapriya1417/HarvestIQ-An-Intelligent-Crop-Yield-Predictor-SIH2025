@echo off
setlocal

REM Set the root directory to the location of the script
set "ROOT_DIR=%~dp0"

echo Starting HarvestIQ Application...

echo.
echo 1. Starting Python ML API Service ^(Port 8000^)
echo ==========================================
start "Python ML API" cmd /k "cd /d "%ROOT_DIR%" && python ""Py model\harvest_api.py"""

timeout /t 5 /nobreak >nul

echo.
echo 2. Starting Backend API Server ^(Port 5000^)
echo ========================================
start "Backend API" cmd /k "cd /d "%ROOT_DIR%backend" && node server.js"

timeout /t 5 /nobreak >nul

echo.
echo 3. Starting Frontend Development Server ^(Port 5173^)
echo ================================================
start "Frontend" cmd /k "cd /d "%ROOT_DIR%" && npm run dev"

echo.
echo All services started!
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:5000
echo Python ML API: http://localhost:8000
echo.
endlocal
pause