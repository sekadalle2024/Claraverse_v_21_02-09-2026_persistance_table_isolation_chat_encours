# ═══════════════════════════════════════════════════════════════════
# 🚀 SCRIPT PUSH CORRECTION NGINX - ZEABUR
# ═══════════════════════════════════════════════════════════════════
# Date: 20 avril 2026
# Objectif: Push des corrections pour déploiement Zeabur

Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🚀 PUSH CORRECTION NGINX POUR ZEABUR" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# ═══════════════════════════════════════════════════════════════════
# ÉTAPE 1: Vérification de l'état Git
# ═══════════════════════════════════════════════════════════════════

Write-Host "📋 Étape 1: Vérification de l'état Git..." -ForegroundColor Yellow
Write-Host ""

$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "✓ Modifications détectées:" -ForegroundColor Green
    git status --short
    Write-Host ""
} else {
    Write-Host "⚠️  Aucune modification détectée" -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "Continuer quand même? (o/N)"
    if ($continue -ne "o") {
        Write-Host "❌ Annulé par l'utilisateur" -ForegroundColor Red
        exit 0
    }
}

# ═══════════════════════════════════════════════════════════════════
# ÉTAPE 2: Ajout des fichiers
# ═══════════════════════════════════════════════════════════════════

Write-Host "📋 Étape 2: Ajout des fichiers..." -ForegroundColor Yellow
Write-Host ""

try {
    git add .
    Write-Host "✓ Fichiers ajoutés avec succès" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Erreur lors de l'ajout des fichiers: $_" -ForegroundColor Red
    exit 1
}

# ═══════════════════════════════════════════════════════════════════
# ÉTAPE 3: Commit
# ═══════════════════════════════════════════════════════════════════

Write-Host "📋 Étape 3: Création du commit..." -ForegroundColor Yellow
Write-Host ""

$commitMessage = @"
fix: correction nginx.conf pour déploiement Zeabur

Corrections appliquées:
- Suppression nginx.conf conflictuel (directive events)
- Configuration nginx correcte dans Dockerfile.frontend
- Documentation des erreurs et solutions

Problèmes résolus:
- Frontend: nginx [emerg] events directive is not allowed
- Backend: Configuration service à vérifier dans Zeabur

Fichiers modifiés:
- nginx.conf (supprimé)
- Doc zeabur docker/00_CORRECTION_NGINX_CONF_20_AVRIL_2026.txt (créé)
- Doc zeabur docker/00_ANALYSE_ERREUR_BACKEND_20_AVRIL_2026.txt (créé)
- Doc zeabur docker/QUICK_FIX_DEPLOIEMENT_20_AVRIL_2026.txt (créé)

Prêt pour redéploiement Zeabur
"@

try {
    git commit -m $commitMessage
    Write-Host "✓ Commit créé avec succès" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Erreur lors du commit: $_" -ForegroundColor Red
    exit 1
}

# ═══════════════════════════════════════════════════════════════════
# ÉTAPE 4: Push vers GitHub
# ═══════════════════════════════════════════════════════════════════

Write-Host "📋 Étape 4: Push vers GitHub..." -ForegroundColor Yellow
Write-Host ""

Write-Host "⚠️  Prêt à pusher vers GitHub" -ForegroundColor Yellow
$confirm = Read-Host "Confirmer le push? (o/N)"

if ($confirm -eq "o") {
    try {
        git push origin main
        Write-Host ""
        Write-Host "✓ Push réussi vers GitHub!" -ForegroundColor Green
        Write-Host ""
    } catch {
        Write-Host "❌ Erreur lors du push: $_" -ForegroundColor Red
        Write-Host ""
        Write-Host "💡 Essayez manuellement:" -ForegroundColor Yellow
        Write-Host "   git push origin main" -ForegroundColor White
        exit 1
    }
} else {
    Write-Host "❌ Push annulé par l'utilisateur" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Pour pusher manuellement:" -ForegroundColor Yellow
    Write-Host "   git push origin main" -ForegroundColor White
    exit 0
}

# ═══════════════════════════════════════════════════════════════════
# RÉSUMÉ ET PROCHAINES ÉTAPES
# ═══════════════════════════════════════════════════════════════════

Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ PUSH TERMINÉ AVEC SUCCÈS" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 PROCHAINES ÉTAPES:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. FRONTEND ZEABUR" -ForegroundColor White
Write-Host "   • Zeabur va détecter le push automatiquement" -ForegroundColor Gray
Write-Host "   • Rebuild du frontend en cours..." -ForegroundColor Gray
Write-Host "   • Vérifier les logs: plus d'erreur 'events directive'" -ForegroundColor Gray
Write-Host ""

Write-Host "2. BACKEND ZEABUR" -ForegroundColor White
Write-Host "   • Aller sur https://zeabur.com/dashboard" -ForegroundColor Gray
Write-Host "   • Service backend → Settings" -ForegroundColor Gray
Write-Host "   • Vérifier: Service Name = 'backend' (pas 'frontend')" -ForegroundColor Gray
Write-Host "   • Si incorrect: changer et redéployer" -ForegroundColor Gray
Write-Host ""

Write-Host "3. VÉRIFICATION" -ForegroundColor White
Write-Host "   • Frontend: https://prclaravi.zeabur.app" -ForegroundColor Gray
Write-Host "   • Backend: https://pybackend.zeabur.app" -ForegroundColor Gray
Write-Host ""

Write-Host "📖 DOCUMENTATION:" -ForegroundColor Yellow
Write-Host "   • Doc zeabur docker/QUICK_FIX_DEPLOIEMENT_20_AVRIL_2026.txt" -ForegroundColor Gray
Write-Host ""

Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🎉 Bonne chance avec le déploiement!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
