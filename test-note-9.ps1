# Script PowerShell pour tester le calculateur de la Note 9 - Réserves
# Date: 25 Avril 2026

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TEST NOTE 9 - RÉSERVES" -ForegroundColor Cyan
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

# Naviguer vers le dossier des scripts
$scriptDir = "py_backend/Doc calcul notes annexes/Scripts"
if (-not (Test-Path $scriptDir)) {
    Write-Host "✗ Dossier $scriptDir introuvable" -ForegroundColor Red
    exit 1
}

Write-Host "Navigation vers: $scriptDir" -ForegroundColor Yellow
Set-Location $scriptDir

Write-Host ""

# Exécuter le calculateur de la Note 9
Write-Host "Exécution du calculateur de la Note 9..." -ForegroundColor Yellow
Write-Host ""

python calculer_note_9.py

Write-Host ""

# Vérifier que les fichiers de sortie ont été créés
$htmlFile = "../Tests/test_note_9.html"
$traceFile = "../Tests/trace_note_9.json"

if (Test-Path $htmlFile) {
    Write-Host "✓ Fichier HTML créé: $htmlFile" -ForegroundColor Green
    $htmlSize = (Get-Item $htmlFile).Length
    Write-Host "  Taille: $htmlSize octets" -ForegroundColor Gray
} else {
    Write-Host "✗ Fichier HTML non créé: $htmlFile" -ForegroundColor Red
}

if (Test-Path $traceFile) {
    Write-Host "✓ Fichier de trace créé: $traceFile" -ForegroundColor Green
    $traceSize = (Get-Item $traceFile).Length
    Write-Host "  Taille: $traceSize octets" -ForegroundColor Gray
} else {
    Write-Host "✗ Fichier de trace non créé: $traceFile" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TEST TERMINÉ" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pour visualiser le résultat:" -ForegroundColor Yellow
Write-Host "  Ouvrir le fichier: py_backend/Doc calcul notes annexes/Tests/test_note_9.html" -ForegroundColor White
Write-Host ""

# Retourner au dossier racine
Set-Location ../../..
