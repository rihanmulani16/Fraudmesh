@echo off
title FraudMesh Production Console
echo ========================================================
echo   Starting FraudMesh Console (Production Mode)
echo ========================================================
echo.
echo Checking Python and Node dependencies...
cd /d "%~dp0api"
python -m uvicorn main:app --host 0.0.0.0 --port 8000
pause
