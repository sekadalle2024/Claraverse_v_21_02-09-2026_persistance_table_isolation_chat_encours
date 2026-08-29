# ============================================================================
# Script de Push en Commits Multiples - ClaraVerse V16 - 04 Mai 2026
# Pour projets > 100 MB
# ============================================================================

Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "   PUSH EN COMMITS MULTIPLES - CLARAVERSE V16" -ForegroundColor Cyan
Write-Host "   Solution pour projets volumineux (> 100 MB)" -ForegroundColor Cyan
Write-Host "============================================================================`n" -ForegroundColor Cyan

# Fonction pour afficher les messages
function Write-Step {
    param([string]$Message, [string]$Color = "Yellow")
    Write-Host "`n>>> $Message" -ForegroundColor $Color
}

function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

# Fonction pour pusher avec retry
function Push-WithRetry {
    param(
        [string]$Branch,
        [int]$MaxRetries = 3,
        [int]$RetryDelay = 5
    )
    
    for ($i = 1; $i -le $MaxRetries; $i++) {
        Write-Host "  Push tentative $i/$MaxRetries..." -ForegroundColor Yellow
        
        git push -u origin $Branch 2>&1 | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "  Push réussi"
            return $true
        } else {
            Write-Error "  Échec de la tentative $i"
            if ($i -lt $MaxRetries) {
                Write-Host "  Nouvelle tentative dans $RetryDelay secondes..." -ForegroundColor Yellow
                Start-Sleep -Seconds $RetryDelay
            }
        }
    }
    
    return $false
}

# ============================================================================
# ÉTAPE 1: Vérification initiale
# ============================================================================

Write-Step "ÉTAPE 1: Vérification de l'état Git" "Cyan"

$currentBranch = git branch --show-current
Write-Host "Branche actuelle: $currentBranch" -ForegroundColor Cyan

# Vérifier s'il y a un commit non pushé
$unpushedCommits = git log origin/$currentBranch..$currentBranch --oneline 2>$null
if ($unpushedCommits) {
    Write-Host "`nCommits non pushés détectés:" -ForegroundColor Yellow
    Write-Host $unpushedCommits
    
    Write-Host "`nAnnulation du dernier commit pour le diviser..." -ForegroundColor Yellow
    git reset --soft HEAD~1
    Write-Success "Commit annulé, fichiers conservés"
}

# Vérifier les fichiers modifiés
$gitStatus = git status --porcelain
if (-not $gitStatus) {
    Write-Success "Aucun fichier à commiter"
    Write-Host "`nTout est déjà sur GitHub !" -ForegroundColor Green
    exit 0
}

# ============================================================================
# ÉTAPE 2: Configuration Git
# ============================================================================

Write-Step "ÉTAPE 2: Configuration Git optimale" "Cyan"

git config core.compression 0
git config http.postBuffer 1048576000
git config http.lowSpeedTime 999999
git config http.lowSpeedLimit 0

Write-Success "Configuration appliquée"

# ============================================================================
# ÉTAPE 3: Vérification du repository distant
# ============================================================================

Write-Step "ÉTAPE 3: Vérification du repository distant" "Cyan"

$remoteUrl = git remote get-url origin
Write-Host "Repository: $remoteUrl" -ForegroundColor Cyan

# Tester la connexion
Write-Host "Test de connexion..." -ForegroundColor Yellow
git ls-remote origin HEAD 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Success "Connexion au repository OK"
} else {
    Write-Error "Impossible de se connecter au repository"
    exit 1
}

# ============================================================================
# ÉTAPE 4: Division en commits multiples
# ============================================================================

Write-Step "ÉTAPE 4: Création de commits séparés" "Cyan"

$totalParts = 6
$currentPart = 0
$failedPush = $false

# ============================================================================
# PARTIE 1: Code Source React/TypeScript
# ============================================================================

$currentPart++
Write-Host "`n[$currentPart/$totalParts] Code Source React/TypeScript (src/)..." -ForegroundColor Cyan

git add src/ 2>$null
$hasChanges = git diff --cached --quiet; $LASTEXITCODE -ne 0

if ($hasChanges) {
    git commit -m "V16 - Partie 1/6: Code Source React/TypeScript

- Composants React mis à jour
- Services TypeScript
- Types et interfaces
- Styles CSS"
    
    if (Push-WithRetry -Branch $currentBranch) {
        Write-Success "Partie 1/6 pushée avec succès"
    } else {
        Write-Error "Échec du push de la partie 1/6"
        $failedPush = $true
    }
} else {
    Write-Host "  Aucun fichier à commiter dans src/" -ForegroundColor Gray
}

if ($failedPush) { exit 1 }

# ============================================================================
# PARTIE 2: Backend Python
# ============================================================================

$currentPart++
Write-Host "`n[$currentPart/$totalParts] Backend Python (py_backend/)..." -ForegroundColor Cyan

git add py_backend/ 2>$null
$hasChanges = git diff --cached --quiet; $LASTEXITCODE -ne 0

if ($hasChanges) {
    git commit -m "V16 - Partie 2/6: Backend Python

- API Flask/FastAPI
- Scripts de calcul
- Modules Python
- Configuration backend"
    
    if (Push-WithRetry -Branch $currentBranch) {
        Write-Success "Partie 2/6 pushée avec succès"
    } else {
        Write-Error "Échec du push de la partie 2/6"
        $failedPush = $true
    }
} else {
    Write-Host "  Aucun fichier à commiter dans py_backend/" -ForegroundColor Gray
}

