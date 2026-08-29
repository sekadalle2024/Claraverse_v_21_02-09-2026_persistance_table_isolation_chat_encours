# ═══════════════════════════════════════════════════════════
# Script de correction des secrets et push vers GitHub
# Date: 17 Avril 2026
# ═══════════════════════════════════════════════════════════

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Red
Write-Host "║                                                           ║" -ForegroundColor Red
Write-Host "║     🔒 CORRECTION SECRETS ET PUSH - 17 AVRIL 2026       ║" -ForegroundColor Red
Write-Host "║                                                           ║" -ForegroundColor Red
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Red
Write-Host ""

# ═══════════════════════════════════════════════════════════
# ÉTAPE 1: Supprimer les fichiers sensibles du commit
# ═══════════════════════════════════════════════════════════

Write-Host "┌───────────────────────────────────────────────────────────┐" -ForegroundColor Yellow
Write-Host "│  ÉTAPE 1: Suppression des fichiers sensibles             │" -ForegroundColor Yellow
Write-Host "└───────────────────────────────────────────────────────────┘" -ForegroundColor Yellow
Write-Host ""

Write-Host "🗑️  Suppression des fichiers contenant des secrets..." -ForegroundColor Cyan

# Supprimer les fichiers sensibles
git rm --cached "Doc cross ref documentaire menu/00_CREDENTIALS_OAUTH_GOOGLE.txt" 2>$null
git rm --cached "Doc cross ref documentaire menu/GUIDE_CONFIGURATION_OAUTH2_GOOGLE_DRIVE.md" 2>$null
git rm --cached "Doc cross ref documentaire menu/GUIDE_IMPORT_WORKFLOW_V2.md" 2>$null

Write-Host "✅ Fichiers sensibles supprimés du staging" -ForegroundColor Green
Write-Host ""

# ═══════════════════════════════════════════════════════════
# ÉTAPE 2: Amender le commit précédent
# ═══════════════════════════════════════════════════════════

Write-Host "┌───────────────────────────────────────────────────────────┐" -ForegroundColor Yellow
Write-Host "│  ÉTAPE 2: Amendement du commit                            │" -ForegroundColor Yellow
Write-Host "└───────────────────────────────────────────────────────────┘" -ForegroundColor Yellow
Write-Host ""

Write-Host "📝 Amendement du commit pour retirer les secrets..." -ForegroundColor Cyan

git commit --amend --no-edit

Write-Host "✅ Commit amendé" -ForegroundColor Green
Write-Host ""

# ═══════════════════════════════════════════════════════════
# ÉTAPE 3: Push forcé vers GitHub
# ═══════════════════════════════════════════════════════════

Write-Host "┌───────────────────────────────────────────────────────────┐" -ForegroundColor Yellow
Write-Host "│  ÉTAPE 3: Push vers GitHub                                │" -ForegroundColor Yellow
Write-Host "└───────────────────────────────────────────────────────────┘" -ForegroundColor Yellow
Write-Host ""

Write-Host "🚀 Push forcé vers origin/master..." -ForegroundColor Cyan

git push -f origin master

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ PUSH RÉUSSI!" -ForegroundColor Green
    Write-Host ""
    
    # ═══════════════════════════════════════════════════════════
    # ÉTAPE 4: Vérification
    # ═══════════════════════════════════════════════════════════
    
    Write-Host "┌───────────────────────────────────────────────────────────┐" -ForegroundColor Yellow
    Write-Host "│  ÉTAPE 4: Vérification                                    │" -ForegroundColor Yellow
    Write-Host "└───────────────────────────────────────────────────────────┘" -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "📋 Fichiers dans le dernier commit:" -ForegroundColor Cyan
    git show --name-only HEAD | Select-Object -Skip 5
    Write-Host ""
    
    Write-Host "✅ Vérifier sur GitHub:" -ForegroundColor Green
    Write-Host "   https://github.com/sekadalle2024/Back-end-python-V0_03_03_2026" -ForegroundColor White
    Write-Host ""
    
    Write-Host "📦 Fichiers à vérifier:" -ForegroundColor Cyan
    Write-Host "   ✅ py_backend/runtime.txt (doit contenir: python-3.11.9)" -ForegroundColor White
    Write-Host "   ✅ py_backend/requirements_render.txt (doit contenir: pydantic==2.6.4)" -ForegroundColor White
    Write-Host ""
    
    Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║                                                           ║" -ForegroundColor Green
    Write-Host "║                  🎉 SUCCÈS COMPLET!                      ║" -ForegroundColor Green
    Write-Host "║                                                           ║" -ForegroundColor Green
    Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "🚀 Prochaines étapes:" -ForegroundColor Cyan
    Write-Host "   1. Vérifier les fichiers sur GitHub" -ForegroundColor White
    Write-Host "   2. Attendre le redéploiement automatique Render (5-10 min)" -ForegroundColor White
    Write-Host "   3. Vérifier les logs Render" -ForegroundColor White
    Write-Host "   4. Tester le endpoint /health" -ForegroundColor White
    Write-Host ""
    
} else {
    Write-Host ""
    Write-Host "❌ ERREUR LORS DU PUSH" -ForegroundColor Red
    Write-Host ""
    Write-Host "Vérifier les erreurs ci-dessus" -ForegroundColor Yellow
    Write-Host ""
}
