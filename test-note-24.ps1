# Script de test pour la Note 24 - Services Extérieurs
# Date: 26 Avril 2026

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TEST NOTE 24 - SERVICES EXTÉRIEURS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier que Python est disponible
Write-Host "Vérification de Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ Python détecté: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Python n'est pas installé ou n'est pas dans le PATH" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Exécuter le calculateur de la Note 24
Write-Host "Exécution du calculateur Note 24..." -ForegroundColor Yellow
Write-Host ""

try {
    python "py_backend/Doc calcul notes annexes/Scripts/calculer_note_24.py"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "  ✓ TEST RÉUSSI" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Fichiers générés:" -ForegroundColor Cyan
        Write-Host "  - py_backend/Doc calcul notes annexes/Tests/test_note_24.html" -ForegroundColor White
        Write-Host "  - py_backend/Doc calcul notes annexes/Tests/note_24_trace.json" -ForegroundColor White
        Write-Host ""
        Write-Host "Pour visualiser le résultat:" -ForegroundColor Yellow
        Write-Host "  Ouvrir test_note_24.html dans un navigateur" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Red
        Write-Host "  ✗ TEST ÉCHOUÉ" -ForegroundColor Red
        Write-Host "========================================" -ForegroundColor Red
        Write-Host ""
        Write-Host "Code de sortie: $LASTEXITCODE" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  ✗ ERREUR D'EXÉCUTION" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Erreur: $_" -ForegroundColor Red
    exit 1
}
