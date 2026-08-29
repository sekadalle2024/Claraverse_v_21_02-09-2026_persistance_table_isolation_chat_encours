# Test Script for Note 10 - Résultat
# SYSCOHADA Révisé

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST NOTE 10 - RÉSULTAT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Change to backend directory
Set-Location py_backend

# Run the calculator
Write-Host "Exécution du calculateur Note 10..." -ForegroundColor Yellow
python "Doc calcul notes annexes/Scripts/calculer_note_10.py"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✓ TEST RÉUSSI" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Fichier HTML généré:" -ForegroundColor Cyan
    Write-Host "  Doc calcul notes annexes/Tests/test_note_10.html" -ForegroundColor White
    Write-Host ""
    Write-Host "Pour visualiser:" -ForegroundColor Yellow
    Write-Host "  1. Ouvrir le fichier HTML dans un navigateur" -ForegroundColor White
    Write-Host "  2. Vérifier les montants N-2, N-1, N" -ForegroundColor White
    Write-Host "  3. Vérifier le total" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "✗ TEST ÉCHOUÉ" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
}

# Return to root directory
Set-Location ..

Write-Host ""
