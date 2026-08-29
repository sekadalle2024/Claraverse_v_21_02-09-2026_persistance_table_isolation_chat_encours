# ============================================================================
# Script de Push en Commits Multiples - ClaraVerse V13
# Pour projets volumineux (> 100 MB)
# Repository: Claverse_windows__v_13_20-04-2026_V5_docker_zeabur_ok_switch_editeur
# ============================================================================

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "  PUSH EN COMMITS MULTIPLES - CLARAVERSE V13" -ForegroundColor Cyan
Write-Host "  Pour projets volumineux" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# Configuration
# ============================================================================

$newRepo = "https://github.com/sekadalle2024/Claverse_windows__v_13_20-04-2026_V5_docker_zeabur_ok_switch_editeur.git"
$branch = "master"
$maxRetries = 3
$retryDelay = 5

# ============================================================================
# ÉTAPE 1: Configuration Git Optimale
# ============================================================================

Write-Host "ÉTAPE 1: Configuration Git optimale..." -ForegroundColor Yellow
Write-Host ""

git config core.compression 0
git config http.postBuffer 2147483647
git config http.lowSpeedTime 999999
git config http.lowSpeedLimit 0
git config http.maxRequestBuffer 536870912

Write-Host "✓ Configuration appliquée" -ForegroundColor Green
Write-Host ""

# ============================================================================
# ÉTAPE 2: Vérifier et Changer le Repository
# ============================================================================

Write-Host "ÉTAPE 2: Configuration du repository..." -ForegroundColor Yellow
Write-Host ""

Write-Host "Repository actuel:" -ForegroundColor Cyan
git remote get-url origin
Write-Host ""

Write-Host "Changement vers:" -ForegroundColor Cyan
Write-Host $newRepo -ForegroundColor White
Write-Host ""

git remote set-url origin $newRepo

Write-Host "✓ Repository configuré" -ForegroundColor Green
Write-Host ""

# ============================================================================
# ÉTAPE 3: Vérifier l'État Git
# ============================================================================

Write-Host "ÉTAPE 3: Vérification de l'état Git..." -ForegroundColor Yellow
Write-Host ""

$status = git status --short
if (-not $status) {
    Write-Host "✓ Aucun fichier à commiter" -ForegroundColor Green
    Write-Host ""
    Write-Host "Tous les fichiers sont déjà sur GitHub!" -ForegroundColor Cyan
    Write-Host ""
    exit 0
}

Write-Host "Fichiers à commiter détectés" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# Fonction de Push avec Retry
# ============================================================================

function Push-WithRetry {
    param(
        [string]$CommitMessage,
        [int]$PartNumber,
        [int]$TotalParts
    )
    
    Write-Host "Partie $PartNumber/$TotalParts : $CommitMessage" -ForegroundColor Cyan
    Write-Host ""
    
    $attempt = 0
    $success = $false
    
    while ($attempt -lt $maxRetries -and -not $success) {
        $attempt++
        Write-Host "  Push tentative $attempt/$maxRetries..." -ForegroundColor Yellow
        
        git push -u origin $branch 2>&1 | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            $success = $true
            Write-Host "  ✓ Push réussi: $CommitMessage" -ForegroundColor Green
            Write-Host ""
        } else {
            Write-Host "  ✗ Échec tentative $attempt" -ForegroundColor Red
            
            if ($attempt -lt $maxRetries) {
                Write-Host "  Attente de $retryDelay secondes..." -ForegroundColor Yellow
                Start-Sleep -Seconds $retryDelay
            }
        }
    }
    
    if (-not $success) {
        Write-Host ""
        Write-Host "============================================================================" -ForegroundColor Red
        Write-Host "  ÉCHEC DU PUSH: $CommitMessage" -ForegroundColor Red
        Write-Host "============================================================================" -ForegroundColor Red
        Write-Host ""
        Write-Host "Utilisez GitHub Desktop comme solution alternative" -ForegroundColor Yellow
        Write-Host ""
        exit 1
    }
}

# ============================================================================
# PARTIE 1: Code Source React/TypeScript (src/)
# ============================================================================

Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "Partie 1/6: Code Source React/TypeScript" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

git add src/
$hasChanges = git diff --cached --quiet; $LASTEXITCODE -ne 0

if ($hasChanges) {
    git commit -m "Sauvegarde V13 - Partie 1/6: Code Source React/TypeScript"
    Push-WithRetry -CommitMessage "Code Source React/TypeScript" -PartNumber 1 -TotalParts 6
} else {
    Write-Host "  Aucun fichier à commiter dans src/" -ForegroundColor Yellow
    Write-Host ""
}

