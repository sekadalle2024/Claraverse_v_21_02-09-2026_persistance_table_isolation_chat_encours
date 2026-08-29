# Script de push par commits multiples - ClaraVerse V5 - 04 Avril 2026
# Solution pour projets > 100 MB

Write-Host "=== Push ClaraVerse par Commits Multiples ===" -ForegroundColor Cyan
Write-Host "Projet: 109.96 MB - Division en 5 commits" -ForegroundColor Yellow
Write-Host ""

# Fonction pour push avec retry
function Push-WithRetry {
    param([string]$message)
    
    Write-Host "Push: $message" -ForegroundColor Cyan
    git push origin master
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "OK Succes" -ForegroundColor Green
        return $true
    } else {
        Write-Host "X Echec" -ForegroundColor Red
        return $false
    }
}

# Annuler le commit actuel
Write-Host "Etape 1/6: Annulation du commit actuel..." -ForegroundColor Yellow
git reset --soft HEAD~1
if ($LASTEXITCODE -eq 0) {
    Write-Host "OK Commit annule" -ForegroundColor Green
} else {
    Write-Host "X Erreur lors de l'annulation" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Commit 1: Code Source
Write-Host "Etape 2/6: Commit 1 - Code Source (src/)..." -ForegroundColor Yellow
git add src/
git commit -m "Sauvegarde V5 - 04 Avril 2026 - Partie 1: Code Source"
if (-not (Push-WithRetry "Code Source")) { exit 1 }
Write-Host ""

# Commit 2: Backend Python
Write-Host "Etape 3/6: Commit 2 - Backend Python..." -ForegroundColor Yellow
git add py_backend/
git commit -m "Sauvegarde V5 - 04 Avril 2026 - Partie 2: Backend Python"
if (-not (Push-WithRetry "Backend Python")) { exit 1 }
Write-Host ""

# Commit 3: Fichiers Publics
Write-Host "Etape 4/6: Commit 3 - Fichiers Publics..." -ForegroundColor Yellow
git add public/
git commit -m "Sauvegarde V5 - 04 Avril 2026 - Partie 3: Fichiers Publics"
if (-not (Push-WithRetry "Fichiers Publics")) { exit 1 }
Write-Host ""

# Commit 4: Documentation
Write-Host "Etape 5/6: Commit 4 - Documentation..." -ForegroundColor Yellow
git add *.md *.txt Doc*
git commit -m "Sauvegarde V5 - 04 Avril 2026 - Partie 4: Documentation"
if (-not (Push-WithRetry "Documentation")) { exit 1 }
Write-Host ""

# Commit 5: Fichiers Restants
Write-Host "Etape 6/6: Commit 5 - Fichiers Restants..." -ForegroundColor Yellow
git add .
git commit -m "Sauvegarde V5 - 04 Avril 2026 - Partie 5: Fichiers Restants"
if (-not (Push-WithRetry "Fichiers Restants")) { exit 1 }
Write-Host ""

Write-Host "=== SUCCES COMPLET ===" -ForegroundColor Green
Write-Host "Tous les commits ont ete pousses avec succes!" -ForegroundColor Green
Write-Host ""
Write-Host "URL du repository:" -ForegroundColor Cyan
Write-Host "https://github.com/sekadalle2024/Craverse_windows_s_12_v0_04-04-2026_V5-Export_CAC-V0-Public.git" -ForegroundColor White
