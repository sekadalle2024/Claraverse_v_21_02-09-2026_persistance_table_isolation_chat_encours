# ============================================================================
# Script de Sauvegarde Backend Python - Version V5 (Optimise)
# ============================================================================
# 
# Description: Sauvegarde le repository py_backend/ de maniere isolee.
# URL Cible: https://github.com/sekadalle2024/Back-end-python-V5_23_04_2026--tree-master.git
#
# Avantages de la Version V5:
# - Opere directement dans le sous-depot py_backend/ (Isolation totale)
# - Ne modifie PAS le remote du projet global ClaraVerse
# - Garantit un repository backend "propre" sur GitHub (code a la racine)
#
# Date: 23 Avril 2026
# Version: 5.0.0
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
    Write-ColorOutput "OK $Message" "Green"
}

function Write-Warning {
    param([string]$Message)
    Write-ColorOutput "! $Message" "Yellow"
}

function Write-ErrorCustom {
    param([string]$Message)
    Write-ColorOutput "X $Message" "Red"
}

# ============================================================================
# ETAPE 1: Verifications et Navigation
# ============================================================================

Write-Step "Initialisation et Verifications V5"

$targetRepo = "https://github.com/sekadalle2024/Back-end-python-V5_23_04_2026--tree-master.git"
$backendDir = "py_backend"

# 1. Verifier si on est a la racine et entrer dans le dossier
if (Test-Path $backendDir) {
    Set-Location $backendDir
    Write-Success "Navigation vers le dossier $backendDir"
} elseif ((Get-Location).Path.EndsWith($backendDir)) {
    Write-Success "Deja dans le dossier $backendDir"
} else {
    Write-ErrorCustom "Dossier $backendDir non trouve. Lancez le script depuis la racine du projet."
    exit 1
}

# 2. Verifier les fichiers critiques
$criticalFiles = @("main.py", "endpoint_editeur.py", "requirements.txt")
foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        Write-Success "Fichier critique trouve: $file"
    } else {
        Write-Warning "Fichier critique manquant: $file"
    }
}

# ============================================================================
# ETAPE 2: Preparation Git (Interne au Backend)
# ============================================================================

Write-Step "Preparation Git (Depot Isole)"

# Verifier la branche
$currentBranch = git branch --show-current
Write-ColorOutput "Branche actuelle: $currentBranch" "White"

# Ajouter les modifications
Write-ColorOutput "Staging des fichiers..." "Cyan"
git add .
git status --short

# Preparer le commit
$date = Get-Date -Format "dd/MM/yyyy HH:mm"
$commitMessage = "Sauvegarde Backend V5 - $date"

# ============================================================================
# ETAPE 3: Configuration du Remote Backend
# ============================================================================

Write-Step "Configuration du Remote"

# Verifier si origin existe deja dans le sous-depot
$remotes = git remote
if ($remotes -contains "origin") {
    Write-ColorOutput "Mise a jour du remote 'origin'..." "Cyan"
    git remote set-url origin $targetRepo
} else {
    Write-ColorOutput "Ajout du nouveau remote 'origin'..." "Cyan"
    git remote add origin $targetRepo
}

Write-Success "Remote configure vers: $targetRepo"

# ============================================================================
# ETAPE 4: Confirmation et Push
# ============================================================================

Write-Step "Execution de la Sauvegarde V5"

try {
    Write-ColorOutput "Creation du commit..." "Cyan"
    git commit -m "$commitMessage" --allow-empty
    
    Write-ColorOutput "Envoi vers GitHub (Force Push)..." "Cyan"
    git push -u origin master --force
    
    Write-Success "SAUVEGARDE V5 REUSSIE !"
} catch {
    Write-ErrorCustom "Erreur lors du push: $_"
}

# Retour au dossier parent
Set-Location ..
Write-ColorOutput "`nRetour au repertoire racine." "Cyan"
Write-Success "Termine."
