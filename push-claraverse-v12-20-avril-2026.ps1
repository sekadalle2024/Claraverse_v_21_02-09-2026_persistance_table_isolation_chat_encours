# Script de push ClaraVerse V12 - 20 Avril 2026
# Repository: https://github.com/sekadalle2024/Claverse_windows__v_12_20-04-2026_V5_docker_zeabur.git

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  SAUVEGARDE CLARAVERSE V12 - 20 AVRIL 2026                      " -ForegroundColor Cyan
Write-Host "  Repository: Claverse_windows__v_12_20-04-2026_V5_docker_zeabur" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$repoUrl = "https://github.com/sekadalle2024/Claverse_windows__v_12_20-04-2026_V5_docker_zeabur.git"
$branche = "master"

# Étape 1: Configuration Git optimale
Write-Host "Étape 1/6: Configuration Git optimale..." -ForegroundColor Yellow
git config core.compression 0
git config http.postBuffer 2147483647
git config http.lowSpeedTime 999999
git config http.lowSpeedLimit 0
git config http.maxRequestBuffer 536870912
Write-Host "  ✓ Configuration appliquée" -ForegroundColor Green
Write-Host ""

# Étape 2: Vérifier l'état actuel
Write-Host "Étape 2/6: Vérification de l'état Git..." -ForegroundColor Yellow
git status
Write-Host ""

# Étape 3: Ajouter tous les fichiers
Write-Host "Étape 3/6: Ajout de tous les fichiers..." -ForegroundColor Yellow
git add .
Write-Host "  ✓ Fichiers ajoutés" -ForegroundColor Green
Write-Host ""

# Étape 4: Créer le commit
Write-Host "Étape 4/6: Création du commit..." -ForegroundColor Yellow
$commitMessage = "Sauvegarde ClaraVerse V12 - 20-04-2026 - Docker Zeabur"
git commit -m "$commitMessage"
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Commit créé: $commitMessage" -ForegroundColor Green
} else {
    Write-Host "  ⚠️ Aucun changement à commiter ou commit déjà existant" -ForegroundColor Yellow
}
Write-Host ""

# Étape 5: Changer le repository distant
Write-Host "Étape 5/6: Configuration du repository distant..." -ForegroundColor Yellow
git remote set-url origin $repoUrl
Write-Host "  ✓ Repository configuré:" -ForegroundColor Green
git remote -v
Write-Host ""

# Étape 6: Vérifier la branche
Write-Host "Étape 6/6: Vérification de la branche..." -ForegroundColor Yellow
$currentBranch = git branch --show-current
Write-Host "  Branche actuelle: $currentBranch" -ForegroundColor Gray

if ($currentBranch -ne $branche) {
    Write-Host "  ⚠️ Attention: Vous êtes sur la branche '$currentBranch'" -ForegroundColor Yellow
    Write-Host "  Le push sera effectué vers: origin/$currentBranch" -ForegroundColor Yellow
    $branche = $currentBranch
}
Write-Host ""

# Étape 7: Push vers GitHub
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  PUSH VERS GITHUB                                               " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Commande à exécuter:" -ForegroundColor Yellow
Write-Host "  git push -u origin $branche" -ForegroundColor White
Write-Host ""
Write-Host "Voulez-vous effectuer le push maintenant? (O/N)" -ForegroundColor Yellow
$response = Read-Host

if ($response -eq "O" -or $response -eq "o") {
    Write-Host ""
    Write-Host "Push en cours..." -ForegroundColor Yellow
    git push -u origin $branche
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "=================================================================" -ForegroundColor Green
        Write-Host "  ✓ PUSH RÉUSSI !                                               " -ForegroundColor Green
        Write-Host "=================================================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Vérification finale..." -ForegroundColor Yellow
        git status
        Write-Host ""
        Write-Host "Repository GitHub:" -ForegroundColor Cyan
        Write-Host "  $repoUrl" -ForegroundColor White
    } else {
        Write-Host ""
        Write-Host "=================================================================" -ForegroundColor Red
        Write-Host "  ✗ ÉCHEC DU PUSH                                               " -ForegroundColor Red
        Write-Host "=================================================================" -ForegroundColor Red
        Write-Host ""
        Write-Host "Solutions possibles:" -ForegroundColor Yellow
        Write-Host "  1. Vérifier votre connexion Internet" -ForegroundColor White
        Write-Host "  2. Attendre quelques minutes et réessayer" -ForegroundColor White
        Write-Host "  3. Utiliser le script avec commits multiples:" -ForegroundColor White
        Write-Host "     .\push-commits-multiples-v12.ps1" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Pour plus d'aide, consulter:" -ForegroundColor Yellow
        Write-Host "  Doc_Github_Issue\SOLUTION_PROJET_2.2GB_20_AVRIL_2026.md" -ForegroundColor Gray
    }
} else {
    Write-Host ""
    Write-Host "Push annulé." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Pour effectuer le push manuellement:" -ForegroundColor Cyan
    Write-Host "  git push -u origin $branche" -ForegroundColor White
}

Write-Host ""
