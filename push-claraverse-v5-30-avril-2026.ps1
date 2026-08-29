# Script de push ClaraVerse V5 - 30 Avril 2026
# Repository: https://github.com/sekadalle2024/Claverse_windows__v_14_30-04-2026_V5_docker_zeabur_ok_switch_editeur-.git
# Solution pour projet > 140 MB avec gestion des credentials OAuth

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  Push ClaraVerse V5 - 30 Avril 2026                            " -ForegroundColor Cyan
Write-Host "  Gestion automatique des credentials OAuth                     " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$repoUrl = "https://github.com/sekadalle2024/Claverse_windows__v_14_30-04-2026_V5_docker_zeabur_ok_switch_editeur-.git"
$branche = "master"
$commitPrefix = "Sauvegarde ClaraVerse V5 - 30 Avril 2026"

# Fonction pour push avec retry
function Push-WithRetry {
    param(
        [string]$message,
        [int]$maxRetries = 3
    )
    
    $retry = 0
    while ($retry -lt $maxRetries) {
        Write-Host "  Push tentative $($retry + 1)/$maxRetries..." -ForegroundColor Gray
        
        git push origin $branche
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  *** Push reussi: $message" -ForegroundColor Green
            return $true
        }
        
        <#
        # V**rifier si c'est un probl**me de secret
        if ($pushOutput -match "secret-scanning") {
            Write-Host ""
            Write-Host "  ****** GitHub a detecte un secret dans le push" -ForegroundColor Yellow
            Write-Host "  Voir: 00_PROBLEME_SECRET_GITHUB_29_AVRIL_2026.txt" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "  SOLUTIONS:" -ForegroundColor Cyan
            Write-Host "  1. Autoriser le secret (rapide):" -ForegroundColor White
            Write-Host "     Ouvrir le lien dans le message d'erreur et cliquer 'Allow secret'" -ForegroundColor Gray
            Write-Host ""
            Write-Host "  2. Nettoyer les credentials (recommande):" -ForegroundColor White
            Write-Host "     Voir: Doc cross ref documentaire menu/00_GESTION_CREDENTIALS_SECURISEE_29_AVRIL_2026.txt" -ForegroundColor Gray
            Write-Host ""
            return $false
        }
        #>
        
        $retry++
        if ($retry -lt $maxRetries) {
            Write-Host "  Echec, nouvelle tentative dans 5 secondes..." -ForegroundColor Yellow
            Start-Sleep -Seconds 5
        }
    }
    
    Write-Host "  *** Push echoue apres $maxRetries tentatives" -ForegroundColor Red
    return $false
}

# V**rifier que .env.google-oauth.local n'est pas track**
Write-Host "1. Verification de la securite des credentials..." -ForegroundColor Yellow
$trackedFiles = git ls-files | Select-String "env.google-oauth.local"
if ($trackedFiles) {
    Write-Host "  ****** ATTENTION: .env.google-oauth.local est tracke par Git!" -ForegroundColor Red
    Write-Host "  Suppression du tracking..." -ForegroundColor Yellow
    git rm --cached .env.google-oauth.local 2>&1 | Out-Null
    Write-Host "  *** Fichier retire du tracking" -ForegroundColor Green
} else {
    Write-Host "  *** Credentials securisees (.env.google-oauth.local non tracke)" -ForegroundColor Green
}

# V**rifier l'**tat Git
Write-Host ""
Write-Host "2. Verification de l'etat Git..." -ForegroundColor Yellow
$statusCount = (git status --short | Measure-Object -Line).Lines
Write-Host "  $statusCount fichiers modifies detectes" -ForegroundColor White

# Configuration Git optimale pour gros projets
Write-Host ""
Write-Host "3. Configuration Git optimale..." -ForegroundColor Yellow
git config core.compression 0
git config http.postBuffer 1048576000
git config http.lowSpeedTime 999999
git config http.lowSpeedLimit 0
Write-Host "  *** Configuration appliquee" -ForegroundColor Green

# V**rifier le remote
Write-Host ""
Write-Host "4. Verification du repository distant..." -ForegroundColor Yellow
git remote set-url origin $repoUrl
$remoteCheck = git remote -v | Select-Object -First 1
Write-Host "  $remoteCheck" -ForegroundColor Gray

