# Script de sauvegarde ClaraVerse V5 - Export CAC
# Repository cible: https://github.com/sekadalle2024/Claraverse_windows_s_12_v0_31-03-2026_V5-Export_CAC-V0-Public.git

Write-Host "=== SAUVEGARDE CLARAVERSE V5 - EXPORT CAC ===" -ForegroundColor Cyan
Write-Host ""

# 1. Vérifier l'état du repository
Write-Host "1. Vérification de l'état du repository..." -ForegroundColor Yellow
git status
Write-Host ""

# 2. Afficher le remote actuel
Write-Host "2. Remote actuel:" -ForegroundColor Yellow
git remote -v
Write-Host ""

# 3. Changer le remote vers le nouveau repository
Write-Host "3. Configuration du nouveau repository..." -ForegroundColor Yellow
$newRepo = "https://github.com/sekadalle2024/Claraverse_windows_s_12_v0_31-03-2026_V5-Export_CAC-V0-Public.git"
git remote set-url origin $newRepo
Write-Host "Remote configuré vers: $newRepo" -ForegroundColor Green
Write-Host ""

# 4. Vérifier le changement
Write-Host "4. Vérification du nouveau remote:" -ForegroundColor Yellow
git remote -v
Write-Host ""

# 5. Afficher la branche actuelle
Write-Host "5. Branche actuelle:" -ForegroundColor Yellow
git branch
Write-Host ""

# 6. Push vers GitHub
Write-Host "6. Push vers GitHub..." -ForegroundColor Yellow
Write-Host "Commande: git push -u origin master" -ForegroundColor Cyan
git push -u origin master

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=== SAUVEGARDE REUSSIE ===" -ForegroundColor Green
    Write-Host "Votre projet a été sauvegardé sur:" -ForegroundColor Green
    Write-Host $newRepo -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "=== ERREUR LORS DU PUSH ===" -ForegroundColor Red
    Write-Host "Vérifiez vos identifiants GitHub ou la connexion réseau" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Appuyez sur une touche pour continuer..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
