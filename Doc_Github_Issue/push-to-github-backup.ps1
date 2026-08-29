# ============================================
# Script de Sauvegarde ClaraVerse vers GitHub
# Repository: Calaraverse_windows_s_11_v0_10-03-2026_V5-Public-Public
# ============================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SAUVEGARDE CLARAVERSE VERS GITHUB" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$REPO_URL = "https://github.com/sekadalle2024/Calaraverse_windows_s_11_v0_10-03-2026_V5-Public-Public.git"
$DATE = Get-Date -Format "dd-MM-yyyy_HH-mm"
$COMMIT_MESSAGE = "Sauvegarde ClaraVerse - Mise à jour du $DATE"

# Étape 1: Vérifier l'état actuel
Write-Host "1. Vérification de l'état du repository..." -ForegroundColor Yellow
git status

Write-Host ""
Write-Host "2. Vérification du remote actuel..." -ForegroundColor Yellow
git remote -v

Write-Host ""
$response = Read-Host "Voulez-vous continuer avec la sauvegarde? (o/n)"
if ($response -ne "o") {
    Write-Host "Opération annulée." -ForegroundColor Red
    exit
}

# Étape 2: Ajouter tous les fichiers modifiés
Write-Host ""
Write-Host "3. Ajout de tous les fichiers modifiés..." -ForegroundColor Yellow
git add .

# Étape 3: Créer le commit
Write-Host ""
Write-Host "4. Création du commit..." -ForegroundColor Yellow
git commit -m "$COMMIT_MESSAGE"

# Étape 4: Vérifier/Configurer le remote
Write-Host ""
Write-Host "5. Configuration du repository distant..." -ForegroundColor Yellow
$currentRemote = git remote get-url origin 2>$null

if ($currentRemote -eq $REPO_URL) {
    Write-Host "   Remote déjà configuré correctement." -ForegroundColor Green
} else {
    Write-Host "   Mise à jour du remote vers: $REPO_URL" -ForegroundColor Yellow
    git remote set-url origin $REPO_URL
}

# Vérification
Write-Host ""
Write-Host "6. Vérification de la configuration..." -ForegroundColor Yellow
git remote -v

# Étape 5: Identifier la branche actuelle
Write-Host ""
Write-Host "7. Identification de la branche..." -ForegroundColor Yellow
$currentBranch = git branch --show-current

if ([string]::IsNullOrEmpty($currentBranch)) {
    Write-Host "   Aucune branche détectée. Création de la branche 'main'..." -ForegroundColor Yellow
    git checkout -b main
    $currentBranch = "main"
}

Write-Host "   Branche actuelle: $currentBranch" -ForegroundColor Green

# Étape 6: Push vers GitHub
Write-Host ""
Write-Host "8. Envoi vers GitHub..." -ForegroundColor Yellow
Write-Host "   Commande: git push -u origin $currentBranch" -ForegroundColor Cyan

$pushResponse = Read-Host "Confirmer le push vers GitHub? (o/n)"
if ($pushResponse -eq "o") {
    git push -u origin $currentBranch
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "✓ SAUVEGARDE RÉUSSIE!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Repository: $REPO_URL" -ForegroundColor Cyan
        Write-Host "Branche: $currentBranch" -ForegroundColor Cyan
        Write-Host "Date: $DATE" -ForegroundColor Cyan
    } else {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Red
        Write-Host "✗ ERREUR LORS DU PUSH" -ForegroundColor Red
        Write-Host "========================================" -ForegroundColor Red
        Write-Host ""
        Write-Host "Vérifiez:" -ForegroundColor Yellow
        Write-Host "- Votre connexion Internet" -ForegroundColor Yellow
        Write-Host "- Vos identifiants GitHub" -ForegroundColor Yellow
        Write-Host "- Les permissions sur le repository" -ForegroundColor Yellow
    }
} else {
    Write-Host "Push annulé." -ForegroundColor Red
}

Write-Host ""
Write-Host "Script terminé." -ForegroundColor Cyan
