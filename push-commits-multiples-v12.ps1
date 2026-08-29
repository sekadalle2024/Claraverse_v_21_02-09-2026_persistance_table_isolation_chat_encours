# Script de push en commits multiples pour ClaraVerse V12
# 20 Avril 2026 - Solution pour projets volumineux
# Repository: https://github.com/sekadalle2024/Claverse_windows__v_12_20-04-2026_V5_docker_zeabur.git

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  PUSH CLARAVERSE V12 EN COMMITS MULTIPLES                       " -ForegroundColor Cyan
Write-Host "  Date: 20 Avril 2026                                            " -ForegroundColor Cyan
Write-Host "  Solution pour projets > 140 MB                                 " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$repoUrl = "https://github.com/sekadalle2024/Claverse_windows__v_12_20-04-2026_V5_docker_zeabur.git"
$branche = "master"
$commitPrefix = "Sauvegarde ClaraVerse V12 - 20-04-2026"

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
            Write-Host "  ✓ Push réussi: $message" -ForegroundColor Green
            return $true
        }
        
        $retry++
        if ($retry -lt $maxRetries) {
            Write-Host "  ⚠️ Échec, nouvelle tentative dans 5 secondes..." -ForegroundColor Yellow
            Start-Sleep -Seconds 5
        }
    }
    
    Write-Host "  ✗ Push échoué après $maxRetries tentatives" -ForegroundColor Red
    return $false
}

# Étape 1: Configuration Git optimale
Write-Host "1. Configuration Git optimale..." -ForegroundColor Yellow
git config core.compression 0
git config http.postBuffer 2147483647
git config http.lowSpeedTime 999999
git config http.lowSpeedLimit 0
git config http.maxRequestBuffer 536870912
Write-Host "  ✓ Configuration appliquée" -ForegroundColor Green
Write-Host ""

# Étape 2: Vérifier l'état Git
Write-Host "2. Vérification de l'état Git..." -ForegroundColor Yellow
$status = git status --short
if ($status) {
    Write-Host "  Fichiers modifiés détectés" -ForegroundColor White
} else {
    Write-Host "  Aucun fichier modifié" -ForegroundColor Green
}
Write-Host ""

# Étape 3: Vérifier si un commit existe déjà
Write-Host "3. Vérification du commit existant..." -ForegroundColor Yellow
$lastCommit = git log -1 --oneline 2>&1
if ($lastCommit -match "Sauvegarde ClaraVerse V12") {
    Write-Host "  Commit existant trouvé" -ForegroundColor Green
    Write-Host "  $lastCommit" -ForegroundColor Gray
    
    Write-Host ""
    Write-Host "  Voulez-vous diviser ce commit en parties plus petites? (O/N)" -ForegroundColor Yellow
    $response = Read-Host
    
    if ($response -eq "O" -or $response -eq "o") {
        Write-Host "  Division du commit en cours..." -ForegroundColor Yellow
        git reset --soft HEAD~1
        Write-Host "  ✓ Commit annulé (fichiers conservés)" -ForegroundColor Green
    }
} else {
    Write-Host "  Aucun commit récent trouvé" -ForegroundColor White
}
Write-Host ""

# Étape 4: Configuration du repository distant
Write-Host "4. Configuration du repository distant..." -ForegroundColor Yellow
git remote set-url origin $repoUrl
$remoteCheck = git remote -v
Write-Host "  $($remoteCheck[0])" -ForegroundColor Gray
Write-Host ""

# Étape 5: Vérifier la branche
Write-Host "5. Vérification de la branche..." -ForegroundColor Yellow
$currentBranch = git branch --show-current
Write-Host "  Branche actuelle: $currentBranch" -ForegroundColor Gray

if ($currentBranch -ne $branche) {
    Write-Host "  ⚠️ Attention: Vous êtes sur la branche '$currentBranch'" -ForegroundColor Yellow
    Write-Host "  Le push sera effectué vers: origin/$currentBranch" -ForegroundColor Yellow
    $branche = $currentBranch
}
Write-Host ""

Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host "  DÉBUT DU PUSH EN 7 PARTIES                                      " -ForegroundColor Cyan
Write-Host "===================================================================" -ForegroundColor Cyan

