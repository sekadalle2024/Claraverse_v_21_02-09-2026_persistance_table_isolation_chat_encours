# Script de push ClaraVerse V5 - 29 Avril 2026
# Version simplifiee sans caracteres speciaux

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  Push ClaraVerse V5 - 29 Avril 2026                            " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$repoUrl = "https://github.com/sekadalle2024/Claverse_windows__v_14_29-04-2026_V5_docker_zeabur_ok_switch_editeur-.git"
$branche = "master"
$commitPrefix = "Sauvegarde ClaraVerse V5 - 29 Avril 2026"

# Fonction pour push avec retry
function Push-WithRetry {
    param(
        [string]$message,
        [int]$maxRetries = 3
    )
    
    $retry = 0
    while ($retry -lt $maxRetries) {
        Write-Host "  Push tentative $($retry + 1)/$maxRetries..." -ForegroundColor Gray
        
        $output = git push origin $branche 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  OK Push reussi: $message" -ForegroundColor Green
            return $true
        }
        
        # Verifier si c'est un probleme de secret
        if ($output -match "secret") {
            Write-Host "  ATTENTION Secret detecte par GitHub" -ForegroundColor Yellow
            Write-Host "  Les fichiers .md avec credentials seront exclus" -ForegroundColor Yellow
            return $false
        }
        
        $retry++
        if ($retry -lt $maxRetries) {
            Write-Host "  Echec, nouvelle tentative dans 5 secondes..." -ForegroundColor Yellow
            Start-Sleep -Seconds 5
        }
    }
    
    Write-Host "  ERREUR Push echoue apres $maxRetries tentatives" -ForegroundColor Red
    return $false
}

# Verifier l'etat Git
Write-Host "1. Verification de l'etat Git..." -ForegroundColor Yellow
$statusCount = (git status --short | Measure-Object).Count
Write-Host "  $statusCount fichiers modifies detectes" -ForegroundColor White

# Configuration Git optimale
Write-Host ""
Write-Host "2. Configuration Git optimale..." -ForegroundColor Yellow
git config core.compression 0
git config http.postBuffer 1048576000
git config http.lowSpeedTime 999999
git config http.lowSpeedLimit 0
Write-Host "  OK Configuration appliquee" -ForegroundColor Green

# Changer le remote vers le nouveau repository
Write-Host ""
Write-Host "3. Configuration du repository distant..." -ForegroundColor Yellow
git remote set-url origin $repoUrl
$remoteCheck = git remote -v | Select-Object -First 1
Write-Host "  $remoteCheck" -ForegroundColor Gray

# Verifier la branche
Write-Host ""
Write-Host "4. Verification de la branche..." -ForegroundColor Yellow
$currentBranch = git branch --show-current
Write-Host "  Branche actuelle: $currentBranch" -ForegroundColor White

if ($currentBranch -ne $branche) {
    Write-Host "  Changement vers la branche $branche..." -ForegroundColor Yellow
    git checkout $branche
}

Write-Host ""
Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host "  DEBUT DU PUSH EN 7 PARTIES                                     " -ForegroundColor Cyan
Write-Host "===================================================================" -ForegroundColor Cyan

# Commit 1: Code Source React/TypeScript (src/)
Write-Host ""
Write-Host "Partie 1/7: Code Source React/TypeScript..." -ForegroundColor Cyan
git add src/
$commitResult = git commit -m "$commitPrefix - Partie 1: Code Source React/TypeScript" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Code Source")) {
        Write-Host ""
        Write-Host "ERREUR - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  Aucun fichier a commiter dans src/" -ForegroundColor Yellow
}

# Commit 2: Backend Python
Write-Host ""
Write-Host "Partie 2/7: Backend Python..." -ForegroundColor Cyan
git add py_backend/
$commitResult = git commit -m "$commitPrefix - Partie 2: Backend Python" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Backend Python")) {
        Write-Host ""
        Write-Host "ERREUR - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  Aucun fichier a commiter dans py_backend/" -ForegroundColor Yellow
}

# Commit 3: Fichiers Publics
Write-Host ""
Write-Host "Partie 3/7: Fichiers Publics..." -ForegroundColor Cyan
git add public/
$commitResult = git commit -m "$commitPrefix - Partie 3: Fichiers Publics" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Fichiers Publics")) {
        Write-Host ""
        Write-Host "ERREUR - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  Aucun fichier a commiter dans public/" -ForegroundColor Yellow
}

