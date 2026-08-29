# Script de Push ClaraVerse V17 - 23 Mai 2026
# Repository: https://github.com/sekadalle2024/Claverse_windows__v_17_23-05-2026_V5_docker_zeabur_ok_switch_editeur-.git
# Solution: Commits Multiples pour Projet Volumineux

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  PUSH CLARAVERSE V17 - 23 MAI 2026                              " -ForegroundColor Cyan
Write-Host "  Solution: Commits Multiples pour Projet Volumineux            " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$nouveauRepo = "https://github.com/sekadalle2024/Claverse_windows__v_17_23-05-2026_V5_docker_zeabur_ok_switch_editeur-.git"
$branche = "main"
$commitPrefix = "Sauvegarde ClaraVerse V17 - 23 Mai 2026"

# Fonction pour push avec retry
function Push-WithRetry {
    param(
        [string]$message,
        [int]$maxRetries = 3
    )
    
    $retry = 0
    while ($retry -lt $maxRetries) {
        Write-Host "  Push tentative $($retry + 1)/$maxRetries..." -ForegroundColor Gray
        
        $pushOutput = git push origin $branche 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  [OK] Push reussi: $message" -ForegroundColor Green
            return $true
        }
        
        $retry++
        if ($retry -lt $maxRetries) {
            Write-Host "  [!] Echec, nouvelle tentative dans 5 secondes..." -ForegroundColor Yellow
            Start-Sleep -Seconds 5
        }
    }
    
    Write-Host "  [X] Push echoue apres $maxRetries tentatives" -ForegroundColor Red
    Write-Host "  Erreur: $pushOutput" -ForegroundColor Red
    return $false
}

# Etape 1: Verifier l etat Git
Write-Host "1. Verification de l etat Git..." -ForegroundColor Yellow
$status = git status --short
if ($status) {
    Write-Host "  [OK] Fichiers modifies detectes" -ForegroundColor Green
    $fileCount = ($status | Measure-Object).Count
    Write-Host "  [INFO] $fileCount fichiers a traiter" -ForegroundColor Gray
} else {
    Write-Host "  [!] Aucun fichier modifie detecte" -ForegroundColor Yellow
    Write-Host "  Verification de l etat complet..." -ForegroundColor Gray
    git status
    Write-Host ""
    $continue = Read-Host "Voulez-vous continuer quand meme? (O/N)"
    if ($continue -ne "O" -and $continue -ne "o") {
        Write-Host "[X] Operation annulee" -ForegroundColor Red
        exit 0
    }
}

# Etape 2: Verifier la branche actuelle
Write-Host ""
Write-Host "2. Verification de la branche..." -ForegroundColor Yellow
$currentBranch = git branch --show-current
Write-Host "  [INFO] Branche actuelle: $currentBranch" -ForegroundColor Gray

if ($currentBranch -ne $branche) {
    Write-Host "  [!] Vous n etes pas sur la branche '$branche'" -ForegroundColor Yellow
    $switch = Read-Host "Voulez-vous basculer sur '$branche'? (O/N)"
    if ($switch -eq "O" -or $switch -eq "o") {
        git checkout $branche
        Write-Host "  [OK] Bascule sur la branche '$branche'" -ForegroundColor Green
    } else {
        Write-Host "[X] Operation annulee" -ForegroundColor Red
        exit 0
    }
}

# Etape 3: Verifier le repository distant actuel
Write-Host ""
Write-Host "3. Verification du repository distant..." -ForegroundColor Yellow
$currentRemote = git remote get-url origin
Write-Host "  [INFO] Repository actuel: $currentRemote" -ForegroundColor Gray

# Etape 4: Changer le repository distant
Write-Host ""
Write-Host "4. Configuration du nouveau repository..." -ForegroundColor Yellow
Write-Host "  [INFO] Nouveau repository: $nouveauRepo" -ForegroundColor Cyan
$confirm = Read-Host "Confirmer le changement de repository? (O/N)"
if ($confirm -ne "O" -and $confirm -ne "o") {
    Write-Host "[X] Operation annulee" -ForegroundColor Red
    exit 0
}

git remote set-url origin $nouveauRepo
$remoteCheck = git remote -v
Write-Host "  [OK] Repository distant mis a jour:" -ForegroundColor Green
$remoteCheck | ForEach-Object { Write-Host "     $_" -ForegroundColor Gray }

# Etape 5: Configuration Git optimale pour gros projets
Write-Host ""
Write-Host "5. Configuration Git optimale..." -ForegroundColor Yellow
git config core.compression 0
git config http.postBuffer 1048576000
git config http.lowSpeedTime 999999
git config http.lowSpeedLimit 0
Write-Host "  [OK] Configuration appliquee:" -ForegroundColor Green
Write-Host "     - Compression: desactivee" -ForegroundColor Gray
Write-Host "     - Buffer HTTP: 1 GB" -ForegroundColor Gray
Write-Host "     - Timeout: desactive" -ForegroundColor Gray

