# Script PowerShell: Push fix pydantic vers GitHub
# Date: 16 Avril 2026

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  PUSH FIX PYDANTIC VERS GITHUB" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Vérifier si on est dans le bon dossier
if (-not (Test-Path "py_backend/requirements.txt")) {
    Write-Host "❌ ERREUR: Fichier py_backend/requirements.txt non trouvé" -ForegroundColor Red
    Write-Host ""
    Write-Host "Assurez-vous d'être dans le dossier:" -ForegroundColor Yellow
    Write-Host "  Back-end-python-V0_03_03_2026" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host "✅ Fichier requirements.txt trouvé" -ForegroundColor Green
Write-Host ""

# Vérifier le contenu
Write-Host "📋 Vérification du contenu..." -ForegroundColor Cyan
$content = Get-Content "py_backend/requirements.txt" -Raw
if ($content -match "pydantic==2\.6\.4") {
    Write-Host "✅ pydantic 2.6.4 détecté" -ForegroundColor Green
} else {
    Write-Host "❌ ERREUR: pydantic 2.6.4 non trouvé dans requirements.txt" -ForegroundColor Red
    Write-Host ""
    Write-Host "Le fichier devrait contenir:" -ForegroundColor Yellow
    Write-Host "  pydantic==2.6.4" -ForegroundColor Yellow
    Write-Host "  pydantic-core==2.16.3" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  GIT ADD" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

git add py_backend/requirements.txt

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERREUR: git add a échoué" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Fichier ajouté au staging" -ForegroundColor Green
Write-Host ""

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  GIT COMMIT" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

git commit -m "Fix: Use pydantic 2.6.4 with pre-compiled wheels for Render deployment"

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Aucun changement à commiter (peut-être déjà fait?)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Vérification du dernier commit..." -ForegroundColor Cyan
    git log -1 --oneline
    Write-Host ""
    
    $response = Read-Host "Voulez-vous continuer avec le push? (O/N)"
    if ($response -ne "O" -and $response -ne "o") {
        Write-Host "❌ Annulé par l'utilisateur" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Commit créé" -ForegroundColor Green
    Write-Host ""
}

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  GIT PUSH" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "🚀 Push vers GitHub en cours..." -ForegroundColor Cyan
Write-Host ""

git push origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ ERREUR: git push a échoué" -ForegroundColor Red
    Write-Host ""
    Write-Host "Causes possibles:" -ForegroundColor Yellow
    Write-Host "  1. Pas de connexion internet" -ForegroundColor Yellow
    Write-Host "  2. Authentification GitHub requise" -ForegroundColor Yellow
    Write-Host "  3. Branche main protégée" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  ✅ SUCCÈS!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

Write-Host "✅ Push vers GitHub réussi!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Prochaines étapes:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Render va détecter le push automatiquement" -ForegroundColor White
Write-Host "2. Redéploiement démarre (5-10 minutes)" -ForegroundColor White
Write-Host "3. Vérifier les logs sur:" -ForegroundColor White
Write-Host "   https://dashboard.render.com" -ForegroundColor Yellow
Write-Host ""
Write-Host "4. Tester l'endpoint:" -ForegroundColor White
Write-Host "   https://clara-backend-production.onrender.com/health" -ForegroundColor Yellow
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
