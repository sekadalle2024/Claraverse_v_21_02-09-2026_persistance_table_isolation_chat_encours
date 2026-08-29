# Script pour générer et vérifier la cohérence des balances

Write-Host "================================" -ForegroundColor Cyan
Write-Host "GÉNÉRATION DES BALANCES COHÉRENTES" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Générer les balances
Write-Host "`nÉtape 1: Génération des balances..." -ForegroundColor Yellow
python py_backend/create_balances_multi_exercices.py

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✓ Balances générées avec succès" -ForegroundColor Green
    
    # Vérifier la cohérence
    Write-Host "`nÉtape 2: Vérification de la cohérence..." -ForegroundColor Yellow
    python py_backend/verify_balance_coherence.py
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✓ Vérification complétée" -ForegroundColor Green
    } else {
        Write-Host "`n✗ Erreur lors de la vérification" -ForegroundColor Red
    }
} else {
    Write-Host "`n✗ Erreur lors de la génération des balances" -ForegroundColor Red
}

Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "Fichier généré: BALANCES_N_N1_N2.xlsx" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