# Commit 4: Documentation principale
Write-Host ""
Write-Host "Partie 4/7: Documentation principale..." -ForegroundColor Cyan
git add "Doc menu demarrer/" "Doc export rapport/" "Doc_Lead_Balance/" "Doc_Etat_Fin/" "Doc backend switch/" "Doc papier de travail javascript/"
$commitResult = git commit -m "$commitPrefix - Partie 4: Documentation principale" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Documentation principale")) {
        Write-Host ""
        Write-Host "ERREUR - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  Aucun fichier a commiter dans la documentation" -ForegroundColor Yellow
}

# Commit 5: Documentation Docker/Zeabur
Write-Host ""
Write-Host "Partie 5/7: Documentation Docker/Zeabur..." -ForegroundColor Cyan
git add "Doc zeabur docker/" "Doc backend github/" "Doc render deploy/" "Doc Hugging Face deploy/"
$commitResult = git commit -m "$commitPrefix - Partie 5: Documentation Docker/Zeabur" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Documentation Docker")) {
        Write-Host ""
        Write-Host "ERREUR - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  Aucun fichier a commiter" -ForegroundColor Yellow
}

# Commit 6: Fichiers de configuration et scripts
Write-Host ""
Write-Host "Partie 6/7: Configuration et Scripts..." -ForegroundColor Cyan
git add *.ps1 *.json *.toml *.ts *.js *.html *.css .dockerignore .gitignore
$commitResult = git commit -m "$commitPrefix - Partie 6: Configuration et Scripts" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Configuration")) {
        Write-Host ""
        Write-Host "ERREUR - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  Aucun fichier a commiter" -ForegroundColor Yellow
}

# Commit 7: Documentation generale
Write-Host ""
Write-Host "Partie 7/7: Documentation generale..." -ForegroundColor Cyan
Write-Host "  Exclusion des fichiers avec credentials OAuth..." -ForegroundColor Yellow

# Ajouter tous les fichiers .md et .txt
git add *.md *.txt "Doc_Github_Issue/" "Doc Koyeb deploy/" "deploiement-netlify/" "Manuel E-audit/"

# Exclure specifiquement les fichiers avec credentials
git reset "Doc cross ref documentaire menu/GUIDE_CONFIGURATION_OAUTH2_GOOGLE_DRIVE.md" 2>$null
git reset "Doc cross ref documentaire menu/GUIDE_CONFIGURATION_CREDENTIALS_OAUTH2_28_AVRIL_2026.md" 2>$null
git reset "Doc cross ref documentaire menu/00_CONFIGURATION_CREDENTIALS_GOOGLE_DRIVE_28_AVRIL_2026.txt" 2>$null
git reset "Doc cross ref documentaire menu/00_CREDENTIALS_AVANCES_FOURNIS_28_AVRIL_2026.txt" 2>$null

$commitResult = git commit -m "$commitPrefix - Partie 7: Documentation generale" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Documentation generale")) {
        Write-Host ""
        Write-Host "ATTENTION: Si le push echoue a cause de secrets:" -ForegroundColor Yellow
        Write-Host "   1. Ouvrez les liens dans votre navigateur" -ForegroundColor White
        Write-Host "   2. Cliquez sur Allow secret pour chaque fichier" -ForegroundColor White
        Write-Host "   3. Relancez ce script" -ForegroundColor White
        Write-Host ""
        Write-Host "ERREUR - Verifiez les secrets" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  Aucun fichier restant a commiter" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Green
Write-Host "           OK PUSH TERMINE AVEC SUCCES                          " -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Verification finale..." -ForegroundColor Yellow
git status
Write-Host ""
Write-Host "Repository GitHub:" -ForegroundColor Cyan
Write-Host "   $repoUrl" -ForegroundColor White
Write-Host ""
Write-Host "Prochaines etapes:" -ForegroundColor Yellow
Write-Host "   1. Verifiez sur GitHub que tous les fichiers sont presents" -ForegroundColor White
Write-Host "   2. Verifiez que les credentials ne sont pas dans les fichiers" -ForegroundColor White
Write-Host ""
