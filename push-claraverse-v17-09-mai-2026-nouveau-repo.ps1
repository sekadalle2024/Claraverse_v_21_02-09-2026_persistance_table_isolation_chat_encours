# Script de push en commits multiples pour ClaraVerse V17
# Date: 09 Mai 2026
# Nouveau Repository: https://github.com/sekadalle2024/Claverse_windows__v_17_09-05-2026_V5_docker_zeabur_ok_switch_editeur-.git
# Solution basée sur SOLUTION_PROJET_140MB_16_AVRIL_2026.md

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  Push ClaraVerse V17 vers Nouveau Repository                   " -ForegroundColor Cyan
Write-Host "  Date: 09 Mai 2026                                              " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$nouveauRepoUrl = "https://github.com/sekadalle2024/Claverse_windows__v_17_09-05-2026_V5_docker_zeabur_ok_switch_editeur-.git"
$branche = "v17_backup_final"
$commitPrefix = "Sauvegarde ClaraVerse V17 - 09 Mai 2026"

# Fonction pour push avec retry
function Push-WithRetry {
    param(
        [string]$message,
        [int]$maxRetries = 3
    )
    
    $retry = 0
    while ($retry -lt $maxRetries) {
        Write-Host "  Push tentative $($retry + 1)/$maxRetries..." -ForegroundColor Gray
        
        git push -u origin $branche 2>&1 | Out-Null
        
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
Write-Host "1. Vérification de l'état Git..." -ForegroundColor Yellow
$status = git status --short
$nbFichiers = ($status | Measure-Object).Count
if ($nbFichiers -gt 0) {
    Write-Host "  ✅ $nbFichiers fichiers modifies detectes" -ForegroundColor Green
} else {
    Write-Host "  ⚠️ Aucun fichier modifie" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Voulez-vous continuer quand meme ? (O/N)" -ForegroundColor Cyan
    $reponse = Read-Host
    if ($reponse -ne "O" -and $reponse -ne "o") {
        Write-Host "Script annule" -ForegroundColor Yellow
        exit 0
    }
}

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
Write-Host "3. Changement du repository distant..." -ForegroundColor Yellow
$ancienRepo = git remote get-url origin
Write-Host "  Ancien repository: $ancienRepo" -ForegroundColor Gray
git remote set-url origin $nouveauRepoUrl
Write-Host "  ✅ Nouveau repository: $nouveauRepoUrl" -ForegroundColor Green

# Vérifier la connexion
Write-Host ""
Write-Host "4. Vérification de la connexion..." -ForegroundColor Yellow
$remoteCheck = git remote -v
Write-Host "  $($remoteCheck[0])" -ForegroundColor Gray
Write-Host "  $($remoteCheck[1])" -ForegroundColor Gray

# Vérifier la branche
Write-Host ""
Write-Host "5. Vérification de la branche..." -ForegroundColor Yellow
$currentBranch = git branch --show-current
Write-Host "  Branche actuelle: $currentBranch" -ForegroundColor Gray
if ($currentBranch -ne $branche) {
    Write-Host "  ⚠️ La branche sera: $branche" -ForegroundColor Yellow
} else {
    Write-Host "  ✅ Branche correcte: $branche" -ForegroundColor Green
}

Write-Host ""
Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host "  DEBUT DU PUSH EN 6 PARTIES" -ForegroundColor Cyan
Write-Host "  Cela peut prendre 10-15 minutes..." -ForegroundColor Cyan
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
        Write-Host "Restauration de l'ancien repository..." -ForegroundColor Yellow
        git remote set-url origin $ancienRepo
        exit 1
    }
} else {
    Write-Host "  ℹ️ Aucun fichier a commiter dans src/" -ForegroundColor Yellow
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
        Write-Host "Restauration de l'ancien repository..." -ForegroundColor Yellow
        git remote set-url origin $ancienRepo
        exit 1
    }
} else {
    Write-Host "  ℹ️ Aucun fichier a commiter dans py_backend/" -ForegroundColor Yellow
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
        Write-Host "Restauration de l'ancien repository..." -ForegroundColor Yellow
        git remote set-url origin $ancienRepo
        exit 1
    }
} else {
    Write-Host "  ℹ️ Aucun fichier a commiter dans public/" -ForegroundColor Yellow
}

# Commit 4: Documentation principale
Write-Host ""
Write-Host "Partie 4/6: Documentation principale..." -ForegroundColor Cyan
git add "Doc menu demarrer/" "Doc export rapport/" "Doc_Lead_Balance/" "Doc_Etat_Fin/" "Doc cross ref documentaire menu/" "Doc papier de travail javascript/" "Doc ClaraAttachmentService traitement/"
$commitResult = git commit -m "$commitPrefix - Partie 4: Documentation principale" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Documentation principale")) {
        Write-Host ""
        Write-Host "❌ ECHEC - Arret du script" -ForegroundColor Red
        Write-Host "Restauration de l'ancien repository..." -ForegroundColor Yellow
        git remote set-url origin $ancienRepo
        exit 1
    }
} else {
    Write-Host "  ℹ️ Aucun fichier a commiter dans la documentation" -ForegroundColor Yellow
}

# Commit 5: Autres documentations et fichiers texte
Write-Host ""
Write-Host "Partie 5/6: Autres documentations..." -ForegroundColor Cyan
git add *.md *.txt *.ps1 "Doc_Github_Issue/" "Doc Koyeb deploy/" "Doc zeabur docker/" "Doc backend switch/" "Doc backend github/" "deploiement-netlify/"
$commitResult = git commit -m "$commitPrefix - Partie 5: Autres documentations" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Autres documentations")) {
        Write-Host ""
        Write-Host "❌ ECHEC - Arret du script" -ForegroundColor Red
        Write-Host "Restauration de l'ancien repository..." -ForegroundColor Yellow
        git remote set-url origin $ancienRepo
        exit 1
    }
} else {
    Write-Host "  ℹ️ Aucun fichier a commiter" -ForegroundColor Yellow
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
        Write-Host "Restauration de l'ancien repository..." -ForegroundColor Yellow
        git remote set-url origin $ancienRepo
        exit 1
    }
} else {
    Write-Host "  ℹ️ Aucun fichier restant a commiter" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Green
Write-Host "           ✅ PUSH TERMINE AVEC SUCCES                           " -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Verification finale..." -ForegroundColor Yellow
git status
Write-Host ""
Write-Host "Nouveau Repository GitHub:" -ForegroundColor Cyan
Write-Host "   $nouveauRepoUrl" -ForegroundColor White
Write-Host ""
Write-Host "Branche:" -ForegroundColor Cyan
Write-Host "   $branche" -ForegroundColor White
Write-Host ""
Write-Host "Ancien Repository (sauvegarde):" -ForegroundColor Gray
Write-Host "   $ancienRepo" -ForegroundColor Gray
Write-Host ""