Write-Host ""
Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host "  DEBUT DU PUSH EN 6 PARTIES" -ForegroundColor Cyan
Write-Host "===================================================================" -ForegroundColor Cyan

$successCount = 0
$totalParts = 6

# Partie 1: Code Source React/TypeScript (src/)
Write-Host ""
Write-Host "Partie 1/${totalParts}: Code Source React/TypeScript..." -ForegroundColor Cyan
git add src/
$commitResult = git commit -m "$commitPrefix - Partie 1: Code Source React/TypeScript" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  [INFO] Commit cree" -ForegroundColor Green
    if (Push-WithRetry "Code Source") {
        $successCount++
    } else {
        Write-Host ""
        Write-Host "[X] ECHEC - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  [!] Aucun fichier a commiter dans src/" -ForegroundColor Yellow
}

# Partie 2: Backend Python
Write-Host ""
Write-Host "Partie 2/${totalParts}: Backend Python..." -ForegroundColor Cyan
git add py_backend/
$commitResult = git commit -m "$commitPrefix - Partie 2: Backend Python" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  [INFO] Commit cree" -ForegroundColor Green
    if (Push-WithRetry "Backend Python") {
        $successCount++
    } else {
        Write-Host ""
        Write-Host "[X] ECHEC - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  [!] Aucun fichier a commiter dans py_backend/" -ForegroundColor Yellow
}

# Partie 3: Fichiers Publics
Write-Host ""
Write-Host "Partie 3/${totalParts}: Fichiers Publics..." -ForegroundColor Cyan
git add public/
$commitResult = git commit -m "$commitPrefix - Partie 3: Fichiers Publics" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  [INFO] Commit cree" -ForegroundColor Green
    if (Push-WithRetry "Fichiers Publics") {
        $successCount++
    } else {
        Write-Host ""
        Write-Host "[X] ECHEC - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  [!] Aucun fichier a commiter dans public/" -ForegroundColor Yellow
}

# Partie 4: Documentation principale
Write-Host ""
Write-Host "Partie 4/${totalParts}: Documentation principale..." -ForegroundColor Cyan
git add "Doc menu demarrer/" "Doc export rapport/" "Doc_Lead_Balance/" "Doc_Etat_Fin/" "Doc zeabur docker/" "Doc backend switch/"
$commitResult = git commit -m "$commitPrefix - Partie 4: Documentation principale" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  [INFO] Commit cree" -ForegroundColor Green
    if (Push-WithRetry "Documentation principale") {
        $successCount++
    } else {
        Write-Host ""
        Write-Host "[X] ECHEC - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  [!] Aucun fichier a commiter dans la documentation" -ForegroundColor Yellow
}

# Partie 5: Autres documentations et fichiers texte
Write-Host ""
Write-Host "Partie 5/${totalParts}: Autres documentations..." -ForegroundColor Cyan
git add *.md *.txt "Doc_Github_Issue/" "Doc Koyeb deploy/" "deploiement-netlify/" "Doc papier de travail javascript/" "Doc cross ref documentaire menu/"
$commitResult = git commit -m "$commitPrefix - Partie 5: Autres documentations" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  [INFO] Commit cree" -ForegroundColor Green
    if (Push-WithRetry "Autres documentations") {
        $successCount++
    } else {
        Write-Host ""
        Write-Host "[X] ECHEC - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  [!] Aucun fichier a commiter" -ForegroundColor Yellow
}

# Partie 6: Fichiers Restants (configuration, scripts, etc.)
Write-Host ""
Write-Host "Partie 6/${totalParts}: Fichiers Restants..." -ForegroundColor Cyan
git add .
$commitResult = git commit -m "$commitPrefix - Partie 6: Configuration et Fichiers Divers" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  [INFO] Commit cree" -ForegroundColor Green
    if (Push-WithRetry "Fichiers Restants") {
        $successCount++
    } else {
        Write-Host ""
        Write-Host "[X] ECHEC - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  [!] Aucun fichier restant a commiter" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Green
Write-Host "           [OK] PUSH TERMINE AVEC SUCCES                         " -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "[INFO] Statistiques:" -ForegroundColor Yellow
Write-Host "   - Parties pushees avec succes: $successCount/$totalParts" -ForegroundColor White
Write-Host ""
Write-Host "[INFO] Verification finale..." -ForegroundColor Yellow
git status
Write-Host ""
Write-Host "[INFO] Repository GitHub:" -ForegroundColor Cyan
Write-Host "   $nouveauRepo" -ForegroundColor White
Write-Host ""
Write-Host "[INFO] Prochaines etapes:" -ForegroundColor Yellow
Write-Host "   1. Verifier sur GitHub que tous les fichiers sont presents" -ForegroundColor White
Write-Host "   2. Tester le deploiement si necessaire" -ForegroundColor White
Write-Host "   3. Creer un tag de version si souhaite" -ForegroundColor White
Write-Host ""
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  MISSION ACCOMPLIE - 23 MAI 2026                                " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
