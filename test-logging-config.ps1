# Script de test pour la configuration du logging
# Task 28.1: Configure logging infrastructure

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST: Configuration du Logging" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier que Python est disponible
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "✗ Python n'est pas installé ou n'est pas dans le PATH" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Python détecté" -ForegroundColor Green

# Exécuter les tests
Write-Host ""
Write-Host "Exécution des tests de logging..." -ForegroundColor Yellow
Write-Host ""

$testScript = "py_backend/Doc calcul notes annexes/Tests/test_logging_config.py"

if (-not (Test-Path $testScript)) {
    Write-Host "✗ Script de test introuvable: $testScript" -ForegroundColor Red
    exit 1
}

python $testScript

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✓ TESTS RÉUSSIS" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Le système de logging est configuré avec:" -ForegroundColor Cyan
    Write-Host "  • 3 fichiers de logs (main, warnings, errors)" -ForegroundColor White
    Write-Host "  • Rotation quotidienne à minuit" -ForegroundColor White
    Write-Host "  • Rétention de 30 jours" -ForegroundColor White
    Write-Host "  • Compression automatique (.gz)" -ForegroundColor White
    Write-Host "  • Format structuré avec timestamps" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "✗ ÉCHEC DES TESTS" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    exit 1
}
