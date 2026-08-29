# Script de Demarrage Claraverse - Backend + Frontend
# Version: 2.0.0 - Avec support Conda

Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "DEMARRAGE CLARAVERSE - Backend Python + Frontend React" -ForegroundColor Cyan
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$ENV_NAME = "claraverse_backend"
$BACKEND_DIR = "py_backend"
$BACKEND_PORT = 5000
$FRONTEND_PORT = 5173
$USE_CONDA = $false

# Verifications
Write-Host "Verifications prealables..." -ForegroundColor Yellow
Write-Host ""

# Verifier conda
Write-Host "Verification de conda..." -NoNewline
try {
    $condaVersion = & conda --version 2>&1
    Write-Host " OK $condaVersion" -ForegroundColor Green
    
    # Verifier si l'environnement conda existe
    $envExists = conda env list | Select-String -Pattern $ENV_NAME -Quiet
    if ($envExists) {
        Write-Host "Environnement conda '$ENV_NAME' detecte - Utilisation de conda" -ForegroundColor Green
        $USE_CONDA = $true
    } else {
        Write-Host "Environnement conda '$ENV_NAME' non trouve - Utilisation de Python systeme" -ForegroundColor Yellow
    }
} catch {
    Write-Host " Non installe - Utilisation de Python systeme" -ForegroundColor Yellow
}

# Verifier Python (si pas conda)
if (-not $USE_CONDA) {
    Write-Host "Verification de Python..." -NoNewline
    try {
        $pythonVersion = & python --version 2>&1
        Write-Host " OK $pythonVersion" -ForegroundColor Green
    } catch {
        Write-Host " ERREUR Python non trouve!" -ForegroundColor Red
        Write-Host ""
        Write-Host "Installez Python ou creez l'environnement conda:" -ForegroundColor Yellow
        Write-Host "   .\setup-backend-env.ps1" -ForegroundColor White
        exit 1
    }
}

# Verifier Node.js
Write-Host "Verification de Node.js..." -NoNewline
try {
    $nodeVersion = & node --version 2>&1
    Write-Host " OK $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host " ERREUR Node.js non trouve!" -ForegroundColor Red
    exit 1
}

# Verifier npm
Write-Host "Verification de npm..." -NoNewline
try {
    $npmVersion = & npm --version 2>&1
    Write-Host " OK v$npmVersion" -ForegroundColor Green
} catch {
    Write-Host " ERREUR npm non trouve!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Toutes les verifications sont passees!" -ForegroundColor Green
Write-Host ""

# Demarrage Backend
if ($USE_CONDA) {
    Write-Host "Demarrage du Backend Python (conda env: $ENV_NAME)..." -ForegroundColor Yellow
} else {
    Write-Host "Demarrage du Backend Python..." -ForegroundColor Yellow
}
Write-Host "   Dossier: $BACKEND_DIR" -ForegroundColor Gray
Write-Host "   Port: $BACKEND_PORT" -ForegroundColor Gray
Write-Host ""

if ($USE_CONDA) {
    $backendJob = Start-Job -ScriptBlock {
        param($envName, $dir)
        Set-Location $dir
        & conda run -n $envName python main.py
    } -ArgumentList $ENV_NAME, (Resolve-Path $BACKEND_DIR)
} else {
    $backendJob = Start-Job -ScriptBlock {
        param($dir)
        Set-Location $dir
        & python main.py
    } -ArgumentList (Resolve-Path $BACKEND_DIR)
}

Write-Host "Backend demarre (Job ID: $($backendJob.Id))" -ForegroundColor Green
Write-Host ""

# Attendre le backend
Write-Host "Attente du demarrage du backend (10 secondes)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Verifier le backend
Write-Host "Verification du backend..." -NoNewline
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:$BACKEND_PORT/health" -TimeoutSec 5 -ErrorAction Stop
    Write-Host " Backend operationnel!" -ForegroundColor Green
} catch {
    Write-Host " Backend en cours de demarrage..." -ForegroundColor Yellow
}

Write-Host ""

# Demarrage Frontend
Write-Host "Demarrage du Frontend React..." -ForegroundColor Yellow
Write-Host "   Port: $FRONTEND_PORT" -ForegroundColor Gray
Write-Host ""

$frontendJob = Start-Job -ScriptBlock {
    param($workDir)
    Set-Location $workDir
    npm run dev
} -ArgumentList (Get-Location).Path

Write-Host "Frontend demarre (Job ID: $($frontendJob.Id))" -ForegroundColor Green
Write-Host ""

# Informations
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "CLARAVERSE DEMARRE AVEC SUCCES!" -ForegroundColor Cyan
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "SERVICES ACTIFS:" -ForegroundColor Green
Write-Host ""
if ($USE_CONDA) {
    Write-Host "   Backend Python (Conda: $ENV_NAME)" -ForegroundColor Yellow
} else {
    Write-Host "   Backend Python" -ForegroundColor Yellow
}
Write-Host "      URL: http://127.0.0.1:$BACKEND_PORT" -ForegroundColor White
Write-Host "      Job ID: $($backendJob.Id)" -ForegroundColor Gray
Write-Host ""
Write-Host "   Frontend React" -ForegroundColor Yellow
Write-Host "      URL: http://localhost:$FRONTEND_PORT" -ForegroundColor White
Write-Host "      Job ID: $($frontendJob.Id)" -ForegroundColor Gray
Write-Host ""

Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "COMMANDES UTILES" -ForegroundColor Cyan
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Voir les logs du backend:" -ForegroundColor Yellow
Write-Host "   Receive-Job -Id $($backendJob.Id) -Keep" -ForegroundColor White
Write-Host ""
Write-Host "   Voir les logs du frontend:" -ForegroundColor Yellow
Write-Host "   Receive-Job -Id $($frontendJob.Id) -Keep" -ForegroundColor White
Write-Host ""
Write-Host "   Arreter les services:" -ForegroundColor Yellow
Write-Host "   .\stop-claraverse.ps1" -ForegroundColor White
Write-Host ""

Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "TESTER LEAD BALANCE" -ForegroundColor Cyan
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "   1. Ouvrir http://localhost:$FRONTEND_PORT" -ForegroundColor White
Write-Host "   2. Dans le chat, taper: Lead_balance" -ForegroundColor White
Write-Host "   3. Le dialogue s'ouvre automatiquement" -ForegroundColor White
Write-Host "   4. Selectionner votre fichier Excel" -ForegroundColor White
Write-Host "   5. Les resultats s'affichent automatiquement" -ForegroundColor White
Write-Host ""

# Sauvegarder les IDs des jobs
$jobIds = @{
    Backend = $backendJob.Id
    Frontend = $frontendJob.Id
}
$jobIds | ConvertTo-Json | Out-File -FilePath ".claraverse-jobs.json" -Encoding UTF8

Write-Host "IDs des jobs sauvegardes" -ForegroundColor Green
Write-Host ""
Write-Host "Pret a utiliser! Bonne session de developpement!" -ForegroundColor Green
Write-Host ""
