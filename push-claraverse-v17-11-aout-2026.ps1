# Script de push en commits multiples pour projet ClaraVerse V17
# Date: 11 Août 2026
# Repository: https://github.com/sekadalle2024/Claverse_windows__v_17_11-08-2026_Export_feuille_couverture.git
# Basé sur: SOLUTION_PROJET_140MB_16_AVRIL_2026.md

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  Push ClaraVerse V17 - Export Feuille Couverture               " -ForegroundColor Cyan
Write-Host "  Date: 11 Août 2026                                             " -ForegroundColor Cyan
Write-Host "  Repository: Claverse_windows__v_17_11-08-2026_Export_feuille_couverture" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$repoUrl = "https://github.com/sekadalle2024/Claverse_windows__v_17_11-08-2026_Export_feuille_couverture.git"
$branche = "main"  # Vérifier si c'est "main" ou "master"
$commitPrefix = "Sauvegarde ClaraVerse V17 - Export Feuille Couverture - 11 Août 2026"

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
            Write-Host "  ⏳ Echec, nouvelle tentative dans 5 secondes..." -ForegroundColor Yellow
            Start-Sleep -Seconds 5
        }
    }
    
    Write-Host "  ❌ Push echoue apres $maxRetries tentatives" -ForegroundColor Red
    return $false
}

# Étape 1: Vérifier l'état Git
Write-Host "1. Verification de l'etat Git..." -ForegroundColor Yellow
$status = git status --short
if ($status) {
    Write-Host "  📝 Fichiers modifies detectes" -ForegroundColor White
    Write-Host "  Nombre de lignes: $($status.Count)" -ForegroundColor Gray
} else {
    Write-Host "  ✓ Repertoire propre" -ForegroundColor Green
}

# Étape 2: Configuration Git optimale pour gros projet
Write-Host ""
Write-Host "2. Configuration Git optimale pour projet volumineux..." -ForegroundColor Yellow
git config core.compression 0
git config http.postBuffer 1048576000
git config http.lowSpeedTime 999999
git config http.lowSpeedLimit 0
Write-Host "  ✓ Configuration appliquee" -ForegroundColor Green

# Étape 3: Configurer le remote
Write-Host ""
Write-Host "3. Configuration du repository distant..." -ForegroundColor Yellow
git remote set-url origin $repoUrl
$remoteCheck = git remote -v
Write-Host "  📡 Remote configure:" -ForegroundColor Gray
Write-Host "     $($remoteCheck[0])" -ForegroundColor Gray

# Étape 4: Vérifier la branche
Write-Host ""
Write-Host "4. Verification de la branche..." -ForegroundColor Yellow
$currentBranch = git branch --show-current
Write-Host "  📌 Branche actuelle: $currentBranch" -ForegroundColor Gray
if ($currentBranch -ne $branche) {
    Write-Host "  ⚠️  Changement vers la branche: $branche" -ForegroundColor Yellow
    git checkout -b $branche 2>&1 | Out-Null
}

Write-Host ""
Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host "  DEBUT DU PUSH EN 6 PARTIES (Projet > 140 MB)                    " -ForegroundColor Cyan
Write-Host "===================================================================" -ForegroundColor Cyan

# Partie 1: Code Source React/TypeScript (src/)
Write-Host ""
Write-Host "Partie 1/6: Code Source React/TypeScript (src/)..." -ForegroundColor Cyan
git add src/
$commitResult = git commit -m "$commitPrefix - Partie 1: Code Source React/TypeScript" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Code Source React/TypeScript")) {
        Write-Host ""
        Write-Host "❌ ECHEC - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ⚠️  Aucun fichier a commiter dans src/" -ForegroundColor Yellow
}

# Partie 2: Backend Python (py_backend/)
Write-Host ""
Write-Host "Partie 2/6: Backend Python (py_backend/)..." -ForegroundColor Cyan
git add py_backend/
$commitResult = git commit -m "$commitPrefix - Partie 2: Backend Python" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Backend Python")) {
        Write-Host ""
        Write-Host "❌ ECHEC - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ⚠️  Aucun fichier a commiter dans py_backend/" -ForegroundColor Yellow
}

# Partie 3: Fichiers Publics (public/)
Write-Host ""
Write-Host "Partie 3/6: Fichiers Publics (public/)..." -ForegroundColor Cyan
git add public/
$commitResult = git commit -m "$commitPrefix - Partie 3: Fichiers Publics" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Fichiers Publics")) {
        Write-Host ""
        Write-Host "❌ ECHEC - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ⚠️  Aucun fichier a commiter dans public/" -ForegroundColor Yellow
}

# Partie 4: Documentation principale
Write-Host ""
Write-Host "Partie 4/6: Documentation principale..." -ForegroundColor Cyan
git add "Doc menu demarrer/" "Doc export rapport/" "Doc_Lead_Balance/" "Doc_Etat_Fin/" "Doc papier de travail javascript/" "Doc composant menu accordeon/"
$commitResult = git commit -m "$commitPrefix - Partie 4: Documentation principale" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Documentation principale")) {
        Write-Host ""
        Write-Host "❌ ECHEC - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ⚠️  Aucun fichier a commiter dans la documentation" -ForegroundColor Yellow
}

# Partie 5: Autres documentations
Write-Host ""
Write-Host "Partie 5/6: Autres documentations (Doc_Github_Issue/, *.md, *.txt)..." -ForegroundColor Cyan
git add "Doc_Github_Issue/" "Doc Koyeb deploy/" "Doc zeabur docker/" "Doc render deploy/" "Doc backend github/" "Doc backend switch/" "Doc cross ref documentaire menu/" *.md *.txt
$commitResult = git commit -m "$commitPrefix - Partie 5: Autres documentations" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Autres documentations")) {
        Write-Host ""
        Write-Host "❌ ECHEC - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ⚠️  Aucun fichier a commiter" -ForegroundColor Yellow
}

# Partie 6: Fichiers Restants (Configuration, Scripts, etc.)
Write-Host ""
Write-Host "Partie 6/6: Fichiers Restants (Configuration et Scripts)..." -ForegroundColor Cyan
git add .
$commitResult = git commit -m "$commitPrefix - Partie 6: Configuration et Fichiers Divers" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Fichiers Restants")) {
        Write-Host ""
        Write-Host "❌ ECHEC - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ⚠️  Aucun fichier restant a commiter" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Green
Write-Host "           ✅ PUSH TERMINE AVEC SUCCES                           " -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Verification finale..." -ForegroundColor Yellow
git status
Write-Host ""
Write-Host "🔗 Repository GitHub:" -ForegroundColor Cyan
Write-Host "   $repoUrl" -ForegroundColor White
Write-Host ""
Write-Host "✅ Sauvegarde ClaraVerse V17 terminee avec succes!" -ForegroundColor Green
Write-Host ""
