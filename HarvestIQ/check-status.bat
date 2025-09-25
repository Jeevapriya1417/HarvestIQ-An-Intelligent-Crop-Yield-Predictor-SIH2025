@echo off
echo HarvestIQ Service Status Check
echo ==============================

echo.
echo 1. Checking Python ML API ^(Port 8000^)...
powershell -Command "try { $response = Invoke-WebRequest -Uri http://localhost:8000/health -Method GET; Write-Host '   Status: UP' -ForegroundColor Green; } catch { Write-Host '   Status: DOWN' -ForegroundColor Red; }"

echo.
echo 2. Checking Backend API ^(Port 5000^)...
powershell -Command "try { $response = Invoke-WebRequest -Uri http://localhost:5000/api/ai-models/types -Method GET; Write-Host '   Status: UP' -ForegroundColor Green; } catch { Write-Host '   Status: DOWN' -ForegroundColor Red; }"

echo.
echo 3. Checking Frontend ^(Port 5173^)...
powershell -Command "try { $response = Invoke-WebRequest -Uri http://localhost:5173 -Method GET; Write-Host '   Status: UP' -ForegroundColor Green; } catch { Write-Host '   Status: DOWN' -ForegroundColor Red; }"

echo.
echo Status check complete.
pause