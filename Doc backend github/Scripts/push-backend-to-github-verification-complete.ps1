# ============================================================================
# Script de Sauvegarde Backend avec Vérification Complète
# ============================================================================
# 
# Description: Sauvegarde avec vérification avant/après pour garantir la visibilité sur GitHub
# Repository: https://github.com/sekadalle2024/Back-end-python-V0_03_03_2026.git
# 
# Fonctionnalités:
# - Vérification complète avant push
# - Détection des fichiers ignorés
# - Vérification post-push automatique
# - Confirmation de la visibilité sur GitHub
# - Logs détaillés
#
# Date: 23 Avril 2026
# Version: 1.0.0
# ============================================================================

$ErrorActionPreference = "Continue"

function Write-Step {
    param([string]$Message)
    Write-Host "`n================================================================" -ForegroundColor Cyan
    Write-Host "  $Message" -ForegroundColor Cyan
    Write-Host "================================================================" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Write-Info {
    param([string]$Message)
    Write-Host "  $Message" -ForegroundColor Cyan
}

# ============================================================================
# ÉTAPE 1: Vérifications préliminaires
# ============================================================================

Write-Step "VÉRIFICATIONS PRÉLIMINAIRES"

# Vérifier le dossier py_backend
if (-not (Test-Path "py_backend")) {
    Write-Error "Le dossier py_backend/ n'existe pas"
    exit 1
}
Write-Success "Dossier py_backend/ trouvé"

# Vérifier la branche
$currentBranch = git branch --show-current
Write-Info "Branche actuelle: $currentBranch"

# Sauvegarder le remote actuel
$currentRemote = git remote get-url origin
Write-Info "Remote actuel: $currentRemote"

# ============================================================================
# ÉTAPE 2: Vérification des fichiers à commiter
# ============================================================================

Write-Step "VÉRIFICATION DES FICHIERS"

# Lister les fichiers modifiés
Write-Info "Fichiers modifiés dans py_backend/:"
$modifiedFiles = git status py_backend/ --short
if ($modifiedFiles) {
    $modifiedFiles | ForEach-Object { Write-Host "  $_" -ForegroundColor White }
} else {
    Write-Warning "Aucune modification détectée"
}

# Vérifier les fichiers ignorés
Write-Host ""
Write-Info "Vérification des fichiers ignorés..."
$ignoredFiles = git status --ignored py_backend/ --short | Select-String "^!!"
if ($ignoredFiles) {
    Write-Warning "Fichiers ignorés détectés:"
    $ignoredFiles | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
    Write-Host ""
    $forceAdd = Read-Host "Forcer l'ajout des fichiers ignorés? (o/N)"
    if ($forceAdd -eq "o") {
        Write-Info "Ajout forcé des fichiers..."
        git add -f py_backend/
        Write-Success "Fichiers ajoutés avec force"
    }
} else {
    Write-Success "Aucun fichier ignoré"
}

# ============================================================================
# ÉTAPE 3: Ajout et commit
# ============================================================================

Write-Step "PRÉPARATION DU COMMIT"

# Ajouter les fichiers
Write-Info "Ajout des fichiers py_backend/..."
git add py_backend/

# Vérifier ce qui sera commité
Write-Host ""
Write-Info "Fichiers qui seront commités:"
$stagedFiles = git diff --cached --name-only py_backend/
if ($stagedFiles) {
    $fileCount = ($stagedFiles | Measure-Object).Count
    Write-Success "$fileCount fichiers à commiter"
    $stagedFiles | ForEach-Object { Write-Host "  • $_" -ForegroundColor White }
} else {
    Write-Warning "Aucun fichier à commiter"
    Write-Info "Un commit vide sera créé pour forcer la synchronisation"
}

# Créer le message de commit
$date = Get-Date -Format "dd/MM/yyyy HH:mm"
$commitMessage = "Sauvegarde Backend Python - $date"

Write-Host ""
Write-Info "Message du commit: $commitMessage"

# ============================================================================
# ÉTAPE 4: Confirmation utilisateur
# ============================================================================

Write-Step "CONFIRMATION"

Write-Host ""
Write-Host "Résumé de l'opération:" -ForegroundColor Yellow
Write-Host "  • Repository cible: https://github.com/sekadalle2024/Back-end-python-V0_03_03_2026.git" -ForegroundColor White
Write-Host "  • Branche: $currentBranch" -ForegroundColor White
Write-Host "  • Fichiers: $fileCount fichiers" -ForegroundColor White
Write-Host "  • Push avec --force: OUI" -ForegroundColor Red
Write-Host ""
Write-Host "⚠ ATTENTION: Le push --force écrasera la version distante!" -ForegroundColor Yellow
Write-Host ""

$confirmation = Read-Host "Confirmer la sauvegarde? (o/N)"
if ($confirmation -ne "o") {
    Write-Warning "Opération annulée"
    exit 0
}

# ============================================================================
# ÉTAPE 5: Commit et Push
# ============================================================================

Write-Step "SAUVEGARDE VERS GITHUB"

try {
    # Créer le commit
    Write-Info "Création du commit..."
    $commitResult = git commit -m "$commitMessage" --allow-empty 2>&1
    if ($LASTEXITCODE -eq 0 -or $commitResult -match "nothing to commit") {
        Write-Success "Commit créé"
    } else {
        Write-Warning "Résultat du commit: $commitResult"
    }
    
    # Changer le remote
    Write-Host ""
    Write-Info "Changement du remote vers le repository backend..."
    git remote set-url origin https://github.com/sekadalle2024/Back-end-python-V0_03_03_2026.git
    Write-Success "Remote changé"
    
    # Push vers GitHub
    Write-Host ""
    Write-Info "Push vers GitHub..."
    Write-Host ""
    $pushResult = git push -u origin $currentBranch --force 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Push réussi!"
    } else {
        Write-Error "Erreur lors du push"
        Write-Host $pushResult -ForegroundColor Red
        throw "Push failed"
    }
    
} catch {
    Write-Error "Erreur: $_"
    Write-Warning "Restauration du remote..."
    git remote set-url origin $currentRemote
    exit 1
}