# Partie 1: Code Source React/TypeScript (src/)
Write-Host ""
Write-Host "Partie 1/7: Code Source React/TypeScript..." -ForegroundColor Cyan
git add src/
$commitResult = git commit -m "$commitPrefix - Partie 1: Code Source React/TypeScript" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Commit créé" -ForegroundColor Green
    if (-not (Push-WithRetry "Code Source")) {
        Write-Host ""
        Write-Host "ÉCHEC - Arrêt du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ⚠️ Aucun fichier à commiter dans src/" -ForegroundColor Yellow
}

# Partie 2: Backend Python
Write-Host ""
Write-Host "Partie 2/7: Backend Python..." -ForegroundColor Cyan
git add py_backend/
$commitResult = git commit -m "$commitPrefix - Partie 2: Backend Python" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Commit créé" -ForegroundColor Green
    if (-not (Push-WithRetry "Backend Python")) {
        Write-Host ""
        Write-Host "ÉCHEC - Arrêt du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ⚠️ Aucun fichier à commiter dans py_backend/" -ForegroundColor Yellow
}

# Partie 3: Fichiers Publics
Write-Host ""
Write-Host "Partie 3/7: Fichiers Publics..." -ForegroundColor Cyan
git add public/
$commitResult = git commit -m "$commitPrefix - Partie 3: Fichiers Publics" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Commit créé" -ForegroundColor Green
    if (-not (Push-WithRetry "Fichiers Publics")) {
        Write-Host ""
        Write-Host "ÉCHEC - Arrêt du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ⚠️ Aucun fichier à commiter dans public/" -ForegroundColor Yellow
}

# Partie 4: Documentation Zeabur/Docker
Write-Host ""
Write-Host "Partie 4/7: Documentation Zeabur/Docker..." -ForegroundColor Cyan
git add "Doc zeabur docker/" "Dockerfile*" "docker-compose.yml"
$commitResult = git commit -m "$commitPrefix - Partie 4: Documentation Zeabur/Docker" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Commit créé" -ForegroundColor Green
    if (-not (Push-WithRetry "Documentation Zeabur/Docker")) {
        Write-Host ""
        Write-Host "ÉCHEC - Arrêt du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ⚠️ Aucun fichier à commiter" -ForegroundColor Yellow
}

# Partie 5: Documentation principale
Write-Host ""
Write-Host "Partie 5/7: Documentation principale..." -ForegroundColor Cyan
git add "Doc menu demarrer/" "Doc export rapport/" "Doc_Lead_Balance/" "Doc_Etat_Fin/" "Doc backend switch/"
$commitResult = git commit -m "$commitPrefix - Partie 5: Documentation principale" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Commit créé" -ForegroundColor Green
    if (-not (Push-WithRetry "Documentation principale")) {
        Write-Host ""
        Write-Host "ÉCHEC - Arrêt du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ⚠️ Aucun fichier à commiter" -ForegroundColor Yellow
}

# Partie 6: Autres documentations
Write-Host ""
Write-Host "Partie 6/7: Autres documentations..." -ForegroundColor Cyan
git add "Doc_Github_Issue/" "Doc Koyeb deploy/" "Doc render deploy/" "Doc Hugging Face deploy/" "deploiement-netlify/"
$commitResult = git commit -m "$commitPrefix - Partie 6: Autres documentations" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Commit créé" -ForegroundColor Green
    if (-not (Push-WithRetry "Autres documentations")) {
        Write-Host ""
        Write-Host "ÉCHEC - Arrêt du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ⚠️ Aucun fichier à commiter" -ForegroundColor Yellow
}

# Partie 7: Fichiers Restants
Write-Host ""
Write-Host "Partie 7/7: Fichiers Restants..." -ForegroundColor Cyan
git add .
$commitResult = git commit -m "$commitPrefix - Partie 7: Configuration et Fichiers Divers" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Commit créé" -ForegroundColor Green
    if (-not (Push-WithRetry "Fichiers Restants")) {
        Write-Host ""
        Write-Host "ÉCHEC - Arrêt du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ⚠️ Aucun fichier restant à commiter" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Green
Write-Host "  ✓ PUSH TERMINÉ AVEC SUCCÈS                                     " -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Vérification finale..." -ForegroundColor Yellow
git status
Write-Host ""
Write-Host "Repository GitHub:" -ForegroundColor Cyan
Write-Host "  $repoUrl" -ForegroundColor White
Write-Host ""
Write-Host "Pour verifier sur GitHub:" -ForegroundColor Yellow
Write-Host "  https://github.com/sekadalle2024/Claverse_windows__v_12_20-04-2026_V5_docker_zeabur" -ForegroundColor Gray
Write-Host ""