if ($failedPush) { exit 1 }

# ============================================================================
# PARTIE 3: Fichiers Publics
# ============================================================================

$currentPart++
Write-Host "`n[$currentPart/$totalParts] Fichiers Publics (public/)..." -ForegroundColor Cyan

git add public/ 2>$null
$hasChanges = git diff --cached --quiet; $LASTEXITCODE -ne 0

if ($hasChanges) {
    git commit -m "V16 - Partie 3/6: Fichiers Publics

- Assets statiques
- Scripts JavaScript
- Handlers et triggers
- Fichiers HTML"
    
    if (Push-WithRetry -Branch $currentBranch) {
        Write-Success "Partie 3/6 pushée avec succès"
    } else {
        Write-Error "Échec du push de la partie 3/6"
        $failedPush = $true
    }
} else {
    Write-Host "  Aucun fichier à commiter dans public/" -ForegroundColor Gray
}

if ($failedPush) { exit 1 }

# ============================================================================
# PARTIE 4: Documentation Principale
# ============================================================================

$currentPart++
Write-Host "`n[$currentPart/$totalParts] Documentation Principale..." -ForegroundColor Cyan

git add "Doc menu demarrer/" "Doc export rapport/" "Doc_Etat_Fin/" "Doc_Lead_Balance/" "Doc cross ref documentaire menu/" 2>$null
$hasChanges = git diff --cached --quiet; $LASTEXITCODE -ne 0

if ($hasChanges) {
    git commit -m "V16 - Partie 4/6: Documentation Principale

- Doc menu démarrer
- Doc export rapport
- Doc états financiers
- Doc lead balance
- Doc cross-référence"
    
    if (Push-WithRetry -Branch $currentBranch) {
        Write-Success "Partie 4/6 pushée avec succès"
    } else {
        Write-Error "Échec du push de la partie 4/6"
        $failedPush = $true
    }
} else {
    Write-Host "  Aucun fichier à commiter dans la documentation principale" -ForegroundColor Gray
}

if ($failedPush) { exit 1 }

# ============================================================================
# PARTIE 5: Documentation Technique
# ============================================================================

$currentPart++
Write-Host "`n[$currentPart/$totalParts] Documentation Technique..." -ForegroundColor Cyan

git add "Doc zeabur docker/" "Doc backend*/" "Doc render deploy/" "Doc Koyeb deploy/" "Doc_Github_Issue/" 2>$null
$hasChanges = git diff --cached --quiet; $LASTEXITCODE -ne 0

if ($hasChanges) {
    git commit -m "V16 - Partie 5/6: Documentation Technique

- Doc Zeabur/Docker
- Doc backend GitHub
- Doc déploiement
- Doc GitHub issues
- Guides techniques"
    
    if (Push-WithRetry -Branch $currentBranch) {
        Write-Success "Partie 5/6 pushée avec succès"
    } else {
        Write-Error "Échec du push de la partie 5/6"
        $failedPush = $true
    }
} else {
    Write-Host "  Aucun fichier à commiter dans la documentation technique" -ForegroundColor Gray
}

if ($failedPush) { exit 1 }

# ============================================================================
# PARTIE 6: Fichiers Restants
# ============================================================================

$currentPart++
Write-Host "`n[$currentPart/$totalParts] Fichiers Restants (config, docs, etc.)..." -ForegroundColor Cyan

git add . 2>$null
$hasChanges = git diff --cached --quiet; $LASTEXITCODE -ne 0

if ($hasChanges) {
    git commit -m "V16 - Partie 6/6: Configuration et Fichiers Divers

- Fichiers de configuration
- Documentation markdown
- Scripts PowerShell
- Fichiers Docker
- Autres fichiers"
    
    if (Push-WithRetry -Branch $currentBranch) {
        Write-Success "Partie 6/6 pushée avec succès"
    } else {
        Write-Error "Échec du push de la partie 6/6"
        $failedPush = $true
    }
} else {
    Write-Host "  Aucun fichier à commiter" -ForegroundColor Gray
}

# ============================================================================
# ÉTAPE 5: Vérification finale
# ============================================================================

Write-Step "ÉTAPE 5: Vérification finale" "Cyan"

if (-not $failedPush) {
    Write-Host "`n============================================================================" -ForegroundColor Green
    Write-Host "           PUSH TERMINÉ AVEC SUCCÈS" -ForegroundColor Green
    Write-Host "============================================================================`n" -ForegroundColor Green
    
    Write-Host "Vérification finale..." -ForegroundColor Cyan
    git status
    
    Write-Host "`nRepository GitHub:" -ForegroundColor Cyan
    Write-Host "https://github.com/sekadalle2024/Claverse_windows__v_16_04-05-2026_V5_docker_zeabur_ok_switch_editeur-.git" -ForegroundColor Blue
    
} else {
    Write-Host "`n============================================================================" -ForegroundColor Red
    Write-Host "           ÉCHEC DU PUSH" -ForegroundColor Red
    Write-Host "============================================================================`n" -ForegroundColor Red
    
    Write-Host "Une ou plusieurs parties n'ont pas pu être pushées." -ForegroundColor Red
    Write-Host "`nSolutions:" -ForegroundColor Yellow
    Write-Host "1. Vérifier votre connexion Internet" -ForegroundColor White
    Write-Host "2. Relancer le script (il reprendra où il s'est arrêté)" -ForegroundColor White
    Write-Host "3. Utiliser GitHub Desktop" -ForegroundColor White
    
    exit 1
}
