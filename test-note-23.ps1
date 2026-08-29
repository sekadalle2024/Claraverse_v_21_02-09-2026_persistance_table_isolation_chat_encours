# Script PowerShell pour tester le calculateur de la Note 23 - Autres Achats
# Date: 26 Avril 2026

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TEST NOTE 23 - AUTRES ACHATS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
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

# Chemin vers le script
$scriptPath = "py_backend/Doc calcul notes annexes/Scripts/calculer_note_23.py"

# Vérifier que le script existe
if (-not (Test-Path $scriptPath)) {
    Write-Host "✗ Script non trouvé: $scriptPath" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Script trouvé: $scriptPath" -ForegroundColor Green
Write-Host ""

# Exécuter le calculateur
Write-Host "Exécution du calculateur Note 23..." -ForegroundColor Yellow
Write-Host ""

python $scriptPath

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TEST TERMINÉ" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier que le fichier HTML a été créé
$htmlPath = "py_backend/Doc calcul notes annexes/Tests/test_note_23.html"
if (Test-Path $htmlPath) {
    Write-Host "✓ Fichier HTML généré: $htmlPath" -ForegroundColor Green
    Write-Host ""
    Write-Host "Pour visualiser le résultat:" -ForegroundColor Yellow
    Write-Host "  start $htmlPath" -ForegroundColor White
} else {
    Write-Host "⚠ Fichier HTML non trouvé" -ForegroundColor Yellow
}

Write-Host ""
