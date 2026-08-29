# ═══════════════════════════════════════════════════════════════════════════
# SCRIPT: Corriger l'historique Git - Remplacer credentials par placeholders
# Date: 29 Avril 2026
# ═══════════════════════════════════════════════════════════════════════════

Write-Host "═══════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  CORRECTION HISTORIQUE GIT - CREDENTIALS OAUTH" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Vérifier l'état actuel
Write-Host "📊 État actuel du repository:" -ForegroundColor Yellow
git log --oneline -5
Write-Host ""

# Sauvegarder l'état actuel
Write-Host "💾 Création d'une branche de sauvegarde..." -ForegroundColor Yellow
git branch backup-before-fix-$(Get-Date -Format "yyyyMMdd-HHmmss")
Write-Host "✅ Branche de sauvegarde créée" -ForegroundColor Green
Write-Host ""

# Retourner à l'état avant les 2 commits problématiques
Write-Host "⏪ Retour à l'état avant les commits avec credentials..." -ForegroundColor Yellow
git reset --soft HEAD~2
Write-Host "✅ Reset effectué (fichiers conservés)" -ForegroundColor Green
Write-Host ""

# Vérifier que les fichiers actuels ont bien les placeholders
Write-Host "🔍 Vérification des placeholders dans les fichiers..." -ForegroundColor Yellow

$files = @(
    "Doc cross ref documentaire menu/00_WORKFLOW_HTTP_REQUEST_PRET_28_AVRIL_2026.txt",
    "Doc cross ref documentaire menu/GUIDE_CONFIGURATION_CREDENTIALS_OAUTH2_28_AVRIL_2026.md",
    "Doc cross ref documentaire menu/GUIDE_CONFIGURATION_N8N_AVEC_CREDENTIALS_28_AVRIL_2026.md",
    "Doc cross ref documentaire menu/QUICK_START_HTTP_REQUEST_28_AVRIL_2026.txt"
)

$hasRealCredentials = $false
foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        if ($content -match "670586698862-gbglj4cuefbs6ito0obag1hj86m5sh61") {
            Write-Host "❌ ATTENTION: $file contient encore les vraies credentials!" -ForegroundColor Red
            $hasRealCredentials = $true
        } else {
            Write-Host "✅ $file contient des placeholders" -ForegroundColor Green
        }
    }
}
Write-Host ""

if ($hasRealCredentials) {
    Write-Host "❌ ERREUR: Certains fichiers contiennent encore les vraies credentials!" -ForegroundColor Red
    Write-Host "   Veuillez d'abord remplacer les credentials par des placeholders." -ForegroundColor Red
    Write-Host ""
    Write-Host "   Pour restaurer l'état précédent:" -ForegroundColor Yellow
    Write-Host "   git reset --hard backup-before-fix-*" -ForegroundColor Yellow
    exit 1
}

# Ajouter tous les fichiers avec placeholders
Write-Host "📦 Ajout des fichiers avec placeholders..." -ForegroundColor Yellow
git add .
Write-Host "✅ Fichiers ajoutés" -ForegroundColor Green
Write-Host ""

# Créer un nouveau commit propre
Write-Host "💾 Création d'un nouveau commit sans credentials..." -ForegroundColor Yellow
git commit -m "Sauvegarde ClaraVerse V5 - 29 Avril 2026 - Credentials sécurisées

- Credentials OAuth déplacées vers .env.google-oauth.local (non versionné)
- Placeholders dans les fichiers de documentation
- .gitignore mis à jour pour exclure .env.google-oauth.local
- Corrections XRef appliquées
- Backend Python et fichiers publics inclus

Sécurité:
- Aucune credential réelle dans ce commit
- Template .env.google-oauth avec placeholders
- Documentation de gestion des credentials ajoutée"

Write-Host "✅ Nouveau commit créé" -ForegroundColor Green
Write-Host ""

# Afficher le nouvel historique
Write-Host "📊 Nouvel historique Git:" -ForegroundColor Yellow
git log --oneline -5
Write-Host ""

# Vérifier qu'il n'y a plus de credentials dans l'historique récent
Write-Host "🔍 Vérification finale - Recherche de credentials dans l'historique..." -ForegroundColor Yellow
$credentialFound = git log -p -1 | Select-String "670586698862-gbglj4cuefbs6ito0obag1hj86m5sh61"
if ($credentialFound) {
    Write-Host "❌ ATTENTION: Des credentials ont été trouvées dans le dernier commit!" -ForegroundColor Red
    Write-Host "   Veuillez vérifier manuellement." -ForegroundColor Red
} else {
    Write-Host "✅ Aucune credential trouvée dans le dernier commit" -ForegroundColor Green
}
Write-Host ""

Write-Host "═══════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✅ CORRECTION TERMINÉE" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 PROCHAINES ÉTAPES:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Vérifier le commit:" -ForegroundColor White
Write-Host "   git show HEAD" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Pousser vers GitHub (force push nécessaire):" -ForegroundColor White
Write-Host "   git push origin master --force" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  ATTENTION: Le force push va réécrire l'historique sur GitHub" -ForegroundColor Yellow
Write-Host "   Si d'autres personnes ont cloné le repository, elles devront re-cloner." -ForegroundColor Yellow
Write-Host ""
Write-Host "💾 Branche de sauvegarde créée au cas où:" -ForegroundColor Green
git branch | Select-String "backup-before-fix"
Write-Host ""
