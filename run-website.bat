@echo off
echo Starting Islamic Study Tools Website...
echo.
cd "Islamic Study Tools Frontend"
echo Installing dependencies (if needed)...
call npm install
echo.
echo Starting development server...
call npm run dev
pause


