# Script de sauvegarde du backend Python vers GitHub
# Repository: https://github.com/sekadalle2024/Back-end-python-V0_03_03_2026.git
# Date: 19 avril 2026 - Version 10

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SAUVEGARDE BACKEND PYTHON - V10" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Étape 1: Vérifier le dossier py_backend
Write-Host "[1/7] Vérification du dossier py_backend..." -ForegroundColor Yellow
if (Test-Path "py_backend") {
    $fileCount = (Get-ChildItem -Path "py_backend" -Recurse -File).Count
    Write-Host "      OK - $fileCount fichiers trouvés" -ForegroundColor Green
} else {
    Write-Host "      ERREUR - Dossier py_backend non trouvé!" -ForegroundColor Red
    exit 1
}

# Étape 2: Sauvegarder le remote actuel
Write-Host ""
Write-Host "[2/7] Sauvegarde du remote actuel..." -ForegroundColor Yellow
$originalRemote = git remote get-url origin
Write-Host "      Remote actuel: $originalRemote" -ForegroundColor Gray

# Étape 3: Ajouter les fichiers du backend
Write-Host ""
Write-Host "[3/7] Ajout des fichiers py_backend/..." -ForegroundColor Yellow
git add py_backend/
Write-Host "      OK - Fichiers ajoutés" -ForegroundColor Green

# Étape 4: Créer le commit
Write-Host ""
Write-Host "[4/7] Création du commit..." -ForegroundColor Yellow
$commitDate = Get-Date -Format "dd_MM_yyyy_HH_mm"
$commitMessage = "Sauvegarde Backend Python - V10 - $commitDate"
git commit -m $commitMessage
Write-Host "      OK - Commit créé: $commitMessage" -ForegroundColor Green

# Étape 5: Changer le remote vers le repo backend
Write-Host ""
Write-Host "[5/7] Changement du remote vers le repo backend..." -ForegroundColor Yellow
git remote set-url origin https://github.com/sekadalle2024/Back-end-python-V0_03_03_2026.git
$newRemote = git remote get-url origin
Write-Host "      OK - Remote changé: $newRemote" -ForegroundColor Green

# Étape 6: Push vers GitHub avec force
Write-Host ""
Write-Host "[6/7] Push vers GitHub..." -ForegroundColor Yellow
Write-Host ""
Write-Host "      ATTENTION: Push avec --force" -ForegroundColor Red
Write-Host "      Cela écrasera la version distante" -ForegroundColor Red
Write-Host ""
$confirmation = Read-Host "      Continuer? (o/n)"

if ($confirmation -eq "o" -or $confirmation -eq "O") {
    Write-Host ""
    Write-Host "      Push en cours..." -ForegroundColor Yellow
    git push -u origin master --force
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "      OK - Push réussi!" -ForegroundColor Green
    } else {
        Write-Host "      ERREUR - Le push a échoué" -ForegroundColor Red
        Write-Host "      Restauration du remote..." -ForegroundColor Yellow
        git remote set-url origin $originalRemote
        exit 1
    }
} else {
    Write-Host "      Annulé par l'utilisateur" -ForegroundColor Yellow
    Write-Host "      Restauration du remote..." -ForegroundColor Yellow
    git remote set-url origin $originalRemote
    exit 0
}

# Étape 7: Restaurer le remote original
Write-Host ""
Write-Host "[7/7] Restauration du remote original..." -ForegroundColor Yellow
git remote set-url origin $originalRemote
$restoredRemote = git remote get-url origin
Write-Host "      OK - Remote restauré: $restoredRemote" -ForegroundColor Green

# Résumé final
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  SAUVEGARDE TERMINÉE AVEC SUCCÈS!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Repository backend:" -ForegroundColor Cyan
Write-Host "  https://github.com/sekadalle2024/Back-end-python-V0_03_03_2026" -ForegroundColor White
Write-Host ""
Write-Host "Commit: $commitMessage" -ForegroundColor Cyan
Write-Host ""
Write-Host "Remote restauré au repo principal" -ForegroundColor Green
Write-Host ""
