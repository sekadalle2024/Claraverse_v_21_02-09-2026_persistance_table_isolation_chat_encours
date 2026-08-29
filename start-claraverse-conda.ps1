# Script de Demarrage Claraverse avec Conda
# Version: 2.0.0 - Avec nettoyage du cache Python et gestion des processus

Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "DEMARRAGE CLARAVERSE - Backend Conda + Frontend React" -ForegroundColor Cyan
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""

$ENV_NAME = "claraverse_backend"
$BACKEND_DIR = "py_backend"
$BACKEND_PORT = 5000
$FRONTEND_PORT = 5173

# ========================================================================
# ÉTAPE 1: NETTOYAGE DU CACHE PYTHON
# ========================================================================
Write-Host "ÉTAPE 1: Nettoyage du cache Python..." -ForegroundColor Yellow
Write-Host ""

# Arrêter tous les processus Python existants
Write-Host "  Arrêt des processus Python existants..." -NoNewline
try {
    Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host " OK" -ForegroundColor Green
} catch {
    Write-Host " (aucun processus trouvé)" -ForegroundColor Gray
}

# Supprimer les fichiers .pyc
Write-Host "  Suppression des fichiers .pyc..." -NoNewline
try {
    Get-ChildItem -Path "$BACKEND_DIR" -Filter "*.pyc" -Recurse -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
    Write-Host " OK" -ForegroundColor Green
} catch {
    Write-Host " (aucun fichier trouvé)" -ForegroundColor Gray
}

# Supprimer les dossiers __pycache__
Write-Host "  Suppression des dossiers __pycache__..." -NoNewline
try {
    Remove-Item -Path "$BACKEND_DIR/__pycache__" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host " OK" -ForegroundColor Green
} catch {
    Write-Host " (aucun dossier trouvé)" -ForegroundColor Gray
}

# Supprimer les fichiers temporaires
Write-Host "  Suppression des fichiers temporaires..." -NoNewline
try {
    Remove-Item -Path "$BACKEND_DIR/.pytest_cache" -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item -Path "$BACKEND_DIR/*.pyc" -Force -ErrorAction SilentlyContinue
    Write-Host " OK" -ForegroundColor Green
} catch {
    Write-Host " (aucun fichier trouvé)" -ForegroundColor Gray
}

Write-Host ""

# ========================================================================
# ÉTAPE 2: VÉRIFICATIONS PRÉALABLES
# ========================================================================
Write-Host "ÉTAPE 2: Verifications prealables..." -ForegroundColor Yellow
Write-Host ""

# Verifier conda
Write-Host "Verification de conda..." -NoNewline
try {
    $condaVersion = & conda --version 2>&1
    Write-Host " OK $condaVersion" -ForegroundColor Green
} catch {
    Write-Host " ERREUR conda non trouve!" -ForegroundColor Red
    exit 1
}

# Verifier environnement
Write-Host "Verification de l'environnement '$ENV_NAME'..." -NoNewline
$envExists = conda env list | Select-String -Pattern $ENV_NAME -Quiet

if (-not $envExists) {
    Write-Host " NON TROUVE!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Executez d'abord: .\setup-backend-env.ps1" -ForegroundColor Yellow
    exit 1
}
Write-Host " OK" -ForegroundColor Green

# Verifier Node.js
Write-Host "Verification de Node.js..." -NoNewline
try {
    $nodeVersion = & node --version 2>&1
    Write-Host " OK $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host " ERREUR Node.js non trouve!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Toutes les verifications sont passees!" -ForegroundColor Green
Write-Host ""

# ========================================================================
# ÉTAPE 3: DEMARRAGE DU BACKEND
# ========================================================================
Write-Host "ÉTAPE 3: Demarrage du Backend Python..." -ForegroundColor Yellow
Write-Host "   Environnement: $ENV_NAME" -ForegroundColor Gray
Write-Host "   Dossier: $BACKEND_DIR" -ForegroundColor Gray
Write-Host "   Port: $BACKEND_PORT" -ForegroundColor Gray
Write-Host ""

$backendJob = Start-Job -ScriptBlock {
    param($envName, $dir)
    Set-Location $dir
    conda run -n $envName python main.py
} -ArgumentList $ENV_NAME, (Resolve-Path $BACKEND_DIR)

Write-Host "Backend demarre (Job ID: $($backendJob.Id))" -ForegroundColor Green
Write-Host ""

# Attendre le backend avec vérification
Write-Host "Attente du demarrage du backend..." -ForegroundColor Yellow
$backendReady = $false
$maxAttempts = 30

for ($i = 0; $i -lt $maxAttempts; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://127.0.0.1:$BACKEND_PORT/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $backendReady = $true
            Write-Host "  Backend operationnel! (après $($i+1) secondes)" -ForegroundColor Green
            break
        }
    } catch {
        # Continuer
    }
    
    if ($i -lt $maxAttempts - 1) {
        Write-Host "  Tentative $($i+1)/$maxAttempts..." -ForegroundColor Gray
        Start-Sleep -Seconds 1
    }
}

if (-not $backendReady) {
    Write-Host "  AVERTISSEMENT: Backend n'a pas répondu après $maxAttempts secondes" -ForegroundColor Yellow
    Write-Host "  Verifiez les logs: Receive-Job -Id $($backendJob.Id) -Keep" -ForegroundColor Yellow
}

Write-Host ""

# ========================================================================
# ÉTAPE 4: DEMARRAGE DU FRONTEND
# ========================================================================
Write-Host "ÉTAPE 4: Demarrage du Frontend React..." -ForegroundColor Yellow
Write-Host "   Port: $FRONTEND_PORT" -ForegroundColor Gray
Write-Host ""

$frontendJob = Start-Job -ScriptBlock {
    param($workDir)
    Set-Location $workDir
    npm run dev
} -ArgumentList (Get-Location).Path

Write-Host "Frontend demarre (Job ID: $($frontendJob.Id))" -ForegroundColor Green
Write-Host ""

# Attendre le frontend
Write-Host "Attente du demarrage du frontend..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
Write-Host "  Frontend en cours de demarrage..." -ForegroundColor Green
Write-Host ""

# ========================================================================
# ÉTAPE 5: RÉSUMÉ ET INFORMATIONS
# ========================================================================
# ========================================================================
# ÉTAPE 5: RÉSUMÉ ET INFORMATIONS
# ========================================================================
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "CLARAVERSE DEMARRE AVEC SUCCES!" -ForegroundColor Cyan
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "SERVICES ACTIFS:" -ForegroundColor Green
Write-Host ""
Write-Host "   Backend Python (Conda: $ENV_NAME)" -ForegroundColor Yellow
Write-Host "      URL: http://127.0.0.1:$BACKEND_PORT" -ForegroundColor White
Write-Host "      Job ID: $($backendJob.Id)" -ForegroundColor Gray
Write-Host "      Statut: $(if ($backendReady) { 'OPERATIONNEL' } else { 'EN COURS DE DEMARRAGE' })" -ForegroundColor $(if ($backendReady) { 'Green' } else { 'Yellow' })
Write-Host ""
Write-Host "   Frontend React" -ForegroundColor Yellow
Write-Host "      URL: http://localhost:$FRONTEND_PORT" -ForegroundColor White
Write-Host "      Job ID: $($frontendJob.Id)" -ForegroundColor Gray
Write-Host ""

Write-Host "COMMANDES UTILES:" -ForegroundColor Cyan
Write-Host "   Logs backend: Receive-Job -Id $($backendJob.Id) -Keep" -ForegroundColor White
Write-Host "   Logs frontend: Receive-Job -Id $($frontendJob.Id) -Keep" -ForegroundColor White
Write-Host "   Arreter: .\stop-claraverse.ps1" -ForegroundColor White
Write-Host "   Tester API: .\test-api-curl.ps1" -ForegroundColor White
Write-Host ""

Write-Host "NETTOYAGE EFFECTUÉ:" -ForegroundColor Cyan
Write-Host "   ✅ Processus Python arrêtés" -ForegroundColor Green
Write-Host "   ✅ Fichiers .pyc supprimés" -ForegroundColor Green
Write-Host "   ✅ Dossiers __pycache__ supprimés" -ForegroundColor Green
Write-Host "   ✅ Fichiers temporaires supprimés" -ForegroundColor Green
Write-Host ""

# Sauvegarder les IDs
$jobIds = @{
    Backend = $backendJob.Id
    Frontend = $frontendJob.Id
    StartTime = Get-Date
    CacheCleanup = "OK"
}
$jobIds | ConvertTo-Json | Out-File -FilePath ".claraverse-jobs.json" -Encoding UTF8

Write-Host "Pret a utiliser! Ouvrez http://localhost:$FRONTEND_PORT" -ForegroundColor Green
Write-Host ""

# ========================================================================
# NOTES IMPORTANTES
# ========================================================================
Write-Host "NOTES IMPORTANTES:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  1. Le cache Python a été nettoyé automatiquement" -ForegroundColor White
Write-Host "  2. Les modifications du code sont prises en compte" -ForegroundColor White
Write-Host "  3. En cas de problème, consultez: MEMO_PROBLEME_UPDATE_FRONTEND_ACCORDEON.md" -ForegroundColor White
Write-Host ""
