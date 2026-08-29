# Script de push en commits multiples pour ClaraVerse V8
# Date: 18 Avril 2026
# Repository: https://github.com/sekadalle2024/Claverse_windows__v8_18-04-2026_V5-Export_CAC-V0-Public.git

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  Push ClaraVerse V8 (18 Avril 2026) en Commits Multiples       " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$repoUrl = "https://github.com/sekadalle2024/Claverse_windows__v8_18-04-2026_V5-Export_CAC-V0-Public.git"
$branche = "master"
$commitPrefix = "Sauvegarde ClaraVerse V8 - 18 Avril 2026"

# Fonction pour push avec retry
function Push-WithRetry {
    param(
        [string]$message,
        [int]$maxRetries = 3
    )
    
    $retry = 0
    while ($retry -lt $maxRetries) {
        Write-Host "  Push tentative $($retry + 1)/$maxRetries..." -ForegroundColor Gray
        
        git push origin $branche 2>&1 | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ Push reussi: $message" -ForegroundColor Green
            return $true
        }
        
        $retry++
        if ($retry -lt $maxRetries) {
            Write-Host "  ⚠️ Echec, nouvelle tentative dans 5 secondes..." -ForegroundColor Yellow
            Start-Sleep -Seconds 5
        }
    }
    
    Write-Host "  ❌ Push echoue apres $maxRetries tentatives" -ForegroundColor Red
    return $false
}

# Vérifier l'état Git
Write-Host "1. Verification de l'etat Git..." -ForegroundColor Yellow
$status = git status --short
$fileCount = ($status | Measure-Object).Count
Write-Host "  📁 $fileCount fichiers modifies detectes" -ForegroundColor White

# Configuration Git optimale
Write-Host ""
Write-Host "2. Configuration Git optimale..." -ForegroundColor Yellow
git config core.compression 0
git config http.postBuffer 1048576000
git config http.lowSpeedTime 999999
git config http.lowSpeedLimit 0
Write-Host "  ✅ Configuration appliquee" -ForegroundColor Green

# Changer le repository distant
Write-Host ""
Write-Host "3. Configuration du repository distant..." -ForegroundColor Yellow
git remote set-url origin $repoUrl
$remoteCheck = git remote -v | Select-Object -First 1
Write-Host "  📍 $remoteCheck" -ForegroundColor Gray

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
Write-Host "Partie 2/6: Backend Python..." -ForegroundColor Cyan
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
Write-Host "Partie 3/6: Fichiers Publics..." -ForegroundColor Cyan
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

# Commit 4: Documentation principale
Write-Host ""
Write-Host "Partie 4/6: Documentation principale..." -ForegroundColor Cyan
git add "Doc menu demarrer/" "Doc export rapport/" "Doc_Lead_Balance/" "Doc_Etat_Fin/" "Doc cross ref documentaire menu/"
$commitResult = git commit -m "$commitPrefix - Partie 4: Documentation principale" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Documentation principale")) {
        Write-Host ""
        Write-Host "❌ ECHEC - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ⚠️ Aucun fichier a commiter dans la documentation" -ForegroundColor Yellow
}

# Commit 5: Autres documentations et fichiers markdown
Write-Host ""
Write-Host "Partie 5/6: Autres documentations..." -ForegroundColor Cyan
git add *.md *.txt "Doc_Github_Issue/" "Doc Koyeb deploy/" "Doc render deploy/" "Doc backend huggings face/" "Doc Hugging Face deploy/" "deploiement-netlify/"
$commitResult = git commit -m "$commitPrefix - Partie 5: Autres documentations" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Autres documentations")) {
        Write-Host ""
        Write-Host "❌ ECHEC - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ⚠️ Aucun fichier a commiter" -ForegroundColor Yellow
}

# Commit 6: Fichiers Restants (configuration, scripts, etc.)
Write-Host ""
Write-Host "Partie 6/6: Fichiers Restants..." -ForegroundColor Cyan
git add .
$commitResult = git commit -m "$commitPrefix - Partie 6: Configuration et Fichiers Divers" 2>&1
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
Write-Host "Votre projet ClaraVerse V8 est maintenant sauvegarde sur GitHub!" -ForegroundColor Green
Write-Host ""
