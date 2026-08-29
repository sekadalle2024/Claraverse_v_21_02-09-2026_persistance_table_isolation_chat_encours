# ============================================================================
# Script de Push en Commits Multiples - ClaraVerse V5 - 28 Avril 2026
# Pour projets > 100 MB
# Repository: https://github.com/sekadalle2024/Claverse_windows__v_14_28-04-2026_V5_docker_zeabur_ok_switch_editeur-.git
# ============================================================================

Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "   PUSH EN COMMITS MULTIPLES - CLARAVERSE V5" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$targetRepo = "https://github.com/sekadalle2024/Claverse_windows__v_14_28-04-2026_V5_docker_zeabur_ok_switch_editeur-.git"
$maxRetries = 3
$retryDelay = 5

# Fonction de push avec retry
function Push-WithRetry {
    param(
        [string]$branch,
        [int]$maxRetries,
        [int]$retryDelay
    )
    
    $retryCount = 0
    $success = $false
    
    while ($retryCount -lt $maxRetries -and -not $success) {
        $retryCount++
        Write-Host "  Push tentative $retryCount/$maxRetries..." -ForegroundColor Yellow
        
        git push -u origin $branch 2>&1 | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            $success = $true
            Write-Host "  Push reussi!" -ForegroundColor Green
        } else {
            if ($retryCount -lt $maxRetries) {
                Write-Host "  Echec. Nouvelle tentative dans $retryDelay secondes..." -ForegroundColor Red
                Start-Sleep -Seconds $retryDelay
            }
        }
    }
    
    return $success
}

# Étape 1: Vérification initiale
Write-Host "Etape 1: Verification de l'etat Git..." -ForegroundColor Yellow
$currentBranch = git branch --show-current
Write-Host "Branche actuelle: $currentBranch" -ForegroundColor Cyan

# Vérifier s'il y a un commit existant à annuler
$lastCommit = git log -1 --oneline 2>$null
if ($lastCommit -and (git diff --cached --quiet)) {
    Write-Host "Detection d'un commit existant. Annulation pour division..." -ForegroundColor Yellow
    git reset --soft HEAD~1
    Write-Host "Commit annule. Fichiers conserves dans staging area." -ForegroundColor Green
}
Write-Host ""

# Étape 2: Configuration Git
Write-Host "Etape 2: Configuration Git optimale..." -ForegroundColor Yellow
git config core.compression 0
git config http.postBuffer 1048576000
git config http.lowSpeedTime 999999
git config http.lowSpeedLimit 0
Write-Host "Configuration appliquee" -ForegroundColor Green
Write-Host ""

# Étape 3: Vérification du repository distant
Write-Host "Etape 3: Configuration du repository distant..." -ForegroundColor Yellow
$currentRemote = git remote get-url origin 2>$null
if ($currentRemote -ne $targetRepo) {
    git remote set-url origin $targetRepo
    Write-Host "Remote mis a jour" -ForegroundColor Green
} else {
    Write-Host "Remote deja configure" -ForegroundColor Green
}
git remote -v
Write-Host ""

# Étape 4: Division en commits multiples
Write-Host "Etape 4: Creation de commits multiples..." -ForegroundColor Yellow
Write-Host "Division du projet en 6 parties pour eviter les timeouts" -ForegroundColor Cyan
Write-Host ""

$allSuccess = $true

# Partie 1: Code Source React/TypeScript
Write-Host "Partie 1/6: Code Source React/TypeScript..." -ForegroundColor Cyan
git add src/
$hasChanges = -not (git diff --cached --quiet)
if ($hasChanges) {
    git commit -m "V5 - Partie 1/6: Code Source React/TypeScript - 28 Avril 2026"
    $success = Push-WithRetry -branch $currentBranch -maxRetries $maxRetries -retryDelay $retryDelay
    if (-not $success) {
        Write-Host "  ERREUR: Push echoue pour Partie 1" -ForegroundColor Red
        $allSuccess = $false
    }
} else {
    Write-Host "  Aucun fichier a commiter dans src/" -ForegroundColor Yellow
}
Write-Host ""

# Partie 2: Backend Python
if ($allSuccess) {
    Write-Host "Partie 2/6: Backend Python..." -ForegroundColor Cyan
    git add py_backend/
    $hasChanges = -not (git diff --cached --quiet)
    if ($hasChanges) {
        git commit -m "V5 - Partie 2/6: Backend Python - 28 Avril 2026"
        $success = Push-WithRetry -branch $currentBranch -maxRetries $maxRetries -retryDelay $retryDelay
        if (-not $success) {
            Write-Host "  ERREUR: Push echoue pour Partie 2" -ForegroundColor Red
            $allSuccess = $false
        }
    } else {
        Write-Host "  Aucun fichier a commiter dans py_backend/" -ForegroundColor Yellow
    }
    Write-Host ""
}

