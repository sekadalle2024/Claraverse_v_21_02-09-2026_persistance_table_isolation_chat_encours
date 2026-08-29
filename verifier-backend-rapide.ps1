# Script de vérification rapide du backend avant sauvegarde
# Date: 19 avril 2026

Write-Host ""
Write-Host "=== VÉRIFICATION RAPIDE BACKEND ===" -ForegroundColor Cyan
Write-Host ""

# 1. Dossier py_backend
Write-Host "[1] Dossier py_backend..." -ForegroundColor Yellow
if (Test-Path "py_backend") {
    $fileCount = (Get-ChildItem -Path "py_backend" -Recurse -File).Count
    Write-Host "    OK - $fileCount fichiers" -ForegroundColor Green
} else {
    Write-Host "    ERREUR - Non trouvé!" -ForegroundColor Red
    exit 1
}

# 2. État Git
Write-Host ""
Write-Host "[2] État Git..." -ForegroundColor Yellow
$gitStatus = git status py_backend/ --short
if ($gitStatus) {
    Write-Host "    Modifications détectées:" -ForegroundColor Yellow
    git status py_backend/ --short
} else {
    Write-Host "    OK - Aucune modification" -ForegroundColor Green
}

# 3. Remote actuel
Write-Host ""
Write-Host "[3] Remote Git..." -ForegroundColor Yellow
$currentRemote = git remote get-url origin
if ($currentRemote -match "Back-end-python") {
    Write-Host "    ATTENTION - Remote pointe vers backend!" -ForegroundColor Red
} else {
    Write-Host "    OK - Remote principal" -ForegroundColor Green
}

# 4. Branche
Write-Host ""
Write-Host "[4] Branche..." -ForegroundColor Yellow
$currentBranch = git branch --show-current
Write-Host "    Branche: $currentBranch" -ForegroundColor Cyan

# 5. Taille
Write-Host ""
Write-Host "[5] Taille..." -ForegroundColor Yellow
$size = (Get-ChildItem -Path "py_backend" -Recurse -File | Measure-Object -Property Length -Sum).Sum
$sizeMB = [math]::Round($size / 1MB, 2)
Write-Host "    Taille: $sizeMB MB" -ForegroundColor Cyan

# Résumé
Write-Host ""
Write-Host "=== RÉSUMÉ ===" -ForegroundColor Cyan
Write-Host "Fichiers: $fileCount" -ForegroundColor White
Write-Host "Taille: $sizeMB MB" -ForegroundColor White
Write-Host "Branche: $currentBranch" -ForegroundColor White
Write-Host ""

if ($gitStatus) {
    Write-Host "RECOMMANDATION: Commitez avant de pusher" -ForegroundColor Yellow
} else {
    Write-Host "PRÊT pour la sauvegarde!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Pour sauvegarder:" -ForegroundColor Cyan
Write-Host "  .\push-backend-github-v10.ps1" -ForegroundColor White
Write-Host ""
