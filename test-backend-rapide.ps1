# Test Rapide Backend - Vérification que le backend peut démarrer
# Version: 1.0.0

Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "TEST RAPIDE BACKEND CLARAVERSE" -ForegroundColor Cyan
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""

$ENV_NAME = "claraverse_backend"

Write-Host "Test 1: Vérification de l'environnement conda..." -NoNewline
$envExists = conda env list | Select-String -Pattern $ENV_NAME -Quiet

if ($envExists) {
    Write-Host " OK" -ForegroundColor Green
} else {
    Write-Host " ERREUR" -ForegroundColor Red
    Write-Host "L'environnement '$ENV_NAME' n'existe pas" -ForegroundColor Red
    exit 1
}

Write-Host "Test 2: Vérification de Python..." -NoNewline
$pythonVersion = conda run -n $ENV_NAME python --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host " OK ($pythonVersion)" -ForegroundColor Green
} else {
    Write-Host " ERREUR" -ForegroundColor Red
    exit 1
}

Write-Host "Test 3: Vérification des imports Python..." -NoNewline
$testScript = @"
import sys
try:
    import fastapi
    import pandas
    import openpyxl
    import PyPDF2
    print('OK')
    sys.exit(0)
except ImportError as e:
    print(f'ERREUR: {e}')
    sys.exit(1)
"@

$result = conda run -n $ENV_NAME python -c $testScript 2>&1
if ($LASTEXITCODE -eq 0 -and $result -match "OK") {
    Write-Host " OK" -ForegroundColor Green
} else {
    Write-Host " ERREUR" -ForegroundColor Red
    Write-Host "Détails: $result" -ForegroundColor Red
    exit 1
}

Write-Host "Test 4: Vérification du fichier main.py..." -NoNewline
if (Test-Path "py_backend/main.py") {
    Write-Host " OK" -ForegroundColor Green
} else {
    Write-Host " ERREUR" -ForegroundColor Red
    Write-Host "Le fichier py_backend/main.py n'existe pas" -ForegroundColor Red
    exit 1
}

Write-Host "Test 5: Vérification de la syntaxe de main.py..." -NoNewline
$syntaxCheck = conda run -n $ENV_NAME python -m py_compile py_backend/main.py 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host " OK" -ForegroundColor Green
} else {
    Write-Host " ERREUR" -ForegroundColor Red
    Write-Host "Détails: $syntaxCheck" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "TOUS LES TESTS SONT PASSES!" -ForegroundColor Cyan
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Le backend est prêt à être démarré." -ForegroundColor Green
Write-Host ""
Write-Host "Pour démarrer le backend:" -ForegroundColor Yellow
Write-Host "  .\start-claraverse-conda.ps1" -ForegroundColor White
Write-Host ""