# Partie 3: Fichiers Publics
if ($allSuccess) {
    Write-Host "Partie 3/6: Fichiers Publics..." -ForegroundColor Cyan
    git add public/
    $hasChanges = -not (git diff --cached --quiet)
    if ($hasChanges) {
        git commit -m "V5 - Partie 3/6: Fichiers Publics - 28 Avril 2026"
        $success = Push-WithRetry -branch $currentBranch -maxRetries $maxRetries -retryDelay $retryDelay
        if (-not $success) {
            Write-Host "  ERREUR: Push echoue pour Partie 3" -ForegroundColor Red
            $allSuccess = $false
        }
    } else {
        Write-Host "  Aucun fichier a commiter dans public/" -ForegroundColor Yellow
    }
    Write-Host ""
}

# Partie 4: Documentation principale
if ($allSuccess) {
    Write-Host "Partie 4/6: Documentation principale..." -ForegroundColor Cyan
    git add "Doc menu demarrer/" "Doc export rapport/" "Doc_Etat_Fin/" "Doc_Lead_Balance/" "Doc zeabur docker/" "Doc backend switch/"
    $hasChanges = -not (git diff --cached --quiet)
    if ($hasChanges) {
        git commit -m "V5 - Partie 4/6: Documentation principale - 28 Avril 2026"
        $success = Push-WithRetry -branch $currentBranch -maxRetries $maxRetries -retryDelay $retryDelay
        if (-not $success) {
            Write-Host "  ERREUR: Push echoue pour Partie 4" -ForegroundColor Red
            $allSuccess = $false
        }
    } else {
        Write-Host "  Aucun fichier a commiter dans la documentation" -ForegroundColor Yellow
    }
    Write-Host ""
}

# Partie 5: Autres documentations
if ($allSuccess) {
    Write-Host "Partie 5/6: Autres documentations..." -ForegroundColor Cyan
    git add "Doc_Github_Issue/" "Doc cross ref documentaire menu/" "Doc papier de travail javascript/" "Doc backend github/" "*.md" "*.txt"
    $hasChanges = -not (git diff --cached --quiet)
    if ($hasChanges) {
        git commit -m "V5 - Partie 5/6: Autres documentations - 28 Avril 2026"
        $success = Push-WithRetry -branch $currentBranch -maxRetries $maxRetries -retryDelay $retryDelay
        if (-not $success) {
            Write-Host "  ERREUR: Push echoue pour Partie 5" -ForegroundColor Red
            $allSuccess = $false
        }
    } else {
        Write-Host "  Aucun fichier a commiter dans les autres docs" -ForegroundColor Yellow
    }
    Write-Host ""
}

# Partie 6: Fichiers restants
if ($allSuccess) {
    Write-Host "Partie 6/6: Fichiers Restants..." -ForegroundColor Cyan
    git add .
    $hasChanges = -not (git diff --cached --quiet)
    if ($hasChanges) {
        git commit -m "V5 - Partie 6/6: Configuration et fichiers restants - 28 Avril 2026"
        $success = Push-WithRetry -branch $currentBranch -maxRetries $maxRetries -retryDelay $retryDelay
        if (-not $success) {
            Write-Host "  ERREUR: Push echoue pour Partie 6" -ForegroundColor Red
            $allSuccess = $false
        }
    } else {
        Write-Host "  Aucun fichier restant a commiter" -ForegroundColor Yellow
    }
    Write-Host ""
}

# Résultat final
Write-Host "============================================================================" -ForegroundColor Cyan
if ($allSuccess) {
    Write-Host "           PUSH TERMINE AVEC SUCCES" -ForegroundColor Green
    Write-Host "============================================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Verification finale..." -ForegroundColor Yellow
    git status
    Write-Host ""
    Write-Host "Repository GitHub:" -ForegroundColor Cyan
    Write-Host $targetRepo -ForegroundColor White
    Write-Host ""
    Write-Host "Branche: $currentBranch" -ForegroundColor Cyan
} else {
    Write-Host "           PUSH ECHOUE" -ForegroundColor Red
    Write-Host "============================================================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "SOLUTIONS:" -ForegroundColor Yellow
    Write-Host "1. Verifier la connexion Internet" -ForegroundColor White
    Write-Host "2. Relancer le script (il reprendra ou il s'est arrete)" -ForegroundColor White
    Write-Host "3. Utiliser GitHub Desktop comme alternative" -ForegroundColor White
}
Write-Host ""
