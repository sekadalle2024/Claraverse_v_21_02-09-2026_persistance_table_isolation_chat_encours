# Script de test pour Note 32 - Reprises de Provisions
# Ce script teste le calculateur de la Note 32

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TEST NOTE 32 - REPRISES DE PROVISIONS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier que Python est installé
Write-Host "Vérification de Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ Python trouvé: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Python n'est pas installé ou n'est pas dans le PATH" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Exécuter le calculateur Note 32
Write-Host "Exécution du calculateur Note 32..." -ForegroundColor Yellow
Write-Host ""

try {
    python "py_backend/Doc calcul notes annexes/Scripts/calculer_note_32.py"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "  ✓ TEST NOTE 32 RÉUSSI" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Fichiers générés:" -ForegroundColor Cyan
        Write-Host "  - py_backend/Doc calcul notes annexes/Tests/test_note_32.html" -ForegroundColor White
        Write-Host "  - py_backend/Doc calcul notes annexes/Tests/trace_note_32.json" -ForegroundColor White
        Write-Host ""
        Write-Host "Ouvrez test_note_32.html dans un navigateur pour voir le résultat." -ForegroundColor Yellow
    } else {
        Write-Host ""
        Write-Host "✗ Le test a échoué avec le code: $LASTEXITCODE" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "✗ Erreur lors de l'exécution: $_" -ForegroundColor Red
    exit 1
}
