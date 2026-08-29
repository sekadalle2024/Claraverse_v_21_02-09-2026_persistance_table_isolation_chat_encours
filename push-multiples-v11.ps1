#!/usr/bin/env pwsh
# Push en commits multiples pour ClaraVerse V11 (2.2 GB)

Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  PUSH CLARAVERSE V11 - COMMITS MULTIPLES (2.2 GB)             ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Configuration Git
git config core.compression 0
git config http.postBuffer 1048576000
git config http.lowSpeedTime 999999
git config http.lowSpeedLimit 0

# Réinitialiser les commits locaux
Write-Host "Réinitialisation des commits locaux..." -ForegroundColor Yellow
git reset --soft HEAD~2

# Ajouter par parties
Write-Host "Ajout des fichiers par parties..." -ForegroundColor Yellow
Write-Host ""

# Partie 1: Code source
Write-Host "Partie 1: Code source (src/, public/, py_backend/)..." -ForegroundColor Cyan
git add src/ public/ py_backend/ 2>&1 | Out-Null
git commit -m "ClaraVerse V11 - Partie 1: Code source et backend" 2>&1 | Out-Null
Write-Host "✓ Commit 1 créé" -ForegroundColor Green

# Partie 2: Documentation et configuration
Write-Host "Partie 2: Documentation et configuration..." -ForegroundColor Cyan
git add Doc* *.md *.txt *.json *.yml *.yaml *.toml *.config 2>&1 | Out-Null
git commit -m "ClaraVerse V11 - Partie 2: Documentation et configuration" 2>&1 | Out-Null
Write-Host "✓ Commit 2 créé" -ForegroundColor Green

# Partie 3: Fichiers restants
Write-Host "Partie 3: Fichiers restants..." -ForegroundColor Cyan
git add . 2>&1 | Out-Null
if ((git status --porcelain).Count -gt 0) {
    git commit -m "ClaraVerse V11 - Partie 3: Fichiers restants" 2>&1 | Out-Null
    Write-Host "✓ Commit 3 créé" -ForegroundColor Green
} else {
    Write-Host "✓ Aucun fichier restant" -ForegroundColor Green
}

Write-Host ""
Write-Host "Push vers GitHub..." -ForegroundColor Yellow
Write-Host ""

# Push avec retry
$maxRetries = 3
$retryCount = 0

while ($retryCount -lt $maxRetries) {
    $retryCount++
    Write-Host "Tentative $retryCount/$maxRetries..." -ForegroundColor Yellow
    
    git push -u origin master 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
        Write-Host "║                  PUSH RÉUSSI!                                  ║" -ForegroundColor Green
        Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
        exit 0
    } else {
        if ($retryCount -lt $maxRetries) {
            Write-Host "Attente de 15 secondes..." -ForegroundColor Yellow
            Start-Sleep -Seconds 15
        }
    }
}

Write-Host ""
Write-Host "✗ Push échoué après $maxRetries tentatives" -ForegroundColor Red
exit 1
