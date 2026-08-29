# ============================================================================
# Script de Sauvegarde Backend Python - Version V5 (Mise à Jour 16 Juillet 2026)
# ============================================================================
# 
# Description: Sauvegarde le repository py_backend/ de manière isolée.
# URL Cible: https://github.com/sekadalle2024/Back-end-python-V5_23_04_2026--tree-master.git
#
# Avantages:
# - Opère directement dans le sous-dépôt py_backend/ (Isolation totale)
# - Ne modifie PAS le remote du projet global ClaraVerse
# - Garantit un repository backend "propre" sur GitHub (code à la racine)
#
# Date: 16 Juillet 2026
# Version: 5.1.0
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
# ETAPE 1: Vérifications et Navigation
# ============================================================================

Write-Step "Initialisation et Vérifications V5.1"

$targetRepo = "https://github.com/sekadalle2024/Back-end-python-V5_23_04_2026--tree-master.git"
$backendDir = "py_backend"
$rootDir = Get-Location

# 1. Vérifier si on est à la racine et entrer dans le dossier
if (Test-Path $backendDir) {
    Set-Location $backendDir
    Write-Success "Navigation vers le dossier $backendDir"
} elseif ((Get-Location).Path -like "*$backendDir") {
    Write-Success "Déjà dans le dossier $backendDir"
} else {
    Write-ErrorCustom "Dossier $backendDir non trouvé. Lancez le script depuis la racine du projet."
    exit 1
}

# 2. Vérifier les fichiers critiques
Write-Step "Vérification des fichiers critiques"
$criticalFiles = @("main.py", "endpoint_editeur.py", "requirements.txt")
$missingFiles = @()

foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        Write-Success "Fichier trouvé: $file"
    } else {
        Write-Warning "Fichier manquant: $file"
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Warning "$($missingFiles.Count) fichier(s) critique(s) manquant(s)"
}

# ============================================================================
# ETAPE 2: Initialisation Git si nécessaire
# ============================================================================

Write-Step "Préparation Git (Dépôt Isolé)"

# Vérifier si .git existe dans py_backend
if (-not (Test-Path ".git")) {
    Write-ColorOutput "Initialisation du dépôt Git local..." "Cyan"
    git init
    Write-Success "Dépôt Git initialisé"
}

# Vérifier la branche
try {
    $currentBranch = git branch --show-current 2>$null
    if ([string]::IsNullOrEmpty($currentBranch)) {
        Write-ColorOutput "Création de la branche master..." "Cyan"
        $currentBranch = "master"
    }
    Write-ColorOutput "Branche actuelle: $currentBranch" "White"
} catch {
    $currentBranch = "master"
    Write-ColorOutput "Branche par défaut: $currentBranch" "White"
}

# ============================================================================
# ETAPE 3: Staging des fichiers
# ============================================================================

Write-Step "Staging des fichiers"

# Vérifier le .gitignore
if (-not (Test-Path ".gitignore")) {
    Write-ColorOutput "Création du .gitignore..." "Cyan"
    @"
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
*.log
.env
.env.local
*.db
*.sqlite
*.sqlite3
"@ | Out-File -FilePath ".gitignore" -Encoding UTF8
    Write-Success ".gitignore créé"
}

# Ajouter les modifications
Write-ColorOutput "Staging des fichiers..." "Cyan"
git add .

# Afficher le statut
$status = git status --short
if ($status) {
    Write-ColorOutput "Fichiers modifiés:" "Yellow"
    git status --short
} else {
    Write-Warning "Aucune modification détectée"
}

# ============================================================================
# ETAPE 4: Configuration du Remote Backend
# ============================================================================

Write-Step "Configuration du Remote"

# Vérifier si origin existe déjà dans le sous-dépôt
$remotes = git remote 2>$null
if ($remotes -contains "origin") {
    $currentRemote = git remote get-url origin
    if ($currentRemote -eq $targetRepo) {
        Write-Success "Remote 'origin' déjà configuré correctement"
    } else {
        Write-ColorOutput "Mise à jour du remote 'origin'..." "Cyan"
        git remote set-url origin $targetRepo
        Write-Success "Remote mis à jour"
    }
} else {
    Write-ColorOutput "Ajout du nouveau remote 'origin'..." "Cyan"
    git remote add origin $targetRepo
    Write-Success "Remote ajouté"
}

Write-Success "Remote configuré vers:"
Write-ColorOutput "  $targetRepo" "White"

# Afficher la configuration du remote
git remote -v

# ============================================================================
# ETAPE 5: Commit et Push
# ============================================================================

Write-Step "Exécution de la Sauvegarde V5.1"

$date = Get-Date -Format "dd/MM/yyyy HH:mm"
$commitMessage = "Sauvegarde Backend V5 - $date - Mise à jour automatique"

Write-ColorOutput "Message du commit: $commitMessage" "White"

try {
    # Créer le commit
    Write-ColorOutput "Création du commit..." "Cyan"
    git commit -m "$commitMessage" --allow-empty
    Write-Success "Commit créé"
    
    # Push vers GitHub
    Write-ColorOutput "Envoi vers GitHub (Force Push)..." "Cyan"
    Write-Warning "Force push en cours... Cela écrasera l'historique distant"
    
    git push -u origin $currentBranch --force
    
    Write-Success "✓✓✓ SAUVEGARDE V5.1 RÉUSSIE ! ✓✓✓"
    Write-ColorOutput "`nLe backend a été sauvegardé sur:" "Green"
    Write-ColorOutput "  $targetRepo" "White"
    
} catch {
    Write-ErrorCustom "Erreur lors du push: $_"
    Write-ColorOutput "`nVérifiez:" "Yellow"
    Write-ColorOutput "  1. Votre connexion internet" "White"
    Write-ColorOutput "  2. Vos permissions sur le repository GitHub" "White"
    Write-ColorOutput "  3. Que l'URL du repository est correcte" "White"
}

# ============================================================================
# ETAPE 6: Nettoyage et Retour
# ============================================================================

Write-Step "Finalisation"

# Retour au dossier parent
Set-Location $rootDir
Write-ColorOutput "Retour au répertoire racine." "Cyan"

Write-ColorOutput "`n" "White"
Write-ColorOutput "════════════════════════════════════════════════════" "Cyan"
Write-ColorOutput "  Script terminé avec succès" "Green"
Write-ColorOutput "  Date: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')" "White"
Write-ColorOutput "════════════════════════════════════════════════════" "Cyan"