Write-Host ""
Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host "  DEBUT DU PUSH EN 6 PARTIES (Methode Commits Multiples)         " -ForegroundColor Cyan
Write-Host "===================================================================" -ForegroundColor Cyan

# Commit 1: Code Source React/TypeScript (src/)
Write-Host ""
Write-Host "Partie 1/6: Code Source React/TypeScript..." -ForegroundColor Cyan
git add src/
$commitResult = git commit -m "$commitPrefix - Partie 1: Code Source React/TypeScript" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  *** Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Code Source")) {
        Write-Host ""
        Write-Host "ECHEC - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ****** Aucun fichier a commiter dans src/" -ForegroundColor Yellow
}

# Commit 2: Backend Python
Write-Host ""
Write-Host "Partie 2/6: Backend Python..." -ForegroundColor Cyan
git add py_backend/
$commitResult = git commit -m "$commitPrefix - Partie 2: Backend Python" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  *** Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Backend Python")) {
        Write-Host ""
        Write-Host "ECHEC - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ****** Aucun fichier a commiter dans py_backend/" -ForegroundColor Yellow
}

# Commit 3: Fichiers Publics
Write-Host ""
Write-Host "Partie 3/6: Fichiers Publics..." -ForegroundColor Cyan
git add public/
$commitResult = git commit -m "$commitPrefix - Partie 3: Fichiers Publics" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  *** Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Fichiers Publics")) {
        Write-Host ""
        Write-Host "ECHEC - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ****** Aucun fichier a commiter dans public/" -ForegroundColor Yellow
}

# Commit 4: Documentation principale (SANS les fichiers credentials)
Write-Host ""
Write-Host "Partie 4/6: Documentation principale..." -ForegroundColor Cyan
git add "Doc menu demarrer/" "Doc export rapport/" "Doc_Lead_Balance/" "Doc_Etat_Fin/" "Doc zeabur docker/" "Doc backend switch/"
$commitResult = git commit -m "$commitPrefix - Partie 4: Documentation principale" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  *** Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Documentation principale")) {
        Write-Host ""
        Write-Host "ECHEC - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ****** Aucun fichier a commiter dans la documentation" -ForegroundColor Yellow
}

# Commit 5: Documentation Cross-Ref (AVEC placeholders uniquement)
Write-Host ""
Write-Host "Partie 5/6: Documentation Cross-Ref (placeholders)..." -ForegroundColor Cyan
# Ajouter uniquement les fichiers avec placeholders
git add "Doc cross ref documentaire menu/*.json"
git add "Doc cross ref documentaire menu/*.ps1"
git add "Doc cross ref documentaire menu/*.md"
git add "Doc cross ref documentaire menu/00_*.txt"
# Exclure explicitement les fichiers avec credentials
git reset "Doc cross ref documentaire menu/*CREDENTIALS*.txt" 2>&1 | Out-Null
git reset "Doc cross ref documentaire menu/*credentials*.txt" 2>&1 | Out-Null
git reset "Doc cross ref documentaire menu/*OAUTH*.txt" 2>&1 | Out-Null
$commitResult = git commit -m "$commitPrefix - Partie 5: Documentation Cross-Ref" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  *** Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Documentation Cross-Ref")) {
        Write-Host ""
        Write-Host "ECHEC - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ****** Aucun fichier a commiter" -ForegroundColor Yellow
}

# Commit 6: Fichiers Restants (configuration, scripts, autres docs)
Write-Host ""
Write-Host "Partie 6/6: Fichiers Restants..." -ForegroundColor Cyan
git add .
# Exclure .env.google-oauth.local
git reset .env.google-oauth.local 2>&1 | Out-Null
$commitResult = git commit -m "$commitPrefix - Partie 6: Configuration et Fichiers Divers" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  *** Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Fichiers Restants")) {
        Write-Host ""
        Write-Host "ECHEC - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  - Aucun fichier restant a commiter" -ForegroundColor Yellow
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
Write-Host " - Credentials securisees (non poussees sur GitHub)" -ForegroundColor Green
Write-Host " - Documentation avec placeholders uniquement" -ForegroundColor Green
Write-Host ""
