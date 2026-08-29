# Script de push en commits multiples pour projet 140 MB
# ClaraVerse Version 9 - 19 Avril 2026
# Version adaptée du script du 16 Avril 2026

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  Push ClaraVerse Version 9 (140 MB) en Commits Multiples       " -ForegroundColor Cyan
Write-Host "  Date: 19 Avril 2026                                            " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$repoUrl = "https://github.com/sekadalle2024/Claverse_windows__v_9_19-04-2026_V5-Export_CAC-V0-Public.git"
$branche = "master"
$commitPrefix = "Sauvegarde ClaraVerse - Version 9 - 19 Avril 2026"

# Fonction pour push avec retry
function Push-WithRetry {
    param(
        [string]$message,
        [int]$maxRetries = 5
    )
    
    $retry = 0
    while ($retry -lt $maxRetries) {
        Write-Host "  Push tentative $($retry + 1)/$maxRetries..." -ForegroundColor Gray
        
        # On utilise --force car on a nettoye l'historique
        $gitError = git push -f origin $branche 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  Push reussi: $message" -ForegroundColor Green
            return $true
        } else {
            Write-Host "  Erreur detectee: $gitError" -ForegroundColor Red
        }
        
        $retry++
        if ($retry -lt $maxRetries) {
            Write-Host "  Nouvelle tentative dans 15 secondes..." -ForegroundColor Yellow
            Start-Sleep -Seconds 15
        }
    }
    
    Write-Host "  Push echoue apres $maxRetries tentatives" -ForegroundColor Red
    return $false
}

# Vérifier l'état Git
Write-Host "1. Vérification de l'état Git..." -ForegroundColor Yellow
$status = git status --short
if ($status) {
    Write-Host "  Des modifications ont ete detectees" -ForegroundColor White
} else {
    Write-Host "  Aucun fichier modifie (tout est peut-etre deja commite)" -ForegroundColor Green
}

# Vérifier si un commit existe déjà localement (non pushé)
Write-Host ""
Write-Host "2. Vérification du commit existant..." -ForegroundColor Yellow
$unpushed = git cherry -v 2>&1
if ($unpushed -and ($unpushed -notmatch "fatal") -and ($unpushed.Trim() -ne "")) {
    Write-Host "  Commits non pushes detectes. Annulation pour division..." -ForegroundColor Yellow
    
    # On essaie de reset HEAD~1, si ça échoue (car premier commit), on utilise update-ref
    git reset --soft HEAD~1 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  Premier commit detecte, utilisation de la methode alternative..." -ForegroundColor Gray
        git update-ref -d HEAD
    }
    
    Write-Host "  Fichiers conserves en staging pour division" -ForegroundColor Green
} else {
    Write-Host "  Aucun commit non pushe detecte" -ForegroundColor White
}

# Configuration Git optimale pour gros volumes
Write-Host ""
Write-Host "4. Configuration Git optimale..." -ForegroundColor Yellow
git config core.compression 0
git config http.postBuffer 52428800
git config http.lowSpeedTime 999999
git config http.lowSpeedLimit 0
Write-Host "  Configuration appliquee (Buffer 50MB)" -ForegroundColor Green

# Vérifier le remote
Write-Host ""
Write-Host "5. Mise a jour du repository distant..." -ForegroundColor Yellow
git remote set-url origin $repoUrl
$remoteCheck = git remote -v
Write-Host "  $($remoteCheck[0])" -ForegroundColor Gray

Write-Host ""
Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host "  DEBUT DU PUSH EN 8 PARTIES (Plus granulaire)" -ForegroundColor Cyan
Write-Host "===================================================================" -ForegroundColor Cyan

# Commit 1: Code Source React/TypeScript (src/)
Write-Host ""
Write-Host "Partie 1/8: Code Source React/TypeScript..." -ForegroundColor Cyan
git add src/
$commitResult = git commit -m "$commitPrefix - Partie 1: src/" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "src")) { exit 1 }
} else {
    Write-Host "  Rien a ajouter dans src/" -ForegroundColor Yellow
}

# Commit 2: Backend Python (Scripts seulement)
Write-Host ""
Write-Host "Partie 2/8: Backend Python (Scripts)..." -ForegroundColor Cyan
git add py_backend/*.py
$commitResult = git commit -m "$commitPrefix - Partie 2: py_backend scripts" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "py_backend scripts")) { exit 1 }
} else {
    Write-Host "  Rien a ajouter dans py_backend scripts" -ForegroundColor Yellow
}

# Commit 3: Backend Python (Excels)
Write-Host ""
Write-Host "Partie 3/8: Backend Python (Workbooks)..." -ForegroundColor Cyan
git add py_backend/*.xlsx py_backend/*.xlsm py_backend/*.xls
$commitResult = git commit -m "$commitPrefix - Partie 3: py_backend excels" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "py_backend excels")) { exit 1 }
} else {
    Write-Host "  Rien a ajouter dans py_backend excels" -ForegroundColor Yellow
}

# Commit 4: Backend Python (Reste)
Write-Host ""
Write-Host "Partie 4/8: Backend Python (Reste)..." -ForegroundColor Cyan
git add py_backend/
$commitResult = git commit -m "$commitPrefix - Partie 4: py_backend reste" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "py_backend reste")) { exit 1 }
} else {
    Write-Host "  Rien a ajouter dans py_backend reste" -ForegroundColor Yellow
}

# Commit 5: Fichiers Publics
Write-Host ""
Write-Host "Partie 5/8: Fichiers Publics..." -ForegroundColor Cyan
git add public/
$commitResult = git commit -m "$commitPrefix - Partie 5: public/" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "public")) { exit 1 }
} else {
    Write-Host "  Rien a ajouter dans public/" -ForegroundColor Yellow
}

# Commit 6: Documentation principales
Write-Host ""
Write-Host "Partie 6/8: Documentation principale 1..." -ForegroundColor Cyan
git add "Doc menu demarrer/" "Doc export rapport/" "Doc_Lead_Balance/"
$commitResult = git commit -m "$commitPrefix - Partie 6: Docs 1" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Docs 1")) { exit 1 }
} else {
    Write-Host "  Rien a ajouter dans Docs 1" -ForegroundColor Yellow
}

# Commit 7: Documentation principales suite
Write-Host ""
Write-Host "Partie 7/8: Documentation principale 2..." -ForegroundColor Cyan
git add "Doc_Etat_Fin/" "Doc backend switch/" "Doc_AIONUI/" "Doc_Export_Etats_Fin/"
$commitResult = git commit -m "$commitPrefix - Partie 7: Docs 2" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Docs 2")) { exit 1 }
} else {
    Write-Host "  Rien a ajouter dans Docs 2" -ForegroundColor Yellow
}

# Commit 8: Fichiers Restants
Write-Host ""
Write-Host "Partie 8/8: Fichiers Restants..." -ForegroundColor Cyan
git add .
$commitResult = git commit -m "$commitPrefix - Partie 8: Reste" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Reste")) { exit 1 }
} else {
    Write-Host "  Rien a ajouter dans le reste" -ForegroundColor Yellow
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
