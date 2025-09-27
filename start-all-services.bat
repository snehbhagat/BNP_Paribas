@echo off
echo Starting BNP Paribas Analytics Platform...
echo.

echo [1/3] Starting FastAPI ML Model Server...
start "FastAPI" cmd /k "cd /d D:\OneDrive\Desktop\BNP && uvicorn main:app --reload --port 8000"
timeout /t 5 /nobreak >nul

echo [2/3] Starting Node.js Backend Server...
start "Backend" cmd /k "cd /d D:\OneDrive\Desktop\BNP\backend && npm start"
timeout /t 3 /nobreak >nul

echo [3/3] Starting React Frontend Server...
start "Frontend" cmd /k "cd /d D:\OneDrive\Desktop\BNP\frontend && npm run dev"

echo.
echo ✅ All services are starting up...
echo.
echo 🚀 Application URLs:
echo    FastAPI (ML Models): http://127.0.0.1:8000
echo    Backend API:         http://localhost:5000  
echo    Frontend Dashboard:  http://localhost:5173
echo.
echo Wait 10-15 seconds for all services to fully load, then visit:
echo 👉 http://localhost:5173
echo.
pause