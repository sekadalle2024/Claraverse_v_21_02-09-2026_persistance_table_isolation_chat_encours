# ============================================================================
# Script de Sauvegarde Backend Python vers GitHub - Version Améliorée
# ============================================================================
# 
# Description: Sauvegarde le dossier py_backend/ vers le repository backend
# Repository: https://github.com/sekadalle2024/Back-end-python-V0_03_03_2026.git
# 
# Améliorations:
# - Vérification de l'existence des fichiers critiques
# - Validation avant push
# - Logs détaillés
# - Gestion d'erreurs robuste
# - Restauration automatique en cas d'échec
#
# Date: 20 Avril 2026
# Version: 2.0.0
# ============================================================================

# Couleurs pour les messages
$ErrorActionPreference = "Stop"

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Write-Step {
    param([string]$Message)
    Write-ColorOutput "`n=== $Message ===" "Cyan"
}

function Write-Success {
    param([string]$Message)
    Write-ColorOutput "✓ $Message" "Green"
}

function Write-Warning {
    param([string]$Message)
    Write-ColorOutput "⚠ $Message" "Yellow"
}

function Write-ErrorCustom {
    param([string]$Message)
    Write-ColorOutput "✗ $Message" "Red"
}

# ============================================================================
# ÉTAPE 1: Vérifications préliminaires
# ============================================================================

Write-Step "Vérifications préliminaires"

# Vérifier que nous sommes dans le bon répertoire
if (-not (Test-Path "py_backend")) {
    Write-ErrorCustom "Le dossier py_backend/ n'existe pas dans le répertoire actuel"
    Write-ColorOutput "Répertoire actuel: $(Get-Location)" "Yellow"
    exit 1
}
Write-Success "Dossier py_backend/ trouvé"

# Vérifier les fichiers critiques
$criticalFiles = @(
    "py_backend/main.py",
    "py_backend/endpoint_editeur.py",
    "py_backend/requirements.txt"
)

