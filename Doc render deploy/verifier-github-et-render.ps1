# ═══════════════════════════════════════════════════════════
# Script de vérification GitHub et Render
# Date: 17 Avril 2026
# ═══════════════════════════════════════════════════════════

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                           ║" -ForegroundColor Cyan
Write-Host "║     🔍 VÉRIFICATION GITHUB ET RENDER - 17 AVRIL 2026    ║" -ForegroundColor Cyan
Write-Host "║                                                           ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ═══════════════════════════════════════════════════════════
# ÉTAPE 1: Vérifier le statut Git local
# ═══════════════════════════════════════════════════════════

Write-Host "┌───────────────────────────────────────────────────────────┐" -ForegroundColor Yellow
Write-Host "│  ÉTAPE 1: Vérification Git Local                         │" -ForegroundColor Yellow
Write-Host "└───────────────────────────────────────────────────────────┘" -ForegroundColor Yellow
Write-Host ""

Set-Location py_backend

Write-Host "📍 Branche actuelle:" -ForegroundColor Green
git branch --show-current
Write-Host ""

Write-Host "📝 Dernier commit:" -ForegroundColor Green
git log --oneline -1
Write-Host ""

Write-Host "📦 Fichiers dans le dernier commit:" -ForegroundColor Green
git show --name-only HEAD | Select-Object -Skip 5
Write-Host ""

Write-Host "✅ Contenu de runtime.txt dans le commit:" -ForegroundColor Green
git show HEAD:runtime.txt
Write-Host ""

Write-Host "✅ Versions pydantic dans requirements_render.txt:" -ForegroundColor Green
git show HEAD:requirements_render.txt | Select-String "pydantic"
Write-Host ""

# ═══════════════════════════════════════════════════════════
# ÉTAPE 2: Vérifier la synchronisation avec GitHub
# ═══════════════════════════════════════════════════════════

Write-Host "┌───────────────────────────────────────────────────────────┐" -ForegroundColor Yellow
Write-Host "│  ÉTAPE 2: Synchronisation GitHub                         │" -ForegroundColor Yellow
Write-Host "└───────────────────────────────────────────────────────────┘" -ForegroundColor Yellow
Write-Host ""

Write-Host "🔄 Vérification de la synchronisation avec origin/master..." -ForegroundColor Green
$localCommit = git rev-parse HEAD
$remoteCommit = git rev-parse origin/master

if ($localCommit -eq $remoteCommit) {
    Write-Host "✅ Local et GitHub sont synchronisés!" -ForegroundColor Green
    Write-Host "   Commit: $localCommit" -ForegroundColor Gray
} else {
    Write-Host "⚠️  Local et GitHub ne sont PAS synchronisés!" -ForegroundColor Red
    Write-Host "   Local:  $localCommit" -ForegroundColor Gray
    Write-Host "   Remote: $remoteCommit" -ForegroundColor Gray
}
Write-Host ""

# ═══════════════════════════════════════════════════════════
# ÉTAPE 3: Instructions pour vérifier sur GitHub
# ═══════════════════════════════════════════════════════════

Write-Host "┌───────────────────────────────────────────────────────────┐" -ForegroundColor Yellow
Write-Host "│  ÉTAPE 3: Vérification sur GitHub                        │" -ForegroundColor Yellow
Write-Host "└───────────────────────────────────────────────────────────┘" -ForegroundColor Yellow
Write-Host ""

Write-Host "🌐 URL du repository:" -ForegroundColor Cyan
Write-Host "   https://github.com/sekadalle2024/Back-end-python-V0_03_03_2026" -ForegroundColor White
Write-Host ""

Write-Host "📋 Fichiers à vérifier sur GitHub:" -ForegroundColor Cyan
Write-Host "   ✅ runtime.txt (doit contenir: python-3.11.9)" -ForegroundColor White
Write-Host "   ✅ requirements_render.txt (doit contenir: pydantic==2.6.4)" -ForegroundColor White
Write-Host ""

Write-Host "🔗 Liens directs:" -ForegroundColor Cyan
Write-Host "   runtime.txt:" -ForegroundColor White
Write-Host "   https://github.com/sekadalle2024/Back-end-python-V0_03_03_2026/blob/master/runtime.txt" -ForegroundColor Gray
Write-Host ""
Write-Host "   requirements_render.txt:" -ForegroundColor White
Write-Host "   https://github.com/sekadalle2024/Back-end-python-V0_03_03_2026/blob/master/requirements_render.txt" -ForegroundColor Gray
Write-Host ""

# ═══════════════════════════════════════════════════════════
# ÉTAPE 4: Instructions pour Render
# ═══════════════════════════════════════════════════════════

Write-Host "┌───────────────────────────────────────────────────────────┐" -ForegroundColor Yellow
Write-Host "│  ÉTAPE 4: Redéploiement sur Render                       │" -ForegroundColor Yellow
Write-Host "└───────────────────────────────────────────────────────────┘" -ForegroundColor Yellow
Write-Host ""

