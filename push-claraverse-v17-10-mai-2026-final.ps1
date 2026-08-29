# Script de push en commits multiples pour ClaraVerse V17
# Date: 10 Mai 2026
# Repository: https://github.com/sekadalle2024/Claverse_windows__v_17_10-05-2026_V5_docker_zeabur_ok_switch_editeur-.git
# Solution pour projets volumineux (> 140 MB)

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  Push ClaraVerse V17 (10 Mai 2026) en Commits Multiples        " -ForegroundColor Cyan
Write-Host "  Repository: Claverse_windows__v_17_10-05-2026                  " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$repoUrl = "https://github.com/sekadalle2024/Claverse_windows__v_17_10-05-2026_V5_docker_zeabur_ok_switch_editeur-.git"
$commitPrefix = "Sauvegarde ClaraVerse V17 - 10 Mai 2026"

# Fonction pour push avec retry
function Push-WithRetry {
    param(
        [string]$message,
        [int]$maxRetries = 3
    )
    
    $retry = 0
    while ($retry -lt $maxRetries) {
        Write-Host "  Push tentative $($retry + 1)/$maxRetries..." -ForegroundColor Gray
        
        $pushOutput = git push -u origin HEAD 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ Push reussi: $message" -ForegroundColor Green
            return $true
        }
        
        $retry++
        if ($retry -lt $maxRetries) {
            Write-Host "  ⚠️ Echec, nouvelle tentative dans 10 secondes..." -ForegroundColor Yellow
            Start-Sleep -Seconds 10
        }
    }
    
    Write-Host "  ❌ Push echoue apres $maxRetries tentatives" -ForegroundColor Red
    return $false
}

# Étape 1: Vérifier la branche actuelle
Write-Host "1. Vérification de la branche..." -ForegroundColor Yellow
$currentBranch = git branch --show-current
Write-Host "  Branche actuelle: $currentBranch" -ForegroundColor White

# Étape 2: Vérifier l'état Git
Write-Host ""
Write-Host "2. Vérification de l'état Git..." -ForegroundColor Yellow
$status = git status --short
if ($status) {
    $fileCount = ($status | Measure-Object).Count
    Write-Host "  $fileCount fichiers modifies detectes" -ForegroundColor White
} else {
    Write-Host "  ✅ Aucun fichier modifie" -ForegroundColor Green
    Write-Host ""
    Write-Host "Tout est deja a jour sur GitHub!" -ForegroundColor Green
    exit 0
}

# Étape 3: Configuration Git optimale
Write-Host ""
Write-Host "3. Configuration Git optimale..." -ForegroundColor Yellow
git config core.compression 0
git config http.postBuffer 1048576000
git config http.lowSpeedTime 999999
git config http.lowSpeedLimit 0
git config pack.windowMemory "100m"
git config pack.packSizeLimit "100m"
git config pack.threads "1"
Write-Host "  ✅ Configuration appliquee" -ForegroundColor Green

# Étape 4: Vérifier et mettre à jour le remote
Write-Host ""
Write-Host "4. Configuration du repository distant..." -ForegroundColor Yellow
git remote set-url origin $repoUrl
$remoteCheck = git remote -v | Select-Object -First 1
Write-Host "  $remoteCheck" -ForegroundColor Gray

Write-Host ""
Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host "  DEBUT DU PUSH EN 7 PARTIES" -ForegroundColor Cyan
Write-Host "===================================================================" -ForegroundColor Cyan

# Commit 1: Code Source React/TypeScript (src/)
Write-Host ""
Write-Host "Partie 1/7: Code Source React/TypeScript..." -ForegroundColor Cyan
git add src/
$commitResult = git commit -m "$commitPrefix - Partie 1: Code Source React/TypeScript" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Code Source")) {
        Write-Host ""
        Write-Host "❌ ECHEC - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ⚠️ Aucun fichier a commiter dans src/" -ForegroundColor Yellow
}

# Commit 2: Backend Python
Write-Host ""
Write-Host "Partie 2/7: Backend Python..." -ForegroundColor Cyan
git add py_backend/
$commitResult = git commit -m "$commitPrefix - Partie 2: Backend Python" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Backend Python")) {
        Write-Host ""
        Write-Host "❌ ECHEC - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ⚠️ Aucun fichier a commiter dans py_backend/" -ForegroundColor Yellow
}

# Commit 3: Fichiers Publics
Write-Host ""
Write-Host "Partie 3/7: Fichiers Publics..." -ForegroundColor Cyan
git add public/
$commitResult = git commit -m "$commitPrefix - Partie 3: Fichiers Publics" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Fichiers Publics")) {
        Write-Host ""
        Write-Host "❌ ECHEC - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ⚠️ Aucun fichier a commiter dans public/" -ForegroundColor Yellow
}

# Commit 4: Documentation Menu et Export
Write-Host ""
Write-Host "Partie 4/7: Documentation Menu et Export..." -ForegroundColor Cyan
git add "Doc menu demarrer/" "Doc export rapport/" "Doc menu contextuel menu.js update/"
$commitResult = git commit -m "$commitPrefix - Partie 4: Documentation Menu et Export" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Documentation Menu")) {
        Write-Host ""
        Write-Host "❌ ECHEC - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ⚠️ Aucun fichier a commiter" -ForegroundColor Yellow
}

# Commit 5: Documentation Technique
Write-Host ""
Write-Host "Partie 5/7: Documentation Technique..." -ForegroundColor Cyan
git add "Doc_Lead_Balance/" "Doc_Etat_Fin/" "Doc papier de travail javascript/" "Doc cross ref documentaire menu/"
$commitResult = git commit -m "$commitPrefix - Partie 5: Documentation Technique" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Documentation Technique")) {
        Write-Host ""
        Write-Host "❌ ECHEC - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ⚠️ Aucun fichier a commiter" -ForegroundColor Yellow
}

# Commit 6: Documentation Déploiement et GitHub
Write-Host ""
Write-Host "Partie 6/7: Documentation Deploiement..." -ForegroundColor Cyan
git add "Doc_Github_Issue/" "Doc zeabur docker/" "Doc backend github/" "Doc backend switch/" "deploiement-netlify/"
$commitResult = git commit -m "$commitPrefix - Partie 6: Documentation Deploiement" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Documentation Deploiement")) {
        Write-Host ""
        Write-Host "❌ ECHEC - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ⚠️ Aucun fichier a commiter" -ForegroundColor Yellow
}

# Commit 7: Fichiers Restants (config, scripts, docs racine)
Write-Host ""
Write-Host "Partie 7/7: Configuration et Fichiers Divers..." -ForegroundColor Cyan
git add .
$commitResult = git commit -m "$commitPrefix - Partie 7: Configuration et Fichiers Divers" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Fichiers Restants")) {
        Write-Host ""
        Write-Host "❌ ECHEC - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ⚠️ Aucun fichier restant a commiter" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Green
Write-Host "           ✅ PUSH TERMINE AVEC SUCCES                           " -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Verification finale..." -ForegroundColor Yellow
git status
Write-Host ""
Write-Host "Repository GitHub:" -ForegroundColor Cyan
Write-Host "   $repoUrl" -ForegroundColor White
Write-Host ""
Write-Host "✅ Votre projet ClaraVerse V17 est maintenant sauvegarde sur GitHub!" -ForegroundColor Green
Write-Host ""
