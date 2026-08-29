# Script de push ClaraVerse V5 - SANS py_backend
# Version simplifiee pour contourner le probleme de secret

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  Push ClaraVerse V5 - SANS py_backend                          " -ForegroundColor Cyan
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
        
        $retry++
        if ($retry -lt $maxRetries) {
            Write-Host "  Echec, nouvelle tentative dans 5 secondes..." -ForegroundColor Yellow
            Start-Sleep -Seconds 5
        }
    }
    
    Write-Host "  ERREUR Push echoue apres $maxRetries tentatives" -ForegroundColor Red
    return $false
}

# Configuration Git optimale
Write-Host "1. Configuration Git optimale..." -ForegroundColor Yellow
git config core.compression 0
git config http.postBuffer 1048576000
git config http.lowSpeedTime 999999
git config http.lowSpeedLimit 0
Write-Host "  OK Configuration appliquee" -ForegroundColor Green

# Changer le remote
Write-Host ""
Write-Host "2. Configuration du repository distant..." -ForegroundColor Yellow
git remote set-url origin $repoUrl

# Commit 1: Code Source React/TypeScript
Write-Host ""
Write-Host "Partie 1/6: Code Source React/TypeScript..." -ForegroundColor Cyan
git add src/
$commitResult = git commit -m "$commitPrefix - Partie 1: Code Source React/TypeScript" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Code Source")) {
        Write-Host "ERREUR - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  Aucun fichier a commiter dans src/" -ForegroundColor Yellow
}

# Commit 2: Fichiers Publics
Write-Host ""
Write-Host "Partie 2/6: Fichiers Publics..." -ForegroundColor Cyan
git add public/
$commitResult = git commit -m "$commitPrefix - Partie 2: Fichiers Publics" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Fichiers Publics")) {
        Write-Host "ERREUR - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  Aucun fichier a commiter dans public/" -ForegroundColor Yellow
}

# Commit 3: Documentation principale
Write-Host ""
Write-Host "Partie 3/6: Documentation principale..." -ForegroundColor Cyan
git add "Doc menu demarrer/" "Doc export rapport/" "Doc_Lead_Balance/" "Doc_Etat_Fin/" "Doc backend switch/" "Doc papier de travail javascript/"
$commitResult = git commit -m "$commitPrefix - Partie 3: Documentation principale" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Documentation principale")) {
        Write-Host "ERREUR - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  Aucun fichier a commiter" -ForegroundColor Yellow
}

# Commit 4: Documentation Docker/Zeabur
Write-Host ""
Write-Host "Partie 4/6: Documentation Docker/Zeabur..." -ForegroundColor Cyan
git add "Doc zeabur docker/" "Doc backend github/" "Doc render deploy/" "Doc Hugging Face deploy/"
$commitResult = git commit -m "$commitPrefix - Partie 4: Documentation Docker/Zeabur" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Documentation Docker")) {
        Write-Host "ERREUR - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  Aucun fichier a commiter" -ForegroundColor Yellow
}

# Commit 5: Configuration et Scripts
Write-Host ""
Write-Host "Partie 5/6: Configuration et Scripts..." -ForegroundColor Cyan
git add *.ps1 *.json *.toml *.ts *.js *.html *.css .dockerignore .gitignore
$commitResult = git commit -m "$commitPrefix - Partie 5: Configuration et Scripts" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Configuration")) {
        Write-Host "ERREUR - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  Aucun fichier a commiter" -ForegroundColor Yellow
}

# Commit 6: Documentation generale
Write-Host ""
Write-Host "Partie 6/6: Documentation generale..." -ForegroundColor Cyan
git add *.md *.txt "Doc_Github_Issue/" "Doc Koyeb deploy/" "deploiement-netlify/" "Manuel E-audit/" "Doc cross ref documentaire menu/"
$commitResult = git commit -m "$commitPrefix - Partie 6: Documentation generale" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Documentation generale")) {
        Write-Host "ERREUR - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  Aucun fichier restant a commiter" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Green
Write-Host "           OK PUSH TERMINE (SANS py_backend)                    " -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "ATTENTION: py_backend/ n'a pas ete pousse" -ForegroundColor Yellow
Write-Host "Raison: GitHub a detecte un secret dans py_backend/" -ForegroundColor Yellow
Write-Host ""
Write-Host "Prochaine etape:" -ForegroundColor Cyan
Write-Host "  1. Identifier le secret dans py_backend/" -ForegroundColor White
Write-Host "  2. Le deplacer dans un fichier .env local" -ForegroundColor White
Write-Host "  3. Pousser py_backend/ separement" -ForegroundColor White
Write-Host ""
git status
