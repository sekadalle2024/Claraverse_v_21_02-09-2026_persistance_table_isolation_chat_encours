# Script de sauvegarde du backend Python vers GitHub
# Repository: https://github.com/sekadalle2024/Back-end-python-V0_03_03_2026.git
# Date: 19 avril 2026

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "        SAUVEGARDE BACKEND PYTHON VERS GITHUB" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Vérifier qu'on est dans le bon dossier
Write-Host "1. Vérification du dossier py_backend..." -ForegroundColor Yellow
if (Test-Path "py_backend") {
    Write-Host "   OK - Dossier py_backend trouvé" -ForegroundColor Green
} else {
    Write-Host "   ERREUR - Dossier py_backend non trouvé!" -ForegroundColor Red
    Write-Host "   Assurez-vous d'exécuter ce script depuis la racine du projet" -ForegroundColor Red
    exit 1
}

# 2. Vérifier l'état du dossier backend
Write-Host ""
Write-Host "2. Vérification de l'état du backend..." -ForegroundColor Yellow
$status = git status py_backend/ --short
if ($status) {
    Write-Host "   Modifications détectées:" -ForegroundColor Cyan
    git status py_backend/ --short
} else {
    Write-Host "   INFO - Aucune modification détectée dans py_backend/" -ForegroundColor Gray
    $continue = Read-Host "   Continuer quand même? (o/n)"
    if ($continue -ne "o" -and $continue -ne "O") {
        Write-Host "   Opération annulée" -ForegroundColor Yellow
        exit 0
    }
}

# 3. Ajouter tous les fichiers du backend
Write-Host ""
Write-Host "3. Ajout des fichiers du backend..." -ForegroundColor Yellow
git add py_backend/
Write-Host "   OK - Fichiers ajoutés" -ForegroundColor Green

# 4. Créer un commit avec la date
$date = Get-Date -Format "dd/MM/yyyy HH:mm"
$commitMessage = "Sauvegarde Backend Python - $date"
Write-Host ""
Write-Host "4. Création du commit..." -ForegroundColor Yellow
Write-Host "   Message: $commitMessage" -ForegroundColor Cyan

$commitResult = git commit -m "$commitMessage" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   OK - Commit créé avec succès" -ForegroundColor Green
} elseif ($commitResult -match "nothing to commit") {
    Write-Host "   INFO - Rien à commiter (working tree clean)" -ForegroundColor Gray
} else {
    Write-Host "   Résultat du commit:" -ForegroundColor Yellow
    Write-Host "   $commitResult" -ForegroundColor Gray
}

# 5. Sauvegarder le remote actuel
Write-Host ""
Write-Host "5. Configuration du remote..." -ForegroundColor Yellow
$currentRemote = git remote get-url origin
Write-Host "   Remote actuel: $currentRemote" -ForegroundColor Gray

# 6. Changer temporairement vers le repository backend
$backendRepo = "https://github.com/sekadalle2024/Back-end-python-V0_03_03_2026.git"
Write-Host "   Changement vers: $backendRepo" -ForegroundColor Cyan
git remote set-url origin $backendRepo

# 7. Vérifier la connexion
Write-Host ""
Write-Host "6. Vérification de la connexion..." -ForegroundColor Yellow
git remote -v

# 8. Afficher l'avertissement
Write-Host ""
Write-Host "================================================================" -ForegroundColor Red
Write-Host "                    AVERTISSEMENT" -ForegroundColor Red
Write-Host "================================================================" -ForegroundColor Red
Write-Host ""
Write-Host "Le push va utiliser --force pour écraser la version distante" -ForegroundColor Yellow
Write-Host "La version LOCALE sera prioritaire" -ForegroundColor Yellow
Write-Host ""
Write-Host "Repository cible:" -ForegroundColor Cyan
Write-Host "  $backendRepo" -ForegroundColor White
Write-Host ""

# 9. Demander confirmation
$response = Read-Host "Continuer avec le push --force? (o/n)"
if ($response -eq "o" -or $response -eq "O") {
    Write-Host ""
    Write-Host "7. Push vers GitHub..." -ForegroundColor Yellow
    
    $pushResult = git push -u origin master --force 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   OK - Push réussi!" -ForegroundColor Green
        Write-Host ""
        Write-Host "   Résultat:" -ForegroundColor Cyan
        Write-Host "   $pushResult" -ForegroundColor Gray
    } else {
        Write-Host "   ERREUR lors du push" -ForegroundColor Red
        Write-Host "   $pushResult" -ForegroundColor Red
    }
} else {
    Write-Host ""
    Write-Host "   Push annulé par l'utilisateur" -ForegroundColor Yellow
}

# 10. Restaurer le remote original
Write-Host ""
Write-Host "8. Restauration du remote original..." -ForegroundColor Yellow
git remote set-url origin $currentRemote
$restoredRemote = git remote get-url origin
Write-Host "   OK - Remote restauré: $restoredRemote" -ForegroundColor Green

# 11. Vérification finale
Write-Host ""
Write-Host "9. Vérification finale..." -ForegroundColor Yellow
git remote -v

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "                    OPÉRATION TERMINÉE" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Vérifiez sur GitHub:" -ForegroundColor Cyan
Write-Host "  https://github.com/sekadalle2024/Back-end-python-V0_03_03_2026" -ForegroundColor White
Write-Host ""
