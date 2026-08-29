# Script de push en commits multiples pour ClaraVerse V5
# Date: 01 Mai 2026
# Repository: https://github.com/sekadalle2024/https-github.com-sekadalle2024-Claverse_windows__v_14_01-05-2026_V5_docker_zeabur_ok_switch_editeur-

$ErrorActionPreference = "Continue"

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  Push ClaraVerse V5 en Commits Multiples (Chunk Strategy)       " -ForegroundColor Cyan
Write-Host "  Date: 01 Mai 2026                                              " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$repoUrl = "https://github.com/sekadalle2024/https-github.com-sekadalle2024-Claverse_windows__v_14_01-05-2026_V5_docker_zeabur_ok_switch_editeur-"
$branche = "master"
$commitPrefix = "Sauvegarde ClaraVerse V5 - 01 Mai 2026"

# Configuration Git optimale pour gros projets
Write-Host "1. Configuration Git optimale..." -ForegroundColor Yellow
git config core.compression 0
git config http.postBuffer 1048576000
git config http.lowSpeedTime 999999
git config http.lowSpeedLimit 0
Write-Host "  OK" -ForegroundColor Green

# Vérifier le remote
Write-Host ""
Write-Host "2. Vérification du repository distant..." -ForegroundColor Yellow
git remote set-url origin $repoUrl 2>$null
if ($LASTEXITCODE -ne 0) {
    git remote add origin $repoUrl
}
$remoteCheck = git remote -v
Write-Host "  Remote: $repoUrl" -ForegroundColor Gray

# Fonction pour push avec retry
function Push-WithRetry {
    param(
        [string]$chunkName,
        [int]$maxRetries = 3
    )
    
    $retry = 0
    while ($retry -lt $maxRetries) {
        Write-Host "  Push [$chunkName] tentative $($retry + 1)/$maxRetries..." -ForegroundColor Gray
        
        # On essaie le push
        git push origin $branche
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  SUCCES: $chunkName" -ForegroundColor Green
            return $true
        }
        
        $retry++
        if ($retry -lt $maxRetries) {
            Write-Host "  ECHEC, nouvelle tentative dans 10 secondes..." -ForegroundColor Yellow
            Start-Sleep -Seconds 10
        }
    }
    
    Write-Host "  ERREUR CRITIQUE: Le push de $chunkName a echoue apres $maxRetries tentatives." -ForegroundColor Red
    return $false
}

Write-Host ""
Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host "  SYNCHRONISATION INITIALE (Push des commits locaux existants)" -ForegroundColor Cyan
Write-Host "===================================================================" -ForegroundColor Cyan

# On essaie de pousser ce qui est déjà commité localement
Push-WithRetry "Sync Initiale"

Write-Host ""
Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host "  DEBUT DU PUSH PAR CHUNKS (Fichiers restants)" -ForegroundColor Cyan
Write-Host "===================================================================" -ForegroundColor Cyan

# Chunk 1: src/
if (Test-Path "src") {
    Write-Host ""
    Write-Host "Chunk 1: Code Source (src/)..." -ForegroundColor Cyan
    git add src/
    git commit -m "$commitPrefix - Partie 1: src"
    if ($LASTEXITCODE -eq 0) {
        if (-not (Push-WithRetry "src")) { exit 1 }
    } else {
        Write-Host "  Rien a commiter dans src/" -ForegroundColor Yellow
    }
}

# Chunk 2: py_backend/
if (Test-Path "py_backend") {
    Write-Host ""
    Write-Host "Chunk 2: Backend Python (py_backend/)..." -ForegroundColor Cyan
    git add py_backend/
    git commit -m "$commitPrefix - Partie 2: py_backend"
    if ($LASTEXITCODE -eq 0) {
        if (-not (Push-WithRetry "py_backend")) { exit 1 }
    } else {
        Write-Host "  Rien a commiter dans py_backend/" -ForegroundColor Yellow
    }
}

# Chunk 3: public/
if (Test-Path "public") {
    Write-Host ""
    Write-Host "Chunk 3: Fichiers Publics (public/)..." -ForegroundColor Cyan
    git add public/
    git commit -m "$commitPrefix - Partie 3: public"
    if ($LASTEXITCODE -eq 0) {
        if (-not (Push-WithRetry "public")) { exit 1 }
    } else {
        Write-Host "  Rien a commiter dans public/" -ForegroundColor Yellow
    }
}

# Chunk 4: Documentation (Dossiers)
Write-Host ""
Write-Host "Chunk 4: Dossiers de Documentation..." -ForegroundColor Cyan
git add "Doc menu demarrer/" "Doc export rapport/" "Doc_Lead_Balance/" "Doc_Etat_Fin/" 2>$null
git commit -m "$commitPrefix - Partie 4: Dossiers Documentation"
if ($LASTEXITCODE -eq 0) {
    if (-not (Push-WithRetry "Docs Dossiers")) { exit 1 }
} else {
    Write-Host "  Rien a commiter dans les dossiers de doc" -ForegroundColor Yellow
}

# Chunk 5: Documentation (Fichiers)
Write-Host ""
Write-Host "Chunk 5: Fichiers Documentation (*.md, *.txt)..." -ForegroundColor Cyan
git add *.md *.txt "Doc_Github_Issue/" "Doc backend github/" 2>$null
git commit -m "$commitPrefix - Partie 5: Fichiers Documentation"
if ($LASTEXITCODE -eq 0) {
    if (-not (Push-WithRetry "Docs Fichiers")) { exit 1 }
} else {
    Write-Host "  Rien a commiter dans les fichiers de doc" -ForegroundColor Yellow
}

# Chunk 6: Reste du projet
Write-Host ""
Write-Host "Chunk 6: Fichiers Restants..." -ForegroundColor Cyan
git add .
git commit -m "$commitPrefix - Partie 6: Fichiers Restants"
if ($LASTEXITCODE -eq 0) {
    if (-not (Push-WithRetry "Restants")) { exit 1 }
} else {
    Write-Host "  Rien de plus a commiter" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Green
Write-Host "           SAUVEGARDE TERMINEE AVEC SUCCES                       " -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Green
Write-Host ""
git status
Write-Host ""
Write-Host "Repository: $repoUrl"
Write-Host ""
