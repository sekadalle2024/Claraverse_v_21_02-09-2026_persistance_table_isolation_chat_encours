# Test pour vérifier que les états financiers affichent des données N et N-1 distinctes
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "TEST DES ÉTATS FINANCIERS - DONNÉES N ET N-1 DISTINCTES" -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan

Write-Host "`n[Étape 1] Vérification du fichier de test..." -ForegroundColor Yellow
if (Test-Path "py_backend/BALANCES_N_N1_N2.xlsx") {
    Write-Host "✅ Fichier BALANCES_N_N1_N2.xlsx trouvé" -ForegroundColor Green
} else {
    Write-Host "❌ Fichier BALANCES_N_N1_N2.xlsx non trouvé" -ForegroundColor Red
    Write-Host "   Création du fichier..." -ForegroundColor Yellow
    Set-Location py_backend
    python create_balances_multi_exercices.py
    Set-Location ..
}

Write-Host "`n[Étape 2] Test des balances distinctes..." -ForegroundColor Yellow
Set-Location py_backend
python test_balances_distinctes.py
Set-Location ..

Write-Host "`n[Étape 3] Test de l'endpoint avec BALANCES_N_N1_N2.xlsx..." -ForegroundColor Yellow
Write-Host "   Création du script de test..." -ForegroundColor Gray

# Créer un script Python simple pour tester
python test_endpoint_n_n1.py

Write-Host "`n[Étape 4] Vérification dans le navigateur..." -ForegroundColor Yellow
Write-Host "   1. Ouvrez http://localhost:5173" -ForegroundColor White
Write-Host "   2. Uploadez le fichier py_backend/BALANCES_N_N1_N2.xlsx" -ForegroundColor White
Write-Host "   3. Vérifiez que les colonnes EXERCICE N et EXERCICE N-1 affichent des montants différents" -ForegroundColor White

Write-Host "`n================================================================================" -ForegroundColor Cyan
Write-Host "TEST TERMINÉ" -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan
