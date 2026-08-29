#!/usr/bin/env pwsh
# Script de Push pour ClaraVerse V11 - 20 Avril 2026
# Gestion des gros fichiers (2.2 GB) avec configuration optimale

Write-Host "╔════════════════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                                                ║" -ForegroundColor Cyan
Write-Host "║              PUSH CLARAVERSE V11 - 20-04-2026 - DOCKER ZEABUR                ║" -ForegroundColor Cyan
Write-Host "║                                                                                ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Configuration Git optimale pour gros fichiers
Write-Host "Configuration Git optimale pour gros fichiers..." -ForegroundColor Yellow
git config core.compression 0
git config http.postBuffer 2147483647
git config http.lowSpeedTime 999999
git config http.lowSpeedLimit 0
git config http.maxRequestBuffer 536870912
Write-Host "✓ Configuration appliquée" -ForegroundColor Green
Write-Host ""

# Vérifier l'état Git
Write-Host "Vérification de l'état Git..." -ForegroundColor Yellow
$status = git status --porcelain
if ($status) {
    Write-Host "⚠ Fichiers non commités détectés" -ForegroundColor Yellow
    Write-Host "Ajout et commit..." -ForegroundColor Yellow
    git add .
    git commit -m "Sauvegarde ClaraVerse V11 - 20-04-2026 - Docker Zeabur"
} else {
    Write-Host "✓ Tous les fichiers sont commités" -ForegroundColor Green
}
Write-Host ""

# Vérifier le commit existant
Write-Host "Vérification du commit existant..." -ForegroundColor Yellow
$lastCommit = git log -1 --oneline
Write-Host "Dernier commit: $lastCommit" -ForegroundColor Cyan
Write-Host ""

# Vérifier le repository distant
Write-Host "Vérification du repository distant..." -ForegroundColor Yellow
git remote -v
Write-Host ""

# Fusion avec la branche distante
Write-Host "Fusion avec la branche distante..." -ForegroundColor Yellow
git fetch origin master 2>&1 | Out-Null
git merge origin/master --allow-unrelated-histories 2>&1 | Out-Null
git commit -m "Fusion avec origin/master - ClaraVerse V11" 2>&1 | Out-Null
Write-Host "✓ Fusion effectuée" -ForegroundColor Green
Write-Host ""

# Pousser vers GitHub avec retry
Write-Host "Début du push vers GitHub..." -ForegroundColor Yellow
Write-Host ""

$maxRetries = 3
$retryCount = 0
$success = $false

while ($retryCount -lt $maxRetries -and -not $success) {
    $retryCount++
    Write-Host "Push tentative $retryCount/$maxRetries..." -ForegroundColor Yellow
    
    git push -u origin master 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Push réussi!" -ForegroundColor Green
        $success = $true
    } else {
        Write-Host "✗ Tentative $retryCount échouée" -ForegroundColor Red
        if ($retryCount -lt $maxRetries) {
            Write-Host "Attente de 15 secondes avant nouvelle tentative..." -ForegroundColor Yellow
            Start-Sleep -Seconds 15
        }
    }
}

if (-not $success) {
    Write-Host "✗ ÉCHEC après $maxRetries tentatives" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                                                ║" -ForegroundColor Green
Write-Host "║                    ✓ PUSH RÉUSSI AVEC SUCCÈS                                  ║" -ForegroundColor Green
Write-Host "║                                                                                ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "Vérification finale..." -ForegroundColor Yellow
git status
Write-Host ""

Write-Host "Derniers commits:" -ForegroundColor Cyan
git log -3 --oneline
Write-Host ""

Write-Host "Repository GitHub:" -ForegroundColor Cyan
Write-Host "https://github.com/sekadalle2024/Claverse_windows__v_11_20-04-2026_V5_docker_zeabur.git" -ForegroundColor Green
Write-Host ""

Write-Host "✓ Sauvegarde réussie!" -ForegroundColor Green
