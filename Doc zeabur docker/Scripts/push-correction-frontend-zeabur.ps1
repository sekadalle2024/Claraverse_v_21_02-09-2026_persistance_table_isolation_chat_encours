# ═══════════════════════════════════════════════════════════════════
# 🚀 SCRIPT PUSH CORRECTION FRONTEND ZEABUR
# ═══════════════════════════════════════════════════════════════════
# Date: 20 Avril 2026
# Objectif: Push correction Dockerfile.frontend pour Zeabur
# ═══════════════════════════════════════════════════════════════════

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🚀 PUSH CORRECTION FRONTEND ZEABUR" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# ═══════════════════════════════════════════════════════════════════
# ÉTAPE 1: Vérification des fichiers
# ═══════════════════════════════════════════════════════════════════

Write-Host "📋 ÉTAPE 1: Vérification des fichiers..." -ForegroundColor Yellow
Write-Host ""

$fichiers = @(
    "Dockerfile.frontend",
    "docker-compose.yml",
    "py_backend/Dockerfile"
)

$tousPresents = $true
foreach ($fichier in $fichiers) {
    if (Test-Path $fichier) {
        Write-Host "  ✅ $fichier" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $fichier MANQUANT" -ForegroundColor Red
        $tousPresents = $false
    }
}

if (-not $tousPresents) {
    Write-Host ""
    Write-Host "❌ Fichiers manquants. Arrêt du script." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Tous les fichiers sont présents" -ForegroundColor Green
Write-Host ""

# ═══════════════════════════════════════════════════════════════════
# ÉTAPE 2: Vérification Git
# ═══════════════════════════════════════════════════════════════════

Write-Host "📋 ÉTAPE 2: Vérification Git..." -ForegroundColor Yellow
Write-Host ""

# Vérifier si on est dans un repo Git
if (-not (Test-Path ".git")) {
    Write-Host "❌ Pas de repository Git trouvé" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Repository Git détecté" -ForegroundColor Green
Write-Host ""

# ═══════════════════════════════════════════════════════════════════
# ÉTAPE 3: Afficher les modifications
# ═══════════════════════════════════════════════════════════════════

Write-Host "📋 ÉTAPE 3: Modifications détectées..." -ForegroundColor Yellow
Write-Host ""

git status --short

Write-Host ""

# ═══════════════════════════════════════════════════════════════════
# ÉTAPE 4: Confirmation
# ═══════════════════════════════════════════════════════════════════

Write-Host "📋 ÉTAPE 4: Confirmation..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Voulez-vous pusher ces modifications vers GitHub ?" -ForegroundColor Cyan
Write-Host "Cela déclenchera un rebuild automatique sur Zeabur." -ForegroundColor Cyan
Write-Host ""
$confirmation = Read-Host "Continuer ? (O/N)"

if ($confirmation -ne "O" -and $confirmation -ne "o") {
    Write-Host ""
    Write-Host "❌ Opération annulée" -ForegroundColor Yellow
    exit 0
}

# ═══════════════════════════════════════════════════════════════════
# ÉTAPE 5: Git Add
# ═══════════════════════════════════════════════════════════════════

Write-Host ""
Write-Host "📋 ÉTAPE 5: Git add..." -ForegroundColor Yellow
Write-Host ""

git add Dockerfile.frontend
git add "Doc zeabur docker/"
git add "00_SOLUTION_DEPLOIEMENT_ZEABUR_20_AVRIL_2026.txt"

Write-Host "✅ Fichiers ajoutés" -ForegroundColor Green
Write-Host ""

# ═══════════════════════════════════════════════════════════════════
# ÉTAPE 6: Git Commit
# ═══════════════════════════════════════════════════════════════════

Write-Host "📋 ÉTAPE 6: Git commit..." -ForegroundColor Yellow
Write-Host ""

$commitMessage = @"
fix: correction Dockerfile.frontend pour Zeabur

- Remplacement heredoc par echo pour compatibilité
- Simplification configuration Nginx
- Suppression HEALTHCHECK (non supporté par Zeabur)
- Optimisation pour build Zeabur

Problème résolu:
- Build bloqué à l'étape extracting
- Incompatibilité heredoc avec builder Zeabur

Fichiers modifiés:
- Dockerfile.frontend
- Documentation ajoutée

Date: 20 Avril 2026
"@

git commit -m $commitMessage

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Erreur lors du commit" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Commit créé" -ForegroundColor Green
Write-Host ""

# ═══════════════════════════════════════════════════════════════════
# ÉTAPE 7: Git Push
# ═══════════════════════════════════════════════════════════════════

Write-Host "📋 ÉTAPE 7: Git push..." -ForegroundColor Yellow
Write-Host ""

git push origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Erreur lors du push" -ForegroundColor Red
    Write-Host ""
    Write-Host "Essayez manuellement:" -ForegroundColor Yellow
    Write-Host "  git push origin main" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "✅ Push réussi !" -ForegroundColor Green
Write-Host ""

# ═══════════════════════════════════════════════════════════════════
# ÉTAPE 8: Instructions suivantes
# ═══════════════════════════════════════════════════════════════════

Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ PUSH TERMINÉ AVEC SUCCÈS" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 PROCHAINES ÉTAPES:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1️⃣  Aller sur Zeabur Dashboard" -ForegroundColor White
Write-Host "    https://zeabur.com/dashboard" -ForegroundColor Cyan
Write-Host ""
Write-Host "2️⃣  Vérifier le rebuild automatique" -ForegroundColor White
Write-Host "    - Service Frontend devrait rebuilder automatiquement" -ForegroundColor Gray
Write-Host "    - Attendre 5-10 minutes" -ForegroundColor Gray
Write-Host ""
Write-Host "3️⃣  Vérifier les logs" -ForegroundColor White
Write-Host "    - Cliquer sur le service Frontend" -ForegroundColor Gray
Write-Host "    - Onglet 'Logs'" -ForegroundColor Gray
Write-Host "    - Chercher: 'Configuration complete'" -ForegroundColor Gray
Write-Host ""
Write-Host "4️⃣  Tester l'URL" -ForegroundColor White
Write-Host "    https://prclaravi.zeabur.app" -ForegroundColor Cyan
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 ASTUCE:" -ForegroundColor Yellow
Write-Host "Si le rebuild ne démarre pas automatiquement:" -ForegroundColor White
Write-Host "  - Dashboard → Service Frontend → Settings" -ForegroundColor Gray
Write-Host "  - Cliquer 'Redeploy'" -ForegroundColor Gray
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
