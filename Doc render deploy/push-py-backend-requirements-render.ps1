# ═══════════════════════════════════════════════════════════════════════════════
# Script: Push py_backend avec requirements_render.txt vers GitHub
# Date: 16 Avril 2026
# Repository: https://github.com/sekadalle2024/Back-end-python-V0_03_03_2026.git
# ═══════════════════════════════════════════════════════════════════════════════

Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   SAUVEGARDE PY_BACKEND VERS GITHUB - 16 AVRIL 2026" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# ═══════════════════════════════════════════════════════════════════════════════
# ÉTAPE 1: Vérifier que nous sommes dans le bon dossier
# ═══════════════════════════════════════════════════════════════════════════════

Write-Host "📍 ÉTAPE 1: Vérification du dossier py_backend..." -ForegroundColor Yellow

if (-Not (Test-Path "py_backend")) {
    Write-Host "❌ ERREUR: Le dossier py_backend n'existe pas ici!" -ForegroundColor Red
    Write-Host "   Vous devez exécuter ce script depuis la racine du projet Claraverse" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Dossier py_backend trouvé" -ForegroundColor Green
Write-Host ""

# ═══════════════════════════════════════════════════════════════════════════════
# ÉTAPE 2: Vérifier que requirements_render.txt existe
# ═══════════════════════════════════════════════════════════════════════════════

Write-Host "📍 ÉTAPE 2: Vérification de requirements_render.txt..." -ForegroundColor Yellow

if (-Not (Test-Path "py_backend/requirements_render.txt")) {
    Write-Host "❌ ERREUR: Le fichier requirements_render.txt n'existe pas!" -ForegroundColor Red
    Write-Host "   Ce fichier est nécessaire pour le déploiement sur Render" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Fichier requirements_render.txt trouvé" -ForegroundColor Green
Write-Host ""

# ═══════════════════════════════════════════════════════════════════════════════
# ÉTAPE 3: Vérifier la configuration Git
# ═══════════════════════════════════════════════════════════════════════════════

Write-Host "📍 ÉTAPE 3: Vérification de la configuration Git..." -ForegroundColor Yellow

# Vérifier le remote origin
$remoteUrl = git remote get-url origin 2>$null

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERREUR: Aucun remote 'origin' configuré!" -ForegroundColor Red
    Write-Host "   Configuration du remote..." -ForegroundColor Yellow
    git remote add origin https://github.com/sekadalle2024/Back-end-python-V0_03_03_2026.git
    Write-Host "✅ Remote configuré" -ForegroundColor Green
} else {
    Write-Host "   Remote actuel: $remoteUrl" -ForegroundColor Cyan
    
    # Vérifier si c'est le bon repository
    if ($remoteUrl -notlike "*Back-end-python-V0_03_03_2026*") {
        Write-Host "⚠️  Le remote ne pointe pas vers le bon repository!" -ForegroundColor Yellow
        Write-Host "   Mise à jour du remote..." -ForegroundColor Yellow
        git remote set-url origin https://github.com/sekadalle2024/Back-end-python-V0_03_03_2026.git
        Write-Host "✅ Remote mis à jour" -ForegroundColor Green
    } else {
        Write-Host "✅ Remote correct" -ForegroundColor Green
    }
}

Write-Host ""

# ═══════════════════════════════════════════════════════════════════════════════
# ÉTAPE 4: Vérifier la branche actuelle
# ═══════════════════════════════════════════════════════════════════════════════

Write-Host "📍 ÉTAPE 4: Vérification de la branche..." -ForegroundColor Yellow

$currentBranch = git branch --show-current

if ([string]::IsNullOrEmpty($currentBranch)) {
    Write-Host "❌ ERREUR: Impossible de déterminer la branche actuelle!" -ForegroundColor Red
    exit 1
}

Write-Host "   Branche actuelle: $currentBranch" -ForegroundColor Cyan
Write-Host "✅ Branche identifiée" -ForegroundColor Green
Write-Host ""

# ═══════════════════════════════════════════════════════════════════════════════
# ÉTAPE 5: Vérifier les fichiers modifiés
# ═══════════════════════════════════════════════════════════════════════════════

Write-Host "📍 ÉTAPE 5: Vérification des fichiers modifiés..." -ForegroundColor Yellow

$status = git status --porcelain py_backend/

if ([string]::IsNullOrEmpty($status)) {
    Write-Host "⚠️  Aucun fichier modifié dans py_backend/" -ForegroundColor Yellow
    Write-Host "   Voulez-vous continuer quand même? (O/N)" -ForegroundColor Yellow
    $response = Read-Host
    if ($response -ne "O" -and $response -ne "o") {
        Write-Host "❌ Opération annulée" -ForegroundColor Red
        exit 0
    }
} else {
    Write-Host "   Fichiers modifiés:" -ForegroundColor Cyan
    Write-Host $status -ForegroundColor Gray
    Write-Host "✅ Fichiers à sauvegarder détectés" -ForegroundColor Green
}

Write-Host ""

# ═══════════════════════════════════════════════════════════════════════════════
# ÉTAPE 6: Ajouter les fichiers
# ═══════════════════════════════════════════════════════════════════════════════

Write-Host "📍 ÉTAPE 6: Ajout des fichiers au staging..." -ForegroundColor Yellow

git add py_backend/

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERREUR lors de l'ajout des fichiers!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Fichiers ajoutés au staging" -ForegroundColor Green
Write-Host ""

# ═══════════════════════════════════════════════════════════════════════════════
# ÉTAPE 7: Créer le commit
# ═══════════════════════════════════════════════════════════════════════════════

Write-Host "📍 ÉTAPE 7: Création du commit..." -ForegroundColor Yellow

$commitMessage = "Backend Python - Ajout requirements_render.txt pour Render - 16 Avril 2026"

git commit -m "$commitMessage"

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Aucun changement à commiter ou erreur lors du commit" -ForegroundColor Yellow
    Write-Host "   Vérification du statut..." -ForegroundColor Yellow
    git status
    Write-Host ""
    Write-Host "   Voulez-vous continuer avec le push? (O/N)" -ForegroundColor Yellow
    $response = Read-Host
    if ($response -ne "O" -and $response -ne "o") {
        Write-Host "❌ Opération annulée" -ForegroundColor Red
        exit 0
    }
} else {
    Write-Host "✅ Commit créé avec succès" -ForegroundColor Green
}

