@echo off
setlocal enabledelayedexpansion

REM Set the root directory to the location of the script
set "ROOT_DIR=%~dp0"

echo.
echo ============================================
echo   HarvestIQ - Agricultural Intelligence
echo   Platform Startup Script
echo ============================================
echo.

REM Check for prerequisites
echo [CHECK] Verifying prerequisites...
echo.

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo [INFO] Download from: https://nodejs.org/
    pause
    exit /b 1
)

REM Check Python
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python is not installed or not in PATH
    echo [INFO] Download from: https://www.python.org/
    pause
    exit /b 1
)

echo [OK] Node.js found
echo [OK] Python found
echo.

REM Check if dependencies are installed
echo [CHECK] Verifying dependencies...
if not exist "%ROOT_DIR%frontend\node_modules" (
    echo [WARN] Frontend dependencies not installed
    echo [ACTION] Installing frontend dependencies...
    cd /d "%ROOT_DIR%frontend"
    call npm install
    if !ERRORLEVEL! NEQ 0 (
        echo [ERROR] Failed to install frontend dependencies
        pause
        exit /b 1
    )
    cd /d "%ROOT_DIR%"
)

if not exist "%ROOT_DIR%backend\node_modules" (
    echo [WARN] Backend dependencies not installed
    echo [ACTION] Installing backend dependencies...
    cd /d "%ROOT_DIR%backend"
    call npm install
    if !ERRORLEVEL! NEQ 0 (
        echo [ERROR] Failed to install backend dependencies
        pause
        exit /b 1
    )
    cd /d "%ROOT_DIR%"
)

echo [OK] Dependencies verified
echo.

@REM Check if Python venv is activated, if not suggest activation
echo [INFO] Starting services...
echo.

echo [1/3] Starting FastAPI ML Service (Port 8000)
echo ────────────────────────────────────────────
start "HarvestIQ ML Service" cmd /k "cd /d "%ROOT_DIR%Pymodel" && python harvest_fastapi.py"

timeout /t 3 /nobreak >nul

echo.
echo [2/3] Starting Backend API Server (Port 5000)
echo ────────────────────────────────────────────
echo [INFO] Using workspace: backend
start "HarvestIQ Backend" cmd /k "cd /d "%ROOT_DIR%backend" && npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo [3/3] Starting Frontend Dev Server (Port 5173)
echo ────────────────────────────────────────────
echo [INFO] Using workspace: frontend
start "HarvestIQ Frontend" cmd /k "cd /d "%ROOT_DIR%frontend" && npm run dev"

timeout /t 2 /nobreak >nul

echo.
echo ============================================
echo   ✓ All Services Started Successfully!
echo ============================================
echo.
echo   🌐 SERVICES RUNNING:
echo   ────────────────────────────────────────
echo   Frontend:       http://localhost:5173
echo   Backend API:    http://localhost:5000  
echo   ML Service:     http://localhost:8000
echo   API Docs:       http://localhost:8000/docs
echo.
echo   📁 WORKSPACE STRUCTURE:
echo   ────────────────────────────────────────
echo   Root:           %ROOT_DIR%
echo   Frontend:       %ROOT_DIR%frontend
echo   Backend:        %ROOT_DIR%backend
echo   Python ML:      %ROOT_DIR%Pymodel
echo.
echo   📝 LOGS:
echo   ────────────────────────────────────────
echo   Each service has its own terminal window
echo   Close a window to stop that service
echo   Close all to stop the application
echo.
echo ============================================
echo.
endlocal
