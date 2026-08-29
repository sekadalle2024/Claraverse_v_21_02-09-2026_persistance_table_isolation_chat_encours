# ═══════════════════════════════════════════════════════════════════════════════
# 🚀 SCRIPT DE DÉPLOIEMENT - ENDPOINT EDITEUR (CASE 44)
# ═══════════════════════════════════════════════════════════════════════════════
# 
# Objectif: Pousser le code du Case 44 vers GitHub pour déploiement sur Zeabur
# Date: 20 Avril 2026
# 
# ═══════════════════════════════════════════════════════════════════════════════

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🚀 DÉPLOIEMENT ENDPOINT EDITEUR (CASE 44) VERS ZEABUR" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# ─────────────────────────────────────────────────────────────────────────────
# ÉTAPE 1: VÉRIFICATION DES FICHIERS
# ─────────────────────────────────────────────────────────────────────────────

Write-Host "📋 ÉTAPE 1: Vérification des fichiers..." -ForegroundColor Yellow
Write-Host ""

$files = @(
    "py_backend/endpoint_editeur.py",
    "py_backend/main.py",
    "public/EditeurAutoTrigger.js",
    "src/services/claraApiService.ts"
)

$allFilesExist = $true

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file (MANQUANT)" -ForegroundColor Red
        $allFilesExist = $false
    }
}

Write-Host ""

if (-not $allFilesExist) {
    Write-Host "❌ ERREUR: Certains fichiers sont manquants!" -ForegroundColor Red
    Write-Host "   Vérifiez que tous les fichiers du Case 44 ont été créés." -ForegroundColor Red
    Write-Host ""
    exit 1
}

# ─────────────────────────────────────────────────────────────────────────────
# ÉTAPE 2: VÉRIFICATION DU STATUT GIT
# ─────────────────────────────────────────────────────────────────────────────

Write-Host "🔍 ÉTAPE 2: Vérification du statut Git..." -ForegroundColor Yellow
Write-Host ""

git status --short

Write-Host ""

# ─────────────────────────────────────────────────────────────────────────────
# ÉTAPE 3: AJOUT DES FICHIERS
# ─────────────────────────────────────────────────────────────────────────────

Write-Host "➕ ÉTAPE 3: Ajout des fichiers au commit..." -ForegroundColor Yellow
Write-Host ""

foreach ($file in $files) {
    Write-Host "  Ajout de $file..." -ForegroundColor Cyan
    git add $file
}

Write-Host ""
Write-Host "✅ Fichiers ajoutés avec succès" -ForegroundColor Green
Write-Host ""

# ─────────────────────────────────────────────────────────────────────────────
# ÉTAPE 4: CRÉATION DU COMMIT
# ─────────────────────────────────────────────────────────────────────────────

Write-Host "💾 ÉTAPE 4: Création du commit..." -ForegroundColor Yellow
Write-Host ""

$commitMessage = @"
feat: Ajout endpoint Editeur (Case 44) pour test switch backend

- Ajout endpoint_editeur.py avec route /editeur/process
- Import du router dans main.py
- Script EditeurAutoTrigger.js pour détection automatique
- Case 44 dans claraApiService.ts

Test: Fonctionne en local, prêt pour déploiement Zeabur
"@

git commit -m $commitMessage

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Commit créé avec succès" -ForegroundColor Green
} else {
    Write-Host "❌ Erreur lors de la création du commit" -ForegroundColor Red
    Write-Host "   Vérifiez qu'il y a des changements à commiter" -ForegroundColor Red
    Write-Host ""
    exit 1
}

Write-Host ""

# ─────────────────────────────────────────────────────────────────────────────
# ÉTAPE 5: PUSH VERS GITHUB
# ─────────────────────────────────────────────────────────────────────────────

Write-Host "🚀 ÉTAPE 5: Push vers GitHub..." -ForegroundColor Yellow
Write-Host ""

git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Push réussi vers GitHub!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Erreur lors du push" -ForegroundColor Red
    Write-Host "   Vérifiez votre connexion et vos permissions GitHub" -ForegroundColor Red
    Write-Host ""
    exit 1
}

Write-Host ""

# ─────────────────────────────────────────────────────────────────────────────
# ÉTAPE 6: INSTRUCTIONS POST-DÉPLOIEMENT
# ─────────────────────────────────────────────────────────────────────────────

Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✅ DÉPLOIEMENT TERMINÉ" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 PROCHAINES ÉTAPES:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  1. ⏱️  Attendre 2-5 minutes (rebuild automatique Zeabur)" -ForegroundColor White
Write-Host ""
Write-Host "  2. 🔍 Vérifier les logs Zeabur:" -ForegroundColor White
Write-Host "     Chercher: '✅ Endpoint Editeur router loaded successfully'" -ForegroundColor Gray
Write-Host ""
Write-Host "  3. 🧪 Tester le health check:" -ForegroundColor White
Write-Host "     curl https://pybackend.zeabur.app/editeur/health" -ForegroundColor Gray
Write-Host ""
Write-Host "  4. 🧪 Tester l'endpoint process:" -ForegroundColor White
Write-Host "     curl -X POST https://pybackend.zeabur.app/editeur/process \" -ForegroundColor Gray
Write-Host "       -H 'Content-Type: application/json' \" -ForegroundColor Gray
Write-Host "       -d '{\"command\": \"editeur\", \"message\": \"test\"}'" -ForegroundColor Gray
Write-Host ""
Write-Host "  5. 🌐 Tester sur le frontend:" -ForegroundColor White
Write-Host "     https://prclaravi.netlify.app" -ForegroundColor Gray
Write-Host "     Envoyer un message contenant 'editeur'" -ForegroundColor Gray
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📚 Documentation créée:" -ForegroundColor Yellow
Write-Host "  • QUICK_FIX_EDITEUR_404.txt" -ForegroundColor Gray
Write-Host "  • 00_SOLUTION_ENDPOINT_EDITEUR_404_ZEABUR_20_AVRIL_2026.txt" -ForegroundColor Gray
Write-Host "  • Doc backend switch/SOLUTION_404_ENDPOINT_EDITEUR_20_AVRIL_2026.md" -ForegroundColor Gray
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
