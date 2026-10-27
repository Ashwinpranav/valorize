@echo off
TITLE Valorize — AI-Powered Industrial Waste Exchange
echo =====================================================================
echo  Starting Valorize Platform (Unified Frontend + Backend Host)
echo =====================================================================
echo.

cd /d "%~dp0backend"
if exist ".\.venv\Scripts\python.exe" (
    echo [INFO] Using virtual environment Python...
    ".\.venv\Scripts\python.exe" -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
) else (
    echo [INFO] Virtual environment not found, attempting system python...
    python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
)

pause
