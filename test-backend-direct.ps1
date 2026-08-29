# Test direct du backend sans passer par le frontend
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST DIRECT BACKEND" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Ce script teste si le backend répond correctement" -ForegroundColor Yellow
Write-Host ""

Write-Host "Test 1: Vérifier que le backend est accessible..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/docs" -Method GET -TimeoutSec 5
    Write-Host "✅ Backend accessible (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend NON accessible" -ForegroundColor Red
    Write-Host "   Erreur: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "SOLUTION: Démarrer le backend avec .\start-claraverse.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Test 2: Vérifier l'endpoint /etats-financiers..." -ForegroundColor Yellow
try {
    # Test simple de l'endpoint (sans fichier)
    $response = Invoke-WebRequest -Uri "http://localhost:5000/etats-financiers/process" -Method OPTIONS -TimeoutSec 5
    Write-Host "✅ Endpoint accessible" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Endpoint peut nécessiter des données" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DIAGNOSTIC" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Si le backend est accessible mais l'erreur persiste:" -ForegroundColor Yellow
Write-Host "1. Vérifier les logs du backend dans la console" -ForegroundColor Gray
Write-Host "2. Chercher les messages d'erreur Python" -ForegroundColor Gray
Write-Host "3. Vérifier que le fichier etats_financiers.py n'a pas d'erreur de syntaxe" -ForegroundColor Gray
Write-Host ""

Write-Host "Pour tester avec un fichier:" -ForegroundColor Yellow
Write-Host "  python py_backend/test_simple_problemes.py" -ForegroundColor Gray
Write-Host ""
