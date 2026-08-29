# ============================================
# Script de sauvegarde ClaraVerse vers GitHub
# Repository: Claraverse_windows_s_11_v0_21-03-2026_V5-Public-Public-Public
# ============================================

Write-Host "=== SAUVEGARDE CLARAVERSE VERS GITHUB ===" -ForegroundColor Cyan
Write-Host ""

# 1. Vérifier l'état actuel
Write-Host "1. Vérification de l'état Git..." -ForegroundColor Yellow
git status

Write-Host ""
Write-Host "2. Vérification du remote actuel..." -ForegroundColor Yellow
git remote -v

Write-Host ""
Write-Host "3. Vérification de la branche actuelle..." -ForegroundColor Yellow
git branch

Write-Host ""
Write-Host "=== DEBUT DE LA SAUVEGARDE ===" -ForegroundColor Green
Write-Host ""

# 2. Ajouter tous les fichiers
Write-Host "4. Ajout de tous les fichiers..." -ForegroundColor Yellow
git add .

# 3. Créer un commit avec la date
$date = Get-Date -Format "dd-MM-yyyy HH:mm"
$commitMessage = "Sauvegarde ClaraVerse Windows 11 - Version V5 - $date"
Write-Host "5. Création du commit: $commitMessage" -ForegroundColor Yellow
git commit -m "$commitMessage"

# 4. Changer le repository vers le nouveau
$newRepo = "https://github.com/sekadalle2024/Claraverse_windows_s_11_v0_21-03-2026_V5-Public-Public-Public.git"
Write-Host ""
Write-Host "6. Configuration du nouveau repository..." -ForegroundColor Yellow
Write-Host "   URL: $newRepo" -ForegroundColor Cyan
git remote set-url origin $newRepo

# 5. Vérifier la nouvelle connexion
Write-Host ""
Write-Host "7. Vérification de la nouvelle connexion..." -ForegroundColor Yellow
git remote -v

# 6. Obtenir le nom de la branche actuelle
$branchName = git branch --show-current
Write-Host ""
Write-Host "8. Branche détectée: $branchName" -ForegroundColor Cyan

# 7. Push vers GitHub
Write-Host ""
Write-Host "9. Envoi vers GitHub..." -ForegroundColor Yellow
Write-Host "   Commande: git push -u origin $branchName" -ForegroundColor Cyan
git push -u origin $branchName

Write-Host ""
Write-Host "=== SAUVEGARDE TERMINEE ===" -ForegroundColor Green
Write-Host ""
Write-Host "Votre projet a été sauvegardé sur:" -ForegroundColor Cyan
Write-Host "$newRepo" -ForegroundColor White
Write-Host ""
Write-Host "Branche: $branchName" -ForegroundColor White
