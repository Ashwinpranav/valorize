Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host " Starting Valorize Platform (Unified Frontend + Backend Host)        " -ForegroundColor Green
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host ""

$backendDir = Join-Path $PSScriptRoot "backend"
Set-Location $backendDir

$venvPython = Join-Path $backendDir ".venv\Scripts\python.exe"

if (Test-Path $venvPython) {
    Write-Host "[INFO] Starting FastAPI server on http://localhost:8000 ..." -ForegroundColor Yellow
    & $venvPython -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
} else {
    Write-Host "[INFO] Virtual environment not found, attempting python on PATH..." -ForegroundColor Yellow
    python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
}
