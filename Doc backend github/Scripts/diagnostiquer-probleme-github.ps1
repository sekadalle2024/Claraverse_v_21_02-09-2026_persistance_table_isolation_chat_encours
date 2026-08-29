# ============================================================================
# Script de Diagnostic - Problème Fichiers Non Visibles sur GitHub
# ============================================================================
# 
# Description: Diagnostique pourquoi les fichiers ne s'affichent pas sur GitHub
# Date: 23 Avril 2026
# Version: 1.0.0
# ============================================================================

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "     DIAGNOSTIC - FICHIERS NON VISIBLES SUR GITHUB" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# ÉTAPE 1: Vérification de la branche
# ============================================================================

Write-Host "1. VÉRIFICATION DE LA BRANCHE" -ForegroundColor Yellow
Write-Host "   -------------------------" -ForegroundColor Yellow
Write-Host ""

$currentBranch = git branch --show-current
Write-Host "   Branche actuelle: $currentBranch" -ForegroundColor Cyan

$allBranches = git branch -a
Write-Host ""
Write-Host "   Toutes les branches:" -ForegroundColor Cyan
$allBranches | ForEach-Object { Write-Host "   $_" -ForegroundColor White }

# ============================================================================
# ÉTAPE 2: Vérification du dernier commit LOCAL
# ============================================================================

Write-Host ""
Write-Host "2. DERNIER COMMIT LOCAL" -ForegroundColor Yellow
Write-Host "   --------------------" -ForegroundColor Yellow
Write-Host ""

Write-Host "   Informations du commit:" -ForegroundColor Cyan
git log -1 --pretty=format:"   Hash: %H%n   Auteur: %an%n   Date: %ad%n   Message: %s%n" --date=format:"%d/%m/%Y %H:%M"

Write-Host ""
Write-Host "   Fichiers modifiés dans ce commit:" -ForegroundColor Cyan
$localFiles = git log -1 --stat --name-only --pretty="" py_backend/
if ($localFiles) {
    $localFiles | ForEach-Object { Write-Host "   ✓ $_" -ForegroundColor Green }
} else {
    Write-Host "   ⚠ Aucun fichier py_backend/ dans le dernier commit" -ForegroundColor Yellow
}

# ============================================================================
# ÉTAPE 3: Vérification du dernier commit DISTANT
# ============================================================================

Write-Host ""
Write-Host "3. DERNIER COMMIT DISTANT (GitHub)" -ForegroundColor Yellow
Write-Host "   --------------------------------" -ForegroundColor Yellow
Write-Host ""

Write-Host "   Récupération de l'état distant..." -ForegroundColor Cyan
git fetch origin 2>&1 | Out-Null

Write-Host ""
Write-Host "   Informations du commit distant:" -ForegroundColor Cyan
git log origin/$currentBranch -1 --pretty=format:"   Hash: %H%n   Auteur: %an%n   Date: %ad%n   Message: %s%n" --date=format:"%d/%m/%Y %H:%M"

Write-Host ""
Write-Host "   Fichiers modifiés dans le commit distant:" -ForegroundColor Cyan
$remoteFiles = git log origin/$currentBranch -1 --stat --name-only --pretty="" py_backend/
if ($remoteFiles) {
    $remoteFiles | ForEach-Object { Write-Host "   ✓ $_" -ForegroundColor Green }
} else {
    Write-Host "   ⚠ Aucun fichier py_backend/ dans le commit distant" -ForegroundColor Yellow
}

# ============================================================================
# ÉTAPE 4: Comparaison LOCAL vs DISTANT
# ============================================================================

Write-Host ""
Write-Host "4. COMPARAISON LOCAL vs DISTANT" -ForegroundColor Yellow
Write-Host "   -----------------------------" -ForegroundColor Yellow
Write-Host ""

$diff = git diff $currentBranch origin/$currentBranch --name-only py_backend/
if ($diff) {
    Write-Host "   ⚠ DIFFÉRENCES DÉTECTÉES:" -ForegroundColor Red
    Write-Host ""
    $diff | ForEach-Object { Write-Host "   • $_" -ForegroundColor Yellow }
    Write-Host ""
    Write-Host "   ➜ Les fichiers locaux ne sont PAS synchronisés avec GitHub" -ForegroundColor Red
} else {
    Write-Host "   ✓ Aucune différence - Local et distant sont synchronisés" -ForegroundColor Green
}

# ============================================================================
# ÉTAPE 5: Vérification des fichiers ignorés
# ============================================================================

Write-Host ""
Write-Host "5. VÉRIFICATION DES FICHIERS IGNORÉS" -ForegroundColor Yellow
Write-Host "   -----------------------------------" -ForegroundColor Yellow
Write-Host ""

Write-Host "   Fichiers ignorés dans py_backend/:" -ForegroundColor Cyan
$ignoredFiles = git status --ignored py_backend/ --short | Select-String "^!!"
if ($ignoredFiles) {
    $ignoredFiles | ForEach-Object { Write-Host "   $_" -ForegroundColor Yellow }
    Write-Host ""
    Write-Host "   ⚠ Des fichiers sont ignorés par .gitignore" -ForegroundColor Yellow
} else {
    Write-Host "   ✓ Aucun fichier ignoré" -ForegroundColor Green
}

# ============================================================================
# ÉTAPE 6: Vérification des fichiers trackés
# ============================================================================

Write-Host ""
Write-Host "6. FICHIERS TRACKÉS PAR GIT" -ForegroundColor Yellow
Write-Host "   -------------------------" -ForegroundColor Yellow
Write-Host ""

