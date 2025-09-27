@echo off
echo Starting BNP Analytics Application...
echo.
echo Starting Backend Server...
start "Backend Server" cmd /k "cd backend && node server.js"
timeout /t 3
echo.
echo Starting Frontend Development Server...
start "Frontend Server" cmd /k "cd frontend && npm run dev"
echo.
echo Both servers are starting up...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
pause