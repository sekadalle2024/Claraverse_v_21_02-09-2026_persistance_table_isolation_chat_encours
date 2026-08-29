# Script de push en commits multiples pour projet 140 MB
# ClaraVerse V16 - 04 Mai 2026
# Version adaptée pour le nouveau repository

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  Push ClaraVerse V16 (140 MB) en Commits Multiples              " -ForegroundColor Cyan
Write-Host "  Date: 04 Mai 2026                                              " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$repoUrl = "https://github.com/sekadalle2024/Claverse_windows__v_16_04-05-2026_V5_docker_zeabur_ok_switch_editeur-.git"
$branche = "master"
$commitPrefix = "Sauvegarde ClaraVerse V16 - 04 Mai 2026"

# Fonction pour push avec retry
function Push-WithRetry {
    param(
        [string]$message,
        [int]$maxRetries = 3
    )
    
    $retry = 0
    while ($retry -lt $maxRetries) {
        Write-Host "  Push tentative $($retry + 1)/$maxRetries..." -ForegroundColor Gray
        
        git push origin $branche 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  Push reussi: $message" -ForegroundColor Green
            return $true
        }
        
        $retry++
        if ($retry -lt $maxRetries) {
            Write-Host "  Echec, nouvelle tentative dans 5 secondes..." -ForegroundColor Yellow
            Start-Sleep -Seconds 5
        }
    }
    
    Write-Host "  Push echoue apres $maxRetries tentatives" -ForegroundColor Red
    return $false
}

# Vérifier l'état Git
Write-Host "1. Vérification de l'état Git..." -ForegroundColor Yellow
$status = git status --short
if ($status) {
    Write-Host "  Fichiers modifies detectes" -ForegroundColor White
} else {
    Write-Host "  Aucun fichier modifie" -ForegroundColor Green
}

# Vérifier si un commit existe déjà
Write-Host ""
Write-Host "2. Vérification du commit existant..." -ForegroundColor Yellow
$lastCommit = git log -1 --oneline 2>&1
if ($lastCommit -match "Sauvegarde ClaraVerse") {
    Write-Host "  Commit existant trouve" -ForegroundColor Green
    Write-Host "  $lastCommit" -ForegroundColor Gray
    
    # Annuler le commit pour le diviser
    Write-Host ""
    Write-Host "3. Division du commit en parties plus petites..." -ForegroundColor Yellow
    git reset --soft HEAD~1
    Write-Host "  Commit annule (fichiers conserves)" -ForegroundColor Green
} else {
    Write-Host "  Aucun commit récent de sauvegarde trouvé (ou premier push)" -ForegroundColor White
}

# Configuration Git optimale
Write-Host ""
Write-Host "4. Configuration Git optimale..." -ForegroundColor Yellow
git config core.compression 0
git config http.postBuffer 2147483647
git config http.maxRequestBuffer 536870912
git config http.lowSpeedTime 999999
git config http.lowSpeedLimit 0
Write-Host "  Configuration appliquee" -ForegroundColor Green

# Vérifier le remote
Write-Host ""
Write-Host "5. Vérification du repository distant..." -ForegroundColor Yellow
git remote set-url origin $repoUrl
$remoteCheck = git remote -v
Write-Host "  $($remoteCheck[0])" -ForegroundColor Gray

Write-Host ""
Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host "  DEBUT DU PUSH EN 6 PARTIES" -ForegroundColor Cyan
Write-Host "===================================================================" -ForegroundColor Cyan

# Commit 1: Code Source React/TypeScript (src/)
Write-Host ""
Write-Host "Partie 1/6: Code Source React/TypeScript..." -ForegroundColor Cyan
git add src/
$commitResult = git commit -m "$commitPrefix - Partie 1: Code Source React/TypeScript" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Code Source")) {
        Write-Host ""
        Write-Host "ECHEC - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  Aucun fichier a commiter dans src/" -ForegroundColor Yellow
}

# Commit 2: Backend Python
Write-Host ""
Write-Host "Partie 2/6: Backend Python..." -ForegroundColor Cyan
git add py_backend/
$commitResult = git commit -m "$commitPrefix - Partie 2: Backend Python" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Backend Python")) {
        Write-Host ""
        Write-Host "ECHEC - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  Aucun fichier a commiter dans py_backend/" -ForegroundColor Yellow
}

# Commit 3: Fichiers Publics
Write-Host ""
Write-Host "Partie 3/6: Fichiers Publics..." -ForegroundColor Cyan
git add public/
$commitResult = git commit -m "$commitPrefix - Partie 3: Fichiers Publics" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Fichiers Publics")) {
        Write-Host ""
        Write-Host "ECHEC - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  Aucun fichier a commiter dans public/" -ForegroundColor Yellow
}

# Commit 4: Documentation principale
Write-Host ""
Write-Host "Partie 4/6: Documentation principale..." -ForegroundColor Cyan
git add "Doc menu demarrer/" "Doc export rapport/" "Doc_Lead_Balance/" "Doc_Etat_Fin/"
$commitResult = git commit -m "$commitPrefix - Partie 4: Documentation principale" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Documentation principale")) {
        Write-Host ""
        Write-Host "ECHEC - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  Aucun fichier a commiter dans la documentation" -ForegroundColor Yellow
}

# Commit 5: Autres documentations
Write-Host ""
Write-Host "Partie 5/6: Autres documentations..." -ForegroundColor Cyan
git add *.md *.txt "Doc_Github_Issue/" "Doc Koyeb deploy/" "deploiement-netlify/"
$commitResult = git commit -m "$commitPrefix - Partie 5: Autres documentations" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Autres documentations")) {
        Write-Host ""
        Write-Host "ECHEC - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  Aucun fichier a commiter" -ForegroundColor Yellow
}

# Commit 6: Fichiers Restants
Write-Host ""
Write-Host "Partie 6/6: Fichiers Restants..." -ForegroundColor Cyan
git add .
$commitResult = git commit -m "$commitPrefix - Partie 6: Configuration et Fichiers Divers" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Fichiers Restants")) {
        Write-Host ""
        Write-Host "ECHEC - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ⚠️ Aucun fichier restant à commiter" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Green
Write-Host "           PUSH TERMINE AVEC SUCCES                              " -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Verification finale..." -ForegroundColor Yellow
git status
Write-Host ""
Write-Host "Repository GitHub:" -ForegroundColor Cyan
Write-Host "   $repoUrl" -ForegroundColor White
Write-Host ""