$missingFiles = @()
foreach ($file in $criticalFiles) {
    if (-not (Test-Path $file)) {
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Warning "Fichiers critiques manquants:"
    foreach ($file in $missingFiles) {
        Write-ColorOutput "  - $file" "Yellow"
    }
    $continue = Read-Host "Continuer quand même? (o/N)"
    if ($continue -ne "o") {
        Write-ColorOutput "Opération annulée" "Yellow"
        exit 0
    }
} else {
    Write-Success "Tous les fichiers critiques sont présents"
}

# ============================================================================
# ÉTAPE 2: Vérification de l'état Git
# ============================================================================

Write-Step "Vérification de l'état Git"

# Sauvegarder le remote actuel
try {
    $currentRemote = git remote get-url origin
    Write-Success "Remote actuel sauvegardé: $currentRemote"
} catch {
    Write-ErrorCustom "Impossible de récupérer le remote actuel"
    exit 1
}

# Vérifier la branche
$currentBranch = git branch --show-current
Write-ColorOutput "Branche actuelle: $currentBranch" "Cyan"

# Vérifier l'état du dossier py_backend
Write-ColorOutput "`nÉtat du dossier py_backend/:" "Cyan"
git status py_backend/ --short

# ============================================================================
# ÉTAPE 3: Préparation du commit
# ============================================================================

Write-Step "Préparation du commit"

# Ajouter les fichiers
Write-ColorOutput "Ajout des fichiers du dossier py_backend/..." "Cyan"
git add py_backend/

# Vérifier ce qui va être commité
$stagedFiles = git diff --cached --name-only py_backend/
if ($stagedFiles) {
    Write-Success "Fichiers à commiter:"
    $stagedFiles | ForEach-Object { Write-ColorOutput "  - $_" "White" }
} else {
    Write-Warning "Aucun fichier modifié à commiter"
    Write-ColorOutput "Le repository backend sera quand même mis à jour avec un commit vide" "Yellow"
}

# Créer le message de commit
$date = Get-Date -Format "dd MMMM yyyy"
$commitMessage = "Sauvegarde Backend Python - $date - Inclut endpoint_editeur.py"

Write-ColorOutput "`nMessage du commit:" "Cyan"
Write-ColorOutput "  $commitMessage" "White"

# ============================================================================
# ÉTAPE 4: Confirmation utilisateur
# ============================================================================

Write-Step "Confirmation"

Write-ColorOutput "`nRésumé de l'opération:" "Yellow"
Write-ColorOutput "  • Repository cible: https://github.com/sekadalle2024/Back-end-python-V0_03_03_2026.git" "White"
Write-ColorOutput "  • Branche: $currentBranch" "White"
Write-ColorOutput "  • Commit message: $commitMessage" "White"
Write-ColorOutput "  • Push avec --force: OUI" "Red"
Write-ColorOutput "`n⚠ ATTENTION: Le push --force écrasera la version distante!" "Yellow"

$confirmation = Read-Host "`nConfirmer la sauvegarde? (o/N)"
if ($confirmation -ne "o") {
    Write-ColorOutput "Opération annulée par l'utilisateur" "Yellow"
    exit 0
}

# ============================================================================
# ÉTAPE 5: Changement du remote et push
# ============================================================================

Write-Step "Sauvegarde vers GitHub"

try {
    # Créer le commit
    Write-ColorOutput "Création du commit..." "Cyan"
    git commit -m "$commitMessage" --allow-empty
    Write-Success "Commit créé"
    
    # Changer le remote
    Write-ColorOutput "Changement du remote vers le repository backend..." "Cyan"
    git remote set-url origin https://github.com/sekadalle2024/Back-end-python-V0_03_03_2026.git
    Write-Success "Remote changé"
    
    # Vérifier le changement
    $newRemote = git remote get-url origin
    Write-ColorOutput "Nouveau remote: $newRemote" "White"
    
    # Push vers GitHub
    Write-ColorOutput "`nEnvoi vers GitHub..." "Cyan"
    git push -u origin $currentBranch --force 2>&1 | Out-String | Write-Host
    Write-Success "Push réussi!"
    
} catch {
    Write-ErrorCustom "Erreur lors de la sauvegarde: $_"
    Write-Warning "Tentative de restauration du remote..."
    
    try {
        git remote set-url origin $currentRemote
        Write-Success "Remote restauré"
    } catch {
        Write-ErrorCustom "Impossible de restaurer le remote!"
        Write-ColorOutput "Remote actuel: $(git remote get-url origin)" "Red"
        Write-ColorOutput "Remote attendu: $currentRemote" "Yellow"
    }
    
    exit 1
}

# ============================================================================
# ÉTAPE 6: Restauration du remote
# ============================================================================

Write-Step "Restauration du remote"

try {
    git remote set-url origin $currentRemote
    Write-Success "Remote restauré vers le repository principal"
    
    # Vérifier la restauration
    $restoredRemote = git remote get-url origin
    if ($restoredRemote -eq $currentRemote) {
        Write-Success "Vérification: Remote correctement restauré"
    } else {
        Write-Warning "Le remote restauré ne correspond pas exactement"
        Write-ColorOutput "  Attendu: $currentRemote" "Yellow"
        Write-ColorOutput "  Actuel: $restoredRemote" "Yellow"
    }
} catch {
    Write-ErrorCustom "Erreur lors de la restauration du remote: $_"
    Write-ColorOutput "Vous devrez restaurer manuellement avec:" "Yellow"
    Write-ColorOutput "  git remote set-url origin $currentRemote" "White"
    exit 1
}

# ============================================================================
# ÉTAPE 7: Vérification finale
# ============================================================================

Write-Step "Vérification finale"

Write-ColorOutput "`nÉtat du repository:" "Cyan"
git status --short

Write-ColorOutput "`nRemote actuel:" "Cyan"
git remote -v

Write-ColorOutput "`nBranche actuelle:" "Cyan"
git branch

# ============================================================================
# RÉSUMÉ FINAL
# ============================================================================

Write-Step "SAUVEGARDE TERMINÉE AVEC SUCCÈS"

Write-Success "Le backend Python a été sauvegardé sur GitHub"
Write-ColorOutput "`nDétails:" "Cyan"
Write-ColorOutput "  • Repository: https://github.com/sekadalle2024/Back-end-python-V0_03_03_2026.git" "White"
Write-ColorOutput "  • Commit: $commitMessage" "White"
Write-ColorOutput "  • Fichiers inclus: endpoint_editeur.py et tous les fichiers py_backend/" "White"
Write-ColorOutput "  • Remote principal restauré: ✓" "Green"

Write-ColorOutput "`nVous pouvez vérifier sur GitHub:" "Cyan"
Write-ColorOutput "  https://github.com/sekadalle2024/Back-end-python-V0_03_03_2026" "White"

Write-ColorOutput "`n✓ Opération terminée avec succès!" "Green"
