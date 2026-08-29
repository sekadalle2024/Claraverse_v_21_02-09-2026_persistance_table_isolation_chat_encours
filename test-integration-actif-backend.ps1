# Test d'intégration backend ACTIF BRUT/AMORT
# Date: 07 Avril 2026

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST INTEGRATION BACKEND ACTIF BRUT/AMORT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Activer l'environnement conda
Write-Host "1. Activation environnement conda..." -ForegroundColor Yellow
conda activate claraverse_backend

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur activation conda" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Environnement activé" -ForegroundColor Green
Write-Host ""

# Se placer dans le répertoire py_backend
Write-Host "2. Changement de répertoire vers py_backend..." -ForegroundColor Yellow
Set-Location py_backend

# Tester l'import du module
Write-Host "3. Test import module..." -ForegroundColor Yellow
python -c "from calculer_actif_brut_amort import enrichir_actif_avec_brut_amort; print('✅ Import réussi')"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur import module" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host ""

# Tester l'import dans etats_financiers.py
Write-Host "4. Test import dans etats_financiers.py..." -ForegroundColor Yellow
python -c "from etats_financiers import process_balance_to_etats_financiers; print('✅ Import etats_financiers réussi')"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur import etats_financiers" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host ""

# Revenir au répertoire racine
Set-Location ..

# Exécuter le test complet
Write-Host "5. Exécution test complet..." -ForegroundColor Yellow
python test_actif_brut_amort.py

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur test complet" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ TOUS LES TESTS RÉUSSIS!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📄 Fichier HTML généré: test_actif_brut_amort.html" -ForegroundColor Cyan
Write-Host "🌐 Ouvrir dans le navigateur pour vérifier l'affichage" -ForegroundColor Cyan
