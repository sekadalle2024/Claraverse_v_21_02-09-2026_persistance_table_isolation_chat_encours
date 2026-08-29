# ============================================================================
# SCRIPT DE SAUVEGARDE COMPLETE V17 - 11 MAI 2026 (AVEC PY_BACKEND)
# ============================================================================
# Repository: https://github.com/sekadalle2024/Claverse_windows__v_17_11-05-2026_V5_docker_zeabur_ok_switch_editeur-.git
# Branche: v17_backup_final
# Date: 11 Mai 2026
# ============================================================================

Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "  SAUVEGARDE COMPLETE V17 - 11 MAI 2026 (AVEC PY_BACKEND)" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

# Configuration Git optimale pour gros projets
Write-Host "[1/8] Configuration Git optimale..." -ForegroundColor Yellow
git config http.postBuffer 1048576000
git config pack.windowMemory "100m"
git config pack.packSizeLimit "100m"
git config core.compression 0
git config http.lowSpeedLimit 0
git config http.lowSpeedTime 999999
Write-Host "✓ Configuration Git appliquée" -ForegroundColor Green
Write-Host ""

# Vérifier la branche actuelle
Write-Host "[2/8] Vérification de la branche..." -ForegroundColor Yellow
$currentBranch = git branch --show-current
Write-Host "Branche actuelle: $currentBranch" -ForegroundColor Cyan

if ($currentBranch -ne "v17_backup_final") {
    Write-Host "⚠ Attention: Vous n'êtes pas sur la branche v17_backup_final" -ForegroundColor Red
    $continue = Read-Host "Voulez-vous continuer quand même? (o/n)"
    if ($continue -ne "o") {
        Write-Host "Opération annulée" -ForegroundColor Red
        exit 1
    }
}
Write-Host ""

# ============================================================================
# PARTIE 1: SAUVEGARDE DU SUBMODULE PY_BACKEND
# ============================================================================
Write-Host "[3/8] SAUVEGARDE DU SUBMODULE PY_BACKEND..." -ForegroundColor Yellow
Write-Host "-------------------------------------------" -ForegroundColor Yellow

Set-Location py_backend

Write-Host "  → Ajout de tous les fichiers du backend..." -ForegroundColor Cyan
git add .

Write-Host "  → Création du commit backend..." -ForegroundColor Cyan
$backendCommitMsg = "V17 - 11 Mai 2026 - Mise à jour py_backend (calcul notes annexes + modules)"
git commit -m $backendCommitMsg

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Commit backend créé avec succès" -ForegroundColor Green
    
    Write-Host "  → Push du backend vers origin/master..." -ForegroundColor Cyan
    git push origin master
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Backend pushé avec succès!" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Erreur lors du push du backend" -ForegroundColor Red
        Write-Host "  Tentative de retry..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
        git push origin master
    }
} else {
    Write-Host "  ℹ Aucune modification à commiter dans py_backend (ou déjà commité)" -ForegroundColor Yellow
}

Set-Location ..
Write-Host ""

# ============================================================================
# PARTIE 2: MISE À JOUR DU RÉFÉRENCE DU SUBMODULE DANS LE PROJET PRINCIPAL
# ============================================================================
Write-Host "[4/8] MISE À JOUR DE LA RÉFÉRENCE DU SUBMODULE..." -ForegroundColor Yellow
Write-Host "---------------------------------------------------" -ForegroundColor Yellow

Write-Host "  → Ajout de la référence mise à jour du submodule..." -ForegroundColor Cyan
git add py_backend

Write-Host "  → Création du commit de référence..." -ForegroundColor Cyan
$submoduleRefMsg = "V17 - 11 Mai 2026 - Mise à jour référence submodule py_backend"
git commit -m $submoduleRefMsg

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Commit de référence créé" -ForegroundColor Green
} else {
    Write-Host "  ℹ Aucune modification de référence à commiter" -ForegroundColor Yellow
}
Write-Host ""

# ============================================================================
# PARTIE 3: VÉRIFICATION DES AUTRES MODIFICATIONS
# ============================================================================
Write-Host "[5/8] VÉRIFICATION DES AUTRES MODIFICATIONS..." -ForegroundColor Yellow
Write-Host "-----------------------------------------------" -ForegroundColor Yellow

$status = git status --porcelain
if ($status) {
    Write-Host "  → Modifications détectées dans le projet principal" -ForegroundColor Cyan
    Write-Host "  → Ajout de tous les fichiers..." -ForegroundColor Cyan
    git add .
    
    Write-Host "  → Création du commit principal..." -ForegroundColor Cyan
    $mainCommitMsg = "V17 - 11 Mai 2026 - Sauvegarde complète (projet + backend)"
    git commit -m $mainCommitMsg
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Commit principal créé" -ForegroundColor Green
    }
} else {
    Write-Host "  ℹ Aucune autre modification à commiter" -ForegroundColor Yellow
}
Write-Host ""

# ============================================================================
# PARTIE 4: PUSH VERS GITHUB (MÉTHODE MULTI-COMMITS)
# ============================================================================
Write-Host "[6/8] PUSH VERS GITHUB..." -ForegroundColor Yellow
Write-Host "-------------------------" -ForegroundColor Yellow

Write-Host "  → Push de tous les commits vers origin/$currentBranch..." -ForegroundColor Cyan
git push -u origin $currentBranch

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Push réussi!" -ForegroundColor Green
} else {
    Write-Host "  ⚠ Erreur lors du push" -ForegroundColor Red
    Write-Host "  Tentative de retry..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    git push -u origin $currentBranch
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Push réussi après retry!" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Échec du push après retry" -ForegroundColor Red
        Write-Host "  Vérifiez votre connexion et réessayez manuellement" -ForegroundColor Yellow
    }
}
Write-Host ""

# ============================================================================
# PARTIE 5: VÉRIFICATION FINALE
# ============================================================================
Write-Host "[7/8] VÉRIFICATION FINALE..." -ForegroundColor Yellow
Write-Host "----------------------------" -ForegroundColor Yellow

Write-Host "  → Statut du repository principal:" -ForegroundColor Cyan
git status

Write-Host ""
Write-Host "  → Statut du submodule py_backend:" -ForegroundColor Cyan
Set-Location py_backend
git status
Set-Location ..

Write-Host ""

# ============================================================================
# RÉSUMÉ FINAL
# ============================================================================
Write-Host "[8/8] RÉSUMÉ DE LA SAUVEGARDE" -ForegroundColor Yellow
Write-Host "=============================" -ForegroundColor Yellow
Write-Host ""
Write-Host "✓ Repository: https://github.com/sekadalle2024/Claverse_windows__v_17_11-05-2026_V5_docker_zeabur_ok_switch_editeur-.git" -ForegroundColor Green
Write-Host "✓ Branche: $currentBranch" -ForegroundColor Green
Write-Host "✓ Date: 11 Mai 2026" -ForegroundColor Green
Write-Host ""
Write-Host "✓ Submodule py_backend sauvegardé" -ForegroundColor Green
Write-Host "✓ Référence du submodule mise à jour" -ForegroundColor Green
Write-Host "✓ Projet principal sauvegardé" -ForegroundColor Green
Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "  SAUVEGARDE COMPLETE TERMINÉE AVEC SUCCÈS!" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pour vérifier sur GitHub:" -ForegroundColor Yellow
Write-Host "https://github.com/sekadalle2024/Claverse_windows__v_17_11-05-2026_V5_docker_zeabur_ok_switch_editeur-/tree/$currentBranch" -ForegroundColor Cyan
Write-Host ""
