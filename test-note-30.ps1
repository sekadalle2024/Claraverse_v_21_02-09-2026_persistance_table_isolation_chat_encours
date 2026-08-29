#!/usr/bin/env pwsh
# Script de test pour la Note 30 - Production Immobilisée

Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  TEST NOTE 30 - PRODUCTION IMMOBILISÉE" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Vérifier que Python est installé
Write-Host "Vérification de Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ Python détecté: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Python n'est pas installé ou n'est pas dans le PATH" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Vérifier que le fichier de balance existe
$balanceFile = "P000 -BALANCE DEMO N_N-1_N-2.xlsx"
Write-Host "Vérification du fichier de balance..." -ForegroundColor Yellow
if (Test-Path $balanceFile) {
    Write-Host "✓ Fichier de balance trouvé: $balanceFile" -ForegroundColor Green
} else {
    Write-Host "✗ Fichier de balance non trouvé: $balanceFile" -ForegroundColor Red
    Write-Host "  Assurez-vous que le fichier existe à la racine du projet" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Exécuter le script de calcul
Write-Host "Exécution du calcul de la Note 30..." -ForegroundColor Yellow
Write-Host ""

$scriptPath = "py_backend/Doc calcul notes annexes/Scripts/calculer_note_30.py"

try {
    python $scriptPath
    $exitCode = $LASTEXITCODE
    
    Write-Host ""
    
    if ($exitCode -eq 0) {
        Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Green
        Write-Host "  ✓ TEST RÉUSSI" -ForegroundColor Green
        Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Green
        Write-Host ""
        Write-Host "Fichiers générés:" -ForegroundColor Cyan
        Write-Host "  - HTML: py_backend/Doc calcul notes annexes/Tests/test_note_30.html" -ForegroundColor White
        Write-Host "  - Trace: py_backend/Doc calcul notes annexes/Tests/note_30_trace.json" -ForegroundColor White
        Write-Host ""
        Write-Host "Pour visualiser le résultat:" -ForegroundColor Yellow
        Write-Host "  Ouvrez le fichier HTML dans votre navigateur" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Red
        Write-Host "  ✗ TEST ÉCHOUÉ" -ForegroundColor Red
        Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Red
        Write-Host ""
        Write-Host "Code de sortie: $exitCode" -ForegroundColor Red
        exit $exitCode
    }
} catch {
    Write-Host ""
    Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Red
    Write-Host "  ✗ ERREUR LORS DE L'EXÉCUTION" -ForegroundColor Red
    Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Red
    Write-Host ""
    Write-Host "Erreur: $_" -ForegroundColor Red
    exit 1
}
