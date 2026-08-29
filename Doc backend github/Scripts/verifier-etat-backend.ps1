# Script de verification de l'etat du backend avant push
# Date: 23 avril 2026
# Version: 1.1 (Correction syntaxe)

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "           VERIFICATION ETAT BACKEND PYTHON                     " -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verifier l'existence du dossier
Write-Host "1. Verification du dossier py_backend..." -ForegroundColor Yellow
if (Test-Path "py_backend") {
    Write-Host "   OK Dossier py_backend existe" -ForegroundColor Green
    
    # Compter les fichiers
    $fileCount = (Get-ChildItem -Path "py_backend" -Recurse -File).Count
    Write-Host "   INFO Nombre de fichiers: $fileCount" -ForegroundColor Cyan
} else {
    Write-Host "   ERROR Dossier py_backend non trouve!" -ForegroundColor Red
    exit 1
}

# 2. Etat Git du backend
Write-Host ""
Write-Host "2. Etat Git du backend..." -ForegroundColor Yellow
$gitStatus = git status py_backend/ --short

if ($gitStatus) {
    Write-Host "   WARN Modifications non commitees detectees:" -ForegroundColor Yellow
    git status py_backend/
} else {
    Write-Host "   OK Aucune modification non commitee" -ForegroundColor Green
}

# 3. Verifier le remote actuel
Write-Host ""
Write-Host "3. Remote Git actuel..." -ForegroundColor Yellow
$currentRemote = git remote get-url origin
Write-Host "   Remote: $currentRemote" -ForegroundColor Cyan

if ($currentRemote -match "Back-end-python") {
    Write-Host "   WARN ATTENTION: Remote pointe vers le repo backend!" -ForegroundColor Red
} else {
    Write-Host "   OK Remote correct (repo principal)" -ForegroundColor Green
}

# 4. Verifier la branche
Write-Host ""
Write-Host "4. Branche Git actuelle..." -ForegroundColor Yellow
$currentBranch = git branch --show-current
Write-Host "   Branche: $currentBranch" -ForegroundColor Cyan

# 5. Verifier la taille
Write-Host ""
Write-Host "5. Taille du dossier py_backend..." -ForegroundColor Yellow
$size = (Get-ChildItem -Path "py_backend" -Recurse -File | Measure-Object -Property Length -Sum).Sum
$sizeMB = [math]::Round($size / 1MB, 2)
Write-Host "   Taille totale: $sizeMB MB" -ForegroundColor Cyan

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "                      RESUME                                    " -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "Dossier       : py_backend/"
Write-Host "Fichiers      : $fileCount"
Write-Host "Taille        : $sizeMB MB"
Write-Host "Branche       : $currentBranch"
Write-Host "Remote        : $currentRemote"
Write-Host ""

if ($gitStatus) {
    Write-Host "RECOMMANDATION: Commitez les modifications avant de pusher" -ForegroundColor Yellow
} else {
    Write-Host "PRET pour le push vers GitHub" -ForegroundColor Green
}
Write-Host ""