# ============================================================================
# ÉTAPE 6: Restauration du remote
# ============================================================================

Write-Step "RESTAURATION DU REMOTE"

git remote set-url origin $currentRemote
$restoredRemote = git remote get-url origin

if ($restoredRemote -eq $currentRemote) {
    Write-Success "Remote restauré correctement"
} else {
    Write-Warning "Remote restauré mais différent"
    Write-Info "Attendu: $currentRemote"
    Write-Info "Actuel: $restoredRemote"
}

# ============================================================================
# ÉTAPE 7: Vérification post-push
# ============================================================================

Write-Step "VÉRIFICATION POST-PUSH"

Write-Info "Récupération de l'état distant..."
git fetch origin 2>&1 | Out-Null

Write-Host ""
Write-Info "Comparaison local vs distant..."
$postDiff = git diff $currentBranch origin/$currentBranch --name-only py_backend/

if ($postDiff) {
    Write-Warning "Différences détectées après le push:"
    $postDiff | ForEach-Object { Write-Host "  • $_" -ForegroundColor Yellow }
    Write-Host ""
    Write-Warning "Les fichiers locaux ne sont pas complètement synchronisés"
} else {
    Write-Success "Local et distant sont synchronisés"
}

# Vérifier le dernier commit distant
Write-Host ""
Write-Info "Dernier commit sur GitHub:"
git log origin/$currentBranch -1 --pretty=format:"  Hash: %h%n  Date: %ad%n  Message: %s%n" --date=format:"%d/%m/%Y %H:%M"

# Lister les fichiers dans le commit distant
Write-Host ""
Write-Info "Fichiers py_backend/ dans le commit distant:"
$remoteCommitFiles = git log origin/$currentBranch -1 --name-only --pretty="" py_backend/
if ($remoteCommitFiles) {
    $remoteFileCount = ($remoteCommitFiles | Measure-Object).Count
    Write-Success "$remoteFileCount fichiers dans le commit"
    $remoteCommitFiles | Select-Object -First 10 | ForEach-Object { Write-Host "  • $_" -ForegroundColor White }
    if ($remoteFileCount -gt 10) {
        Write-Info "... et $($remoteFileCount - 10) autres fichiers"
    }
} else {
    Write-Warning "Aucun fichier py_backend/ dans le commit distant"
}

# ============================================================================
# RÉSUMÉ FINAL
# ============================================================================

Write-Step "SAUVEGARDE TERMINÉE"

Write-Host ""
Write-Success "Le backend Python a été sauvegardé sur GitHub"
Write-Host ""
Write-Host "Détails:" -ForegroundColor Cyan
Write-Host "  • Repository: https://github.com/sekadalle2024/Back-end-python-V0_03_03_2026.git" -ForegroundColor White
Write-Host "  • Commit: $commitMessage" -ForegroundColor White
Write-Host "  • Fichiers: $fileCount fichiers commités" -ForegroundColor White
Write-Host "  • Remote restauré: ✓" -ForegroundColor Green

if (-not $postDiff) {
    Write-Host "  • Synchronisation: ✓ Confirmée" -ForegroundColor Green
} else {
    Write-Host "  • Synchronisation: ⚠ Différences détectées" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "VÉRIFICATION SUR GITHUB:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  1. Ouvrez: https://github.com/sekadalle2024/Back-end-python-V0_03_03_2026" -ForegroundColor White
Write-Host "  2. Cliquez sur 'Commits' pour voir l'historique" -ForegroundColor White
Write-Host "  3. Cliquez sur le dernier commit pour voir les fichiers" -ForegroundColor White
Write-Host "  4. Vérifiez que TOUS les fichiers sont listés" -ForegroundColor White
Write-Host "  5. Attendez 2-3 minutes et rafraîchissez (F5) si nécessaire" -ForegroundColor White
Write-Host ""

if ($postDiff) {
    Write-Host "⚠ ATTENTION:" -ForegroundColor Yellow
    Write-Host "  Des différences ont été détectées après le push." -ForegroundColor Yellow
    Write-Host "  Exécutez le script de diagnostic pour plus d'informations:" -ForegroundColor Yellow
    Write-Host "  .\Doc` backend` github\Scripts\diagnostiquer-probleme-github.ps1" -ForegroundColor White
    Write-Host ""
}

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""