# ============================================================================
# PARTIE 2: Backend Python (py_backend/)
# ============================================================================

Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "Partie 2/6: Backend Python" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

git add py_backend/
$hasChanges = git diff --cached --quiet; $LASTEXITCODE -ne 0

if ($hasChanges) {
    git commit -m "Sauvegarde V13 - Partie 2/6: Backend Python"
    Push-WithRetry -CommitMessage "Backend Python" -PartNumber 2 -TotalParts 6
} else {
    Write-Host "  Aucun fichier à commiter dans py_backend/" -ForegroundColor Yellow
    Write-Host ""
}

# ============================================================================
# PARTIE 3: Fichiers Publics (public/)
# ============================================================================

Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "Partie 3/6: Fichiers Publics" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

git add public/
$hasChanges = git diff --cached --quiet; $LASTEXITCODE -ne 0

if ($hasChanges) {
    git commit -m "Sauvegarde V13 - Partie 3/6: Fichiers Publics"
    Push-WithRetry -CommitMessage "Fichiers Publics" -PartNumber 3 -TotalParts 6
} else {
    Write-Host "  Aucun fichier à commiter dans public/" -ForegroundColor Yellow
    Write-Host ""
}

# ============================================================================
# PARTIE 4: Documentation Principale
# ============================================================================

Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "Partie 4/6: Documentation Principale" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

git add "Doc menu demarrer/" "Doc export rapport/" "Doc_Etat_Fin/" "Doc_Lead_Balance/" "Doc zeabur docker/" "Doc backend switch/"
$hasChanges = git diff --cached --quiet; $LASTEXITCODE -ne 0

if ($hasChanges) {
    git commit -m "Sauvegarde V13 - Partie 4/6: Documentation Principale"
    Push-WithRetry -CommitMessage "Documentation Principale" -PartNumber 4 -TotalParts 6
} else {
    Write-Host "  Aucun fichier à commiter dans la documentation principale" -ForegroundColor Yellow
    Write-Host ""
}

# ============================================================================
# PARTIE 5: Autres Documentations
# ============================================================================

Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "Partie 5/6: Autres Documentations" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

git add "Doc_Github_Issue/" "Doc backend github/" "Doc backend huggings face/" "Doc Koyeb deploy/" "Doc render deploy/" "Doc Hugging Face deploy/" "Doc cross ref documentaire menu/" "*.md" "*.txt"
$hasChanges = git diff --cached --quiet; $LASTEXITCODE -ne 0

if ($hasChanges) {
    git commit -m "Sauvegarde V13 - Partie 5/6: Autres Documentations"
    Push-WithRetry -CommitMessage "Autres Documentations" -PartNumber 5 -TotalParts 6
} else {
    Write-Host "  Aucun fichier à commiter dans les autres documentations" -ForegroundColor Yellow
    Write-Host ""
}

# ============================================================================
# PARTIE 6: Fichiers Restants
# ============================================================================

Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "Partie 6/6: Fichiers Restants" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

git add .
$hasChanges = git diff --cached --quiet; $LASTEXITCODE -ne 0

if ($hasChanges) {
    git commit -m "Sauvegarde V13 - Partie 6/6: Fichiers Restants (Config, Docker, etc.)"
    Push-WithRetry -CommitMessage "Fichiers Restants" -PartNumber 6 -TotalParts 6
} else {
    Write-Host "  Aucun fichier restant à commiter" -ForegroundColor Yellow
    Write-Host ""
}

# ============================================================================
# Vérification Finale
# ============================================================================

Write-Host "============================================================================" -ForegroundColor Green
Write-Host "  PUSH TERMINÉ AVEC SUCCÈS" -ForegroundColor Green
Write-Host "============================================================================" -ForegroundColor Green
Write-Host ""

Write-Host "Vérification finale..." -ForegroundColor Cyan
Write-Host ""

git status
Write-Host ""

Write-Host "Repository GitHub:" -ForegroundColor Cyan
Write-Host $newRepo -ForegroundColor White
Write-Host ""

Write-Host "✓ Votre projet ClaraVerse V13 est maintenant sauvegardé sur GitHub!" -ForegroundColor Green
Write-Host ""
Write-Host "Vérifiez sur:" -ForegroundColor Yellow
Write-Host "https://github.com/sekadalle2024/Claverse_windows__v_13_20-04-2026_V5_docker_zeabur_ok_switch_editeur" -ForegroundColor White
Write-Host ""
Write-Host "============================================================================" -ForegroundColor Green
Write-Host ""
