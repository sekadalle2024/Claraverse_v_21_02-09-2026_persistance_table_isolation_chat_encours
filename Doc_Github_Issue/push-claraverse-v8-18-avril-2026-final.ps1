# ============================================
# Script de sauvegarde ClaraVerse V8 - 18 Avril 2026
# Repository: Claverse_windows__v8_18-04-2026_V5-Export_CAC-V0-Public
# ============================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SAUVEGARDE CLARAVERSE V8 - 18 AVRIL 2026" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier la connexion Git
Write-Host "[1/6] Vérification de la configuration Git..." -ForegroundColor Yellow
git remote -v
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERREUR: Problème avec la configuration Git" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Configuration Git OK" -ForegroundColor Green
Write-Host ""

# Ajouter tous les fichiers modifiés et nouveaux
Write-Host "[2/6] Ajout des fichiers..." -ForegroundColor Yellow
git add .
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERREUR: Échec de l'ajout des fichiers" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Fichiers ajoutés" -ForegroundColor Green
Write-Host ""

# Créer le commit
Write-Host "[3/6] Création du commit..." -ForegroundColor Yellow
$commitMessage = "Sauvegarde ClaraVerse V8 - 18 Avril 2026

- Mise à jour complète du projet
- Corrections et améliorations diverses
- Documentation mise à jour
- Scripts de déploiement actualisés"

git commit -m $commitMessage
if ($LASTEXITCODE -ne 0) {
    Write-Host "AVERTISSEMENT: Aucun changement à commiter ou erreur" -ForegroundColor Yellow
}
Write-Host "✓ Commit créé" -ForegroundColor Green
Write-Host ""

# Vérifier le statut
Write-Host "[4/6] Vérification du statut..." -ForegroundColor Yellow
git status
Write-Host ""

# Pousser vers GitHub avec gestion des gros fichiers
Write-Host "[5/6] Push vers GitHub..." -ForegroundColor Yellow
Write-Host "ATTENTION: Le projet fait plus de 140MB" -ForegroundColor Yellow
Write-Host "Le push peut prendre plusieurs minutes..." -ForegroundColor Yellow
Write-Host ""

# Configuration pour les gros fichiers
git config http.postBuffer 524288000
git config http.maxRequestBuffer 100M
git config core.compression 0

# Push avec retry en cas d'échec
$maxRetries = 3
$retryCount = 0
$pushSuccess = $false

while ((-not $pushSuccess) -and ($retryCount -lt $maxRetries)) {
    Write-Host "Tentative de push $($retryCount + 1)/$maxRetries..." -ForegroundColor Cyan
    
    git push -u origin master
    
    if ($LASTEXITCODE -eq 0) {
        $pushSuccess = $true
        Write-Host "✓ Push réussi!" -ForegroundColor Green
    } else {
        $retryCount++
        if ($retryCount -lt $maxRetries) {
            Write-Host "Échec du push. Nouvelle tentative dans 5 secondes..." -ForegroundColor Yellow
            Start-Sleep -Seconds 5
        } else {
            Write-Host "ERREUR: Échec du push après $maxRetries tentatives" -ForegroundColor Red
            Write-Host ""
            Write-Host "SOLUTIONS POSSIBLES:" -ForegroundColor Yellow
            Write-Host "1. Vérifiez votre connexion Internet" -ForegroundColor White
            Write-Host "2. Vérifiez vos identifiants GitHub" -ForegroundColor White
            Write-Host "3. Utilisez le script push-commits-multiples si le fichier est trop gros" -ForegroundColor White
            exit 1
        }
    }
}
Write-Host ""

# Résumé final
Write-Host "[6/6] RÉSUMÉ" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✓ Sauvegarde terminée avec succès!" -ForegroundColor Green
Write-Host ""
Write-Host "Repository: Claverse_windows__v8_18-04-2026_V5-Export_CAC-V0-Public" -ForegroundColor White
Write-Host "Branche: master" -ForegroundColor White
Write-Host "Date: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')" -ForegroundColor White
Write-Host ""
Write-Host "Votre projet est maintenant sauvegardé sur GitHub!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
