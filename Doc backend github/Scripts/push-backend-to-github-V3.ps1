# ============================================================================
# Script de Sauvegarde Backend Python - Version V3 (Optimisé)
# ============================================================================
# 
# Description: Sauvegarde le repository py_backend/ de manière isolée.
# URL Cible: https://github.com/sekadalle2024/Back-end-python-V3_23_04_2026-.git
#
# Avantages de la Version V3:
# - Opère directement dans le sous-dépôt py_backend/ (Isolation totale)
# - Ne modifie PAS le remote du projet global ClaraVerse
# - Garantit un repository backend "propre" sur GitHub (code à la racine)
#
# Date: 23 Avril 2026
# Version: 3.0.0
# ============================================================================

$ErrorActionPreference = "Stop"

function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
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
# ÉTAPE 1: Vérifications et Navigation
# ============================================================================

Write-Step "Initialisation et Vérifications"

$targetRepo = "https://github.com/sekadalle2024/Back-end-python-V3_23_04_2026-.git"
$backendDir = "py_backend"

# 1. Vérifier si on est à la racine et entrer dans le dossier
if (Test-Path $backendDir) {
    Set-Location $backendDir
    Write-Success "Navigation vers le dossier $backendDir"
} elseif ((Get-Location).Path.EndsWith($backendDir)) {
    Write-Success "Déjà dans le dossier $backendDir"
} else {
    Write-ErrorCustom "Dossier $backendDir non trouvé. Lancez le script depuis la racine du projet."
    exit 1
}

# 2. Vérifier les fichiers critiques
$criticalFiles = @("main.py", "endpoint_editeur.py", "requirements.txt")
foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        Write-Success "Fichier critique trouvé: $file"
    } else {
        Write-Warning "Fichier critique manquant: $file"
    }
}

# ============================================================================
# ÉTAPE 2: Préparation Git (Interne au Backend)
# ============================================================================

Write-Step "Préparation Git (Dépôt Isolé)"

# Vérifier la branche
$currentBranch = git branch --show-current
Write-ColorOutput "Branche actuelle: $currentBranch" "White"

# Ajouter les modifications
Write-ColorOutput "Staging des fichiers..." "Cyan"
git add .
git status --short

# Préparer le commit
$date = Get-Date -Format "dd/MM/yyyy HH:mm"
$commitMessage = "Sauvegarde Backend V3 - $date"

# ============================================================================
# ÉTAPE 3: Configuration du Remote Backend
# ============================================================================

Write-Step "Configuration du Remote"

# Vérifier si origin existe déjà dans le sous-dépôt
$remotes = git remote
if ($remotes -contains "origin") {
    Write-ColorOutput "Mise à jour du remote 'origin'..." "Cyan"
    git remote set-url origin $targetRepo
} else {
    Write-ColorOutput "Ajout du nouveau remote 'origin'..." "Cyan"
    git remote add origin $targetRepo
}

Write-Success "Remote configuré vers: $targetRepo"

# ============================================================================
# ÉTAPE 4: Confirmation et Push
# ============================================================================

Write-Step "Confirmation Finale"

Write-ColorOutput "Résumé:" "Yellow"
Write-ColorOutput "  • Répertoire local: $(Get-Location)" "White"
Write-ColorOutput "  • Repository distant: $targetRepo" "White"
Write-ColorOutput "  • Message: $commitMessage" "White"
Write-ColorOutput "  • Force Push: OUI (Recommandé pour les versions prioritaires)" "Red"

$confirmation = Read-Host "`nLancer la sauvegarde? (o/N)"
if ($confirmation -ne "o") {
    Write-ColorOutput "Opération annulée." "Yellow"
    Set-Location ..
    exit 0
}

Write-Step "Exécution de la Sauvegarde"

try {
    Write-ColorOutput "Création du commit..." "Cyan"
    git commit -m "$commitMessage" --allow-empty
    
    Write-ColorOutput "Envoi vers GitHub (Force Push)..." "Cyan"
    git push -u origin master --force
    
    Write-Success "SAUVEGARDE RÉUSSIE !"
} catch {
    Write-ErrorCustom "Erreur lors du push: $_"
}

# Retour au dossier parent
Set-Location ..
Write-ColorOutput "`nRetour au répertoire racine." "Cyan"
Write-Success "Termine."