Write-Host "🚀 Options de déploiement:" -ForegroundColor Cyan
Write-Host ""

Write-Host "   Option A - Automatique (recommandé):" -ForegroundColor Green
Write-Host "   → Render détecte automatiquement le push" -ForegroundColor White
Write-Host "   → Attendre 5-10 minutes" -ForegroundColor White
Write-Host ""

Write-Host "   Option B - Manuel:" -ForegroundColor Green
Write-Host "   1. Aller sur: https://dashboard.render.com" -ForegroundColor White
Write-Host "   2. Sélectionner votre service" -ForegroundColor White
Write-Host "   3. Cliquer sur 'Manual Deploy' → 'Deploy latest commit'" -ForegroundColor White
Write-Host "   4. Attendre 5-10 minutes" -ForegroundColor White
Write-Host ""

# ═══════════════════════════════════════════════════════════
# ÉTAPE 5: Ce qu'il faut vérifier dans les logs Render
# ═══════════════════════════════════════════════════════════

Write-Host "┌───────────────────────────────────────────────────────────┐" -ForegroundColor Yellow
Write-Host "│  ÉTAPE 5: Vérification des logs Render                   │" -ForegroundColor Yellow
Write-Host "└───────────────────────────────────────────────────────────┘" -ForegroundColor Yellow
Write-Host ""

Write-Host "📊 Dans les logs Render, vous devriez voir:" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ Python 3.11.9 utilisé:" -ForegroundColor Green
Write-Host "   ==> Using Python version 3.11.9 (from runtime.txt)" -ForegroundColor Gray
Write-Host ""

Write-Host "✅ Installation des dépendances:" -ForegroundColor Green
Write-Host "   Collecting pydantic==2.6.4" -ForegroundColor Gray
Write-Host "   Downloading pydantic-2.6.4-py3-none-any.whl" -ForegroundColor Gray
Write-Host "   Collecting pydantic-core==2.16.3" -ForegroundColor Gray
Write-Host "   Downloading pydantic_core-2.16.3-cp311-cp311-manylinux_2_17_x86_64.whl" -ForegroundColor Gray
Write-Host ""

Write-Host "✅ Build réussi:" -ForegroundColor Green
Write-Host "   Successfully installed pydantic-2.6.4 pydantic-core-2.16.3" -ForegroundColor Gray
Write-Host "   ==> Build successful" -ForegroundColor Gray
Write-Host ""

Write-Host "✅ Service démarré:" -ForegroundColor Green
Write-Host "   ==> Starting service..." -ForegroundColor Gray
Write-Host "   Service started successfully" -ForegroundColor Gray
Write-Host ""

# ═══════════════════════════════════════════════════════════
# ÉTAPE 6: Test du endpoint
# ═══════════════════════════════════════════════════════════

Write-Host "┌───────────────────────────────────────────────────────────┐" -ForegroundColor Yellow
Write-Host "│  ÉTAPE 6: Test du service                                │" -ForegroundColor Yellow
Write-Host "└───────────────────────────────────────────────────────────┘" -ForegroundColor Yellow
Write-Host ""

Write-Host "🧪 Une fois le déploiement terminé, tester:" -ForegroundColor Cyan
Write-Host "   https://[votre-service].onrender.com/health" -ForegroundColor White
Write-Host ""

Write-Host "✅ Réponse attendue:" -ForegroundColor Green
Write-Host '   {\"status\": \"ok\"}' -ForegroundColor Gray
Write-Host ""

# ═══════════════════════════════════════════════════════════
# RÉSUMÉ FINAL
# ═══════════════════════════════════════════════════════════

Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                           ║" -ForegroundColor Cyan
Write-Host "║                    📋 RÉSUMÉ                             ║" -ForegroundColor Cyan
Write-Host "║                                                           ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ Fichiers dans le commit:" -ForegroundColor Green
Write-Host "   • runtime.txt (python-3.11.9)" -ForegroundColor White
Write-Host "   • requirements_render.txt (pydantic 2.6.4)" -ForegroundColor White
Write-Host ""

Write-Host "✅ Commit poussé sur GitHub:" -ForegroundColor Green
Write-Host "   • Branche: master" -ForegroundColor White
Write-Host "   • Commit: $localCommit" -ForegroundColor White
Write-Host ""

Write-Host "🎯 Prochaines actions:" -ForegroundColor Cyan
Write-Host "   1. Vérifier les fichiers sur GitHub (liens ci-dessus)" -ForegroundColor White
Write-Host "   2. Attendre le redéploiement automatique Render (5-10 min)" -ForegroundColor White
Write-Host "   3. Vérifier les logs Render" -ForegroundColor White
Write-Host "   4. Tester le endpoint /health" -ForegroundColor White
Write-Host ""

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Set-Location ..
