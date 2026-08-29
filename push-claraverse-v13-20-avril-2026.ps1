# ============================================================================
# Script de Push ClaraVerse V13 - 20 Avril 2026
# Repository: Claverse_windows__v_13_20-04-2026_V5_docker_zeabur_ok_switch_editeur
# ============================================================================

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "  PUSH CLARAVERSE V13 - 20 AVRIL 2026" -ForegroundColor Cyan
Write-Host "  Repository: Claverse_windows__v_13_20-04-2026_V5_docker_zeabur_ok_switch_editeur" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# ÉTAPE 1: Configuration Git Optimale
# ============================================================================

Write-Host "ÉTAPE 1: Configuration Git..." -ForegroundColor Yellow
Write-Host ""

git config core.compression 0
git config http.postBuffer 2147483647
git config http.lowSpeedTime 999999
git config http.lowSpeedLimit 0
git config http.maxRequestBuffer 536870912

Write-Host "✓ Configuration Git appliquée" -ForegroundColor Green
Write-Host ""

# ============================================================================
# ÉTAPE 2: Vérifier l'État Git
# ============================================================================

Write-Host "ÉTAPE 2: Vérification de l'état Git..." -ForegroundColor Yellow
Write-Host ""

$status = git status --short
if ($status) {
    Write-Host "Fichiers modifiés détectés:" -ForegroundColor Cyan
    git status --short | Select-Object -First 20
    Write-Host ""
} else {
    Write-Host "✓ Aucun fichier modifié" -ForegroundColor Green
    Write-Host ""
}

# ============================================================================
# ÉTAPE 3: Ajouter Tous les Fichiers
# ============================================================================

Write-Host "ÉTAPE 3: Ajout des fichiers..." -ForegroundColor Yellow
Write-Host ""

git add .

Write-Host "✓ Fichiers ajoutés" -ForegroundColor Green
Write-Host ""

# ============================================================================
# ÉTAPE 4: Créer le Commit
# ============================================================================

Write-Host "ÉTAPE 4: Création du commit..." -ForegroundColor Yellow
Write-Host ""

$commitMessage = "Sauvegarde ClaraVerse V13 - 20-04-2026 - Docker Zeabur OK + Switch Editeur"
git commit -m $commitMessage

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Commit créé avec succès" -ForegroundColor Green
} else {
    Write-Host "ℹ Aucun changement à commiter ou commit déjà existant" -ForegroundColor Cyan
}
Write-Host ""

# ============================================================================
# ÉTAPE 5: Changer le Repository Distant
# ============================================================================

Write-Host "ÉTAPE 5: Configuration du repository distant..." -ForegroundColor Yellow
Write-Host ""

$newRepo = "https://github.com/sekadalle2024/Claverse_windows__v_13_20-04-2026_V5_docker_zeabur_ok_switch_editeur.git"

Write-Host "Repository actuel:" -ForegroundColor Cyan
git remote get-url origin
Write-Host ""

Write-Host "Changement vers:" -ForegroundColor Cyan
Write-Host $newRepo -ForegroundColor White
Write-Host ""

git remote set-url origin $newRepo

Write-Host "✓ Repository distant configuré" -ForegroundColor Green
Write-Host ""

# ============================================================================
# ÉTAPE 6: Vérifier la Connexion
# ============================================================================

Write-Host "ÉTAPE 6: Vérification de la connexion..." -ForegroundColor Yellow
Write-Host ""

Write-Host "Repository distant:" -ForegroundColor Cyan
git remote -v
Write-Host ""

# ============================================================================
# ÉTAPE 7: Voir la Branche Actuelle
# ============================================================================

Write-Host "ÉTAPE 7: Vérification de la branche..." -ForegroundColor Yellow
Write-Host ""

$branch = git branch --show-current
Write-Host "Branche actuelle: $branch" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# ÉTAPE 8: Push vers GitHub
# ============================================================================

Write-Host "ÉTAPE 8: Push vers GitHub..." -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠ Cela peut prendre plusieurs minutes pour un gros projet..." -ForegroundColor Yellow
Write-Host ""

$pushAttempts = 0
$maxAttempts = 3
$pushSuccess = $false

while ($pushAttempts -lt $maxAttempts -and -not $pushSuccess) {
    $pushAttempts++
    Write-Host "Tentative $pushAttempts/$maxAttempts..." -ForegroundColor Cyan
    
    git push -u origin $branch
    
    if ($LASTEXITCODE -eq 0) {
        $pushSuccess = $true
        Write-Host ""
        Write-Host "✓ Push réussi!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "✗ Échec de la tentative $pushAttempts" -ForegroundColor Red
        
        if ($pushAttempts -lt $maxAttempts) {
            Write-Host "Attente de 10 secondes avant nouvelle tentative..." -ForegroundColor Yellow
            Start-Sleep -Seconds 10
        }
    }
}

if (-not $pushSuccess) {
    Write-Host ""
    Write-Host "============================================================================" -ForegroundColor Red
    Write-Host "  ÉCHEC DU PUSH APRÈS $maxAttempts TENTATIVES" -ForegroundColor Red
    Write-Host "============================================================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Solutions alternatives:" -ForegroundColor Yellow
    Write-Host "1. Utiliser le script de commits multiples: .\push-commits-multiples-v13.ps1" -ForegroundColor Cyan
    Write-Host "2. Utiliser GitHub Desktop (recommandé pour gros projets)" -ForegroundColor Cyan
    Write-Host "3. Attendre quelques minutes et réessayer" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

Write-Host ""

# ============================================================================
# ÉTAPE 9: Vérification Finale
# ============================================================================

Write-Host "ÉTAPE 9: Vérification finale..." -ForegroundColor Yellow
Write-Host ""

Write-Host "État Git:" -ForegroundColor Cyan
git status
Write-Host ""

Write-Host "Derniers commits:" -ForegroundColor Cyan
git log -3 --oneline
Write-Host ""

# ============================================================================
# RÉSUMÉ FINAL
# ============================================================================

Write-Host "============================================================================" -ForegroundColor Green
Write-Host "  PUSH TERMINÉ AVEC SUCCÈS!" -ForegroundColor Green
Write-Host "============================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Repository GitHub:" -ForegroundColor Cyan
Write-Host $newRepo -ForegroundColor White
Write-Host ""
Write-Host "Branche: $branch" -ForegroundColor Cyan
Write-Host ""
Write-Host "✓ Votre projet ClaraVerse V13 est maintenant sauvegardé sur GitHub!" -ForegroundColor Green
Write-Host ""
Write-Host "Vérifiez sur:" -ForegroundColor Yellow
Write-Host "https://github.com/sekadalle2024/Claverse_windows__v_13_20-04-2026_V5_docker_zeabur_ok_switch_editeur" -ForegroundColor White
Write-Host ""
Write-Host "============================================================================" -ForegroundColor Green
Write-Host ""