Write-Host ""

# ═══════════════════════════════════════════════════════════════════════════════
# ÉTAPE 8: Push vers GitHub
# ═══════════════════════════════════════════════════════════════════════════════

Write-Host "📍 ÉTAPE 8: Push vers GitHub..." -ForegroundColor Yellow
Write-Host "   Repository: https://github.com/sekadalle2024/Back-end-python-V0_03_03_2026.git" -ForegroundColor Cyan
Write-Host "   Branche: $currentBranch" -ForegroundColor Cyan
Write-Host ""

git push -u origin $currentBranch

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERREUR lors du push vers GitHub!" -ForegroundColor Red
    Write-Host ""
    Write-Host "   Solutions possibles:" -ForegroundColor Yellow
    Write-Host "   1. Vérifier votre connexion internet" -ForegroundColor Gray
    Write-Host "   2. Vérifier vos identifiants GitHub" -ForegroundColor Gray
    Write-Host "   3. Vérifier que vous avez les droits sur le repository" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   Commande pour réessayer:" -ForegroundColor Yellow
    Write-Host "   git push -u origin $currentBranch" -ForegroundColor Cyan
    exit 1
}

Write-Host "✅ Push réussi vers GitHub!" -ForegroundColor Green
Write-Host ""

# ═══════════════════════════════════════════════════════════════════════════════
# ÉTAPE 9: Vérification finale
# ═══════════════════════════════════════════════════════════════════════════════

Write-Host "📍 ÉTAPE 9: Vérification finale..." -ForegroundColor Yellow

Write-Host "   Remote configuré:" -ForegroundColor Cyan
git remote -v

Write-Host ""
Write-Host "   Dernier commit:" -ForegroundColor Cyan
git log -1 --oneline

Write-Host ""

# ═══════════════════════════════════════════════════════════════════════════════
# RÉSUMÉ FINAL
# ═══════════════════════════════════════════════════════════════════════════════

Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "   ✅ SAUVEGARDE RÉUSSIE!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "📦 Dossier sauvegardé: py_backend/" -ForegroundColor Cyan
Write-Host "📝 Fichier important: requirements_render.txt" -ForegroundColor Cyan
Write-Host "🌐 Repository: https://github.com/sekadalle2024/Back-end-python-V0_03_03_2026" -ForegroundColor Cyan
Write-Host "🌿 Branche: $currentBranch" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎯 PROCHAINES ÉTAPES:" -ForegroundColor Yellow
Write-Host "   1. Vérifier sur GitHub que requirements_render.txt est bien présent" -ForegroundColor Gray
Write-Host "   2. Aller sur Render Dashboard: https://dashboard.render.com" -ForegroundColor Gray
Write-Host "   3. Render va redéployer automatiquement (5-10 minutes)" -ForegroundColor Gray
Write-Host "   4. Vérifier les logs de déploiement" -ForegroundColor Gray
Write-Host "   5. Tester: https://clara-backend-production.onrender.com/health" -ForegroundColor Gray
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Green

# Ouvrir le repository dans le navigateur (optionnel)
Write-Host ""
Write-Host "Voulez-vous ouvrir le repository GitHub dans votre navigateur? (O/N)" -ForegroundColor Yellow
$response = Read-Host

if ($response -eq "O" -or $response -eq "o") {
    Start-Process "https://github.com/sekadalle2024/Back-end-python-V0_03_03_2026"
    Write-Host "✅ Navigateur ouvert" -ForegroundColor Green
}

Write-Host ""
Write-Host "Script terminé avec succès!" -ForegroundColor Green
