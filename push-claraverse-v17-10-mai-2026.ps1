# Script de mise à jour ClaraVerse V17 - 10 Mai 2026
# Repository: https://github.com/sekadalle2024/Claverse_windows__v_17_09-05-2026_V5_docker_zeabur_ok_switch_editeur-.git
# Solution pour projets volumineux avec commits multiples

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  Mise à Jour ClaraVerse V17 - 10 Mai 2026                      " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$repoUrl = "https://github.com/sekadalle2024/Claverse_windows__v_17_09-05-2026_V5_docker_zeabur_ok_switch_editeur-.git"
$branche = "main"
$commitPrefix = "Mise à jour ClaraVerse V17 - 10 Mai 2026"

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
            Write-Host "  ✅ Push réussi: $message" -ForegroundColor Green
            return $true
        }
        
        $retry++
        if ($retry -lt $maxRetries) {
            Write-Host "  ⚠️ Échec, nouvelle tentative dans 5 secondes..." -ForegroundColor Yellow
            Start-Sleep -Seconds 5
        }
    }
    
    Write-Host "  ❌ Push échoué après $maxRetries tentatives" -ForegroundColor Red
    return $false
}

# Vérifier l'état Git
Write-Host "1. Vérification de l'état Git..." -ForegroundColor Yellow
$status = git status --short
if ($status) {
    Write-Host "  📝 Fichiers modifiés détectés" -ForegroundColor White
    $fileCount = ($status | Measure-Object).Count
    Write-Host "  📊 Nombre de fichiers: $fileCount" -ForegroundColor Gray
} else {
    Write-Host "  ✅ Aucun fichier modifié" -ForegroundColor Green
    Write-Host ""
    Write-Host "Voulez-vous continuer quand même ? (O/N)" -ForegroundColor Yellow
    $response = Read-Host
    if ($response -ne "O" -and $response -ne "o") {
        Write-Host "Opération annulée" -ForegroundColor Red
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
Write-Host "  ✅ Configuration appliquée" -ForegroundColor Green

# Vérifier/Configurer le remote
Write-Host ""
Write-Host "3. Configuration du repository distant..." -ForegroundColor Yellow
$currentRemote = git remote get-url origin 2>&1
if ($currentRemote -ne $repoUrl) {
    Write-Host "  🔄 Mise à jour du remote..." -ForegroundColor Gray
    git remote set-url origin $repoUrl
}
$remoteCheck = git remote -v
Write-Host "  📍 $($remoteCheck[0])" -ForegroundColor Gray

# Vérifier la branche
Write-Host ""
Write-Host "4. Vérification de la branche..." -ForegroundColor Yellow
$currentBranch = git branch --show-current
Write-Host "  📌 Branche actuelle: $currentBranch" -ForegroundColor Gray
if ($currentBranch -ne $branche) {
    Write-Host "  ⚠️ Attention: La branche actuelle ($currentBranch) diffère de la branche cible ($branche)" -ForegroundColor Yellow
    Write-Host "  Voulez-vous continuer avec la branche $currentBranch ? (O/N)" -ForegroundColor Yellow
    $response = Read-Host
    if ($response -eq "O" -or $response -eq "o") {
        $branche = $currentBranch
    } else {
        Write-Host "Opération annulée" -ForegroundColor Red
        exit 0
    }
}

Write-Host ""
Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host "  DÉBUT DU PUSH EN 6 PARTIES" -ForegroundColor Cyan
Write-Host "===================================================================" -ForegroundColor Cyan

# Commit 1: Code Source React/TypeScript (src/)
Write-Host ""
Write-Host "Partie 1/6: Code Source React/TypeScript..." -ForegroundColor Cyan
git add src/
$commitResult = git commit -m "$commitPrefix - Partie 1: Code Source React/TypeScript" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Commit créé" -ForegroundColor Green
    if (-not (Push-WithRetry "Code Source")) {
        Write-Host ""
        Write-Host "❌ ÉCHEC - Arrêt du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ℹ️ Aucun fichier à commiter dans src/" -ForegroundColor Yellow
}

# Commit 2: Backend Python
Write-Host ""
Write-Host "Partie 2/6: Backend Python..." -ForegroundColor Cyan
git add py_backend/
$commitResult = git commit -m "$commitPrefix - Partie 2: Backend Python" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Commit créé" -ForegroundColor Green
    if (-not (Push-WithRetry "Backend Python")) {
        Write-Host ""
        Write-Host "❌ ÉCHEC - Arrêt du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ℹ️ Aucun fichier à commiter dans py_backend/" -ForegroundColor Yellow
}

# Commit 3: Fichiers Publics
Write-Host ""
Write-Host "Partie 3/6: Fichiers Publics..." -ForegroundColor Cyan
git add public/
$commitResult = git commit -m "$commitPrefix - Partie 3: Fichiers Publics" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Commit créé" -ForegroundColor Green
    if (-not (Push-WithRetry "Fichiers Publics")) {
        Write-Host ""
        Write-Host "❌ ÉCHEC - Arrêt du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ℹ️ Aucun fichier à commiter dans public/" -ForegroundColor Yellow
}

# Commit 4: Documentation principale
Write-Host ""
Write-Host "Partie 4/6: Documentation principale..." -ForegroundColor Cyan
git add "Doc menu demarrer/" "Doc export rapport/" "Doc_Lead_Balance/" "Doc_Etat_Fin/" "Doc menu contextuel menu.js update/"
$commitResult = git commit -m "$commitPrefix - Partie 4: Documentation principale" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Commit créé" -ForegroundColor Green
    if (-not (Push-WithRetry "Documentation principale")) {
        Write-Host ""
        Write-Host "❌ ÉCHEC - Arrêt du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ℹ️ Aucun fichier à commiter dans la documentation" -ForegroundColor Yellow
}

# Commit 5: Autres documentations
Write-Host ""
Write-Host "Partie 5/6: Autres documentations..." -ForegroundColor Cyan
git add *.md *.txt "Doc_Github_Issue/" "Doc zeabur docker/" "Doc backend switch/" "Doc papier de travail javascript/"
$commitResult = git commit -m "$commitPrefix - Partie 5: Autres documentations" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Commit créé" -ForegroundColor Green
    if (-not (Push-WithRetry "Autres documentations")) {
        Write-Host ""
        Write-Host "❌ ÉCHEC - Arrêt du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ℹ️ Aucun fichier à commiter" -ForegroundColor Yellow
}

# Commit 6: Fichiers Restants
Write-Host ""
Write-Host "Partie 6/6: Fichiers Restants..." -ForegroundColor Cyan
git add .
$commitResult = git commit -m "$commitPrefix - Partie 6: Configuration et Fichiers Divers" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Commit créé" -ForegroundColor Green
    if (-not (Push-WithRetry "Fichiers Restants")) {
        Write-Host ""
        Write-Host "❌ ÉCHEC - Arrêt du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ℹ️ Aucun fichier restant à commiter" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Green
Write-Host "           ✅ PUSH TERMINÉ AVEC SUCCÈS                           " -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Vérification finale..." -ForegroundColor Yellow
git status
Write-Host ""
Write-Host "Repository GitHub:" -ForegroundColor Cyan
Write-Host "   $repoUrl" -ForegroundColor White
Write-Host ""
Write-Host "Branche: $branche" -ForegroundColor Cyan
Write-Host ""
