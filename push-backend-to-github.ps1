# Script de sauvegarde du backend Python vers GitHub
# Repository: https://github.com/sekadalle2024/Back-end-python-V0_03_03_2026.git

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SAUVEGARDE BACKEND PYTHON VERS GITHUB" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Vérifier qu'on est dans le bon dossier
Write-Host "1. Vérification du dossier py_backend..." -ForegroundColor Yellow
if (Test-Path "py_backend") {
    Write-Host "   ✓ Dossier py_backend trouvé" -ForegroundColor Green
} else {
    Write-Host "   ✗ Dossier py_backend non trouvé!" -ForegroundColor Red
    exit 1
}

# 2. Ajouter tous les fichiers du backend
Write-Host ""
Write-Host "2. Ajout des fichiers du backend..." -ForegroundColor Yellow
git add py_backend/
Write-Host "   ✓ Fichiers ajoutés" -ForegroundColor Green

# 3. Créer un commit avec la date
$date = Get-Date -Format "dd/MM/yyyy HH:mm"
$commitMessage = "Sauvegarde Backend Python - $date"
Write-Host ""
Write-Host "3. Création du commit..." -ForegroundColor Yellow
Write-Host "   Message: $commitMessage" -ForegroundColor Cyan
git commit -m "$commitMessage"

# 4. Sauvegarder le remote actuel
Write-Host ""
Write-Host "4. Configuration du remote..." -ForegroundColor Yellow
$currentRemote = git remote get-url origin
Write-Host "   Remote actuel: $currentRemote" -ForegroundColor Gray

# 5. Changer temporairement vers le repository backend
$backendRepo = "https://github.com/sekadalle2024/Back-end-python-V0_03_03_2026.git"
Write-Host "   Changement vers: $backendRepo" -ForegroundColor Cyan
git remote set-url origin $backendRepo

# 6. Vérifier la connexion
Write-Host ""
Write-Host "5. Vérification de la connexion..." -ForegroundColor Yellow
git remote -v

# 7. Push vers GitHub
Write-Host ""
Write-Host "6. Push vers GitHub..." -ForegroundColor Yellow
Write-Host "   ATTENTION: Utilisation de --force pour écraser la version distante" -ForegroundColor Red
$response = Read-Host "   Continuer? (o/n)"
if ($response -eq "o" -or $response -eq "O") {
    git push -u origin master --force
    Write-Host "   ✓ Push réussi!" -ForegroundColor Green
} else {
    Write-Host "   ✗ Push annulé" -ForegroundColor Yellow
}

# 8. Restaurer le remote original
Write-Host ""
Write-Host "7. Restauration du remote original..." -ForegroundColor Yellow
git remote set-url origin $currentRemote
Write-Host "   ✓ Remote restauré: $currentRemote" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SAUVEGARDE TERMINÉE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