Write-Host "   Fichiers py_backend/ dans le repository:" -ForegroundColor Cyan
$trackedFiles = git ls-tree -r $currentBranch --name-only | Select-String "^py_backend/"
if ($trackedFiles) {
    $fileCount = ($trackedFiles | Measure-Object).Count
    Write-Host "   ✓ $fileCount fichiers trackés" -ForegroundColor Green
    Write-Host ""
    Write-Host "   Premiers 10 fichiers:" -ForegroundColor Cyan
    $trackedFiles | Select-Object -First 10 | ForEach-Object { Write-Host "   • $_" -ForegroundColor White }
    if ($fileCount -gt 10) {
        Write-Host "   ... et $($fileCount - 10) autres fichiers" -ForegroundColor Gray
    }
} else {
    Write-Host "   ⚠ Aucun fichier py_backend/ tracké!" -ForegroundColor Red
}

# ============================================================================
# ÉTAPE 7: Vérification du remote
# ============================================================================

Write-Host ""
Write-Host "7. VÉRIFICATION DU REMOTE" -ForegroundColor Yellow
Write-Host "   -----------------------" -ForegroundColor Yellow
Write-Host ""

$remoteUrl = git remote get-url origin
Write-Host "   Remote actuel: $remoteUrl" -ForegroundColor Cyan

$expectedBackendUrl = "https://github.com/sekadalle2024/Back-end-python-V0_03_03_2026.git"
if ($remoteUrl -eq $expectedBackendUrl) {
    Write-Host "   ⚠ Remote pointe vers le repository BACKEND" -ForegroundColor Yellow
    Write-Host "   ➜ C'est normal pendant le push, mais devrait être restauré après" -ForegroundColor Yellow
} else {
    Write-Host "   ✓ Remote pointe vers le repository principal" -ForegroundColor Green
}

# ============================================================================
# ÉTAPE 8: Vérification de l'état de travail
# ============================================================================

Write-Host ""
Write-Host "8. ÉTAT DE TRAVAIL ACTUEL" -ForegroundColor Yellow
Write-Host "   -----------------------" -ForegroundColor Yellow
Write-Host ""

$status = git status py_backend/ --short
if ($status) {
    Write-Host "   Modifications non commitées:" -ForegroundColor Cyan
    $status | ForEach-Object { Write-Host "   $_" -ForegroundColor Yellow }
} else {
    Write-Host "   ✓ Aucune modification en attente" -ForegroundColor Green
}

# ============================================================================
# DIAGNOSTIC FINAL
# ============================================================================

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "                    DIAGNOSTIC FINAL" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Analyser les résultats
$issues = @()

# Vérifier si local et distant sont différents
if ($diff) {
    $issues += "❌ Local et distant ne sont PAS synchronisés"
}

# Vérifier si des fichiers sont ignorés
if ($ignoredFiles) {
    $issues += "⚠ Des fichiers sont ignorés par .gitignore"
}

# Vérifier si des fichiers sont trackés
if (-not $trackedFiles) {
    $issues += "❌ Aucun fichier py_backend/ n'est tracké par Git"
}

# Vérifier si des modifications sont en attente
if ($status) {
    $issues += "⚠ Des modifications ne sont pas commitées"
}

if ($issues.Count -eq 0) {
    Write-Host "✓ AUCUN PROBLÈME DÉTECTÉ" -ForegroundColor Green
    Write-Host ""
    Write-Host "Le repository local est synchronisé avec GitHub." -ForegroundColor Green
    Write-Host ""
    Write-Host "Si les fichiers ne s'affichent pas sur GitHub:" -ForegroundColor Yellow
    Write-Host "  1. Attendez 2-3 minutes (cache GitHub)" -ForegroundColor White
    Write-Host "  2. Rafraîchissez la page (F5)" -ForegroundColor White
    Write-Host "  3. Vérifiez l'historique des commits sur GitHub" -ForegroundColor White
} else {
    Write-Host "PROBLÈMES DÉTECTÉS:" -ForegroundColor Red
    Write-Host ""
    foreach ($issue in $issues) {
        Write-Host "  $issue" -ForegroundColor Yellow
    }
    Write-Host ""
    Write-Host "SOLUTIONS RECOMMANDÉES:" -ForegroundColor Cyan
    Write-Host ""
    
    if ($diff) {
        Write-Host "  1. Re-pusher vers GitHub:" -ForegroundColor White
        Write-Host "     .\Doc` backend` github\Scripts\push-backend-to-github.ps1" -ForegroundColor Gray
        Write-Host ""
    }
    
    if ($status) {
        Write-Host "  2. Commiter les modifications en attente:" -ForegroundColor White
        Write-Host "     git add py_backend/" -ForegroundColor Gray
        Write-Host "     git commit -m 'Mise à jour backend'" -ForegroundColor Gray
        Write-Host ""
    }
    
    if (-not $trackedFiles) {
        Write-Host "  3. Ajouter les fichiers au tracking:" -ForegroundColor White
        Write-Host "     git add -f py_backend/" -ForegroundColor Gray
        Write-Host "     git commit -m 'Ajout fichiers backend'" -ForegroundColor Gray
        Write-Host ""
    }
}

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pour vérifier sur GitHub:" -ForegroundColor Cyan
Write-Host "  https://github.com/sekadalle2024/Back-end-python-V0_03_03_2026" -ForegroundColor White
Write-Host ""
