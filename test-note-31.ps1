# Script de test pour la Note 31 - Subventions d'Exploitation
# Date: 27 Avril 2026

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TEST NOTE 31 - SUBVENTIONS D'EXPLOITATION" -ForegroundColor Cyan
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

# Naviguer vers le dossier Scripts
$scriptDir = "py_backend/Doc calcul notes annexes/Scripts"
if (Test-Path $scriptDir) {
    Write-Host "Navigation vers: $scriptDir" -ForegroundColor Yellow
    Push-Location $scriptDir
} else {
    Write-Host "✗ Dossier Scripts introuvable: $scriptDir" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Exécuter le calculateur de la Note 31
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  EXÉCUTION DU CALCULATEUR NOTE 31" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

try {
    python calculer_note_31.py
    $exitCode = $LASTEXITCODE
    
    if ($exitCode -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "  ✓ CALCUL RÉUSSI" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Red
        Write-Host "  ✗ ERREUR LORS DU CALCUL" -ForegroundColor Red
        Write-Host "========================================" -ForegroundColor Red
        Pop-Location
        exit $exitCode
    }
} catch {
    Write-Host ""
    Write-Host "✗ Erreur lors de l'exécution: $_" -ForegroundColor Red
    Pop-Location
    exit 1
}

Write-Host ""

# Revenir au dossier initial
Pop-Location

# Vérifier les fichiers générés
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  VÉRIFICATION DES FICHIERS GÉNÉRÉS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$htmlFile = "py_backend/Doc calcul notes annexes/Tests/test_note_31.html"
$traceFile = "py_backend/Doc calcul notes annexes/Tests/note_31_trace.json"

if (Test-Path $htmlFile) {
    $htmlSize = (Get-Item $htmlFile).Length
    Write-Host "✓ Fichier HTML généré: $htmlFile ($htmlSize octets)" -ForegroundColor Green
} else {
    Write-Host "✗ Fichier HTML non trouvé: $htmlFile" -ForegroundColor Red
}

if (Test-Path $traceFile) {
    $traceSize = (Get-Item $traceFile).Length
    Write-Host "✓ Fichier trace généré: $traceFile ($traceSize octets)" -ForegroundColor Green
} else {
    Write-Host "✗ Fichier trace non trouvé: $traceFile" -ForegroundColor Red
}

Write-Host ""

# Proposer d'ouvrir le fichier HTML
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  OUVERTURE DU RÉSULTAT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if (Test-Path $htmlFile) {
    $response = Read-Host "Voulez-vous ouvrir le fichier HTML dans le navigateur? (O/N)"
    if ($response -eq "O" -or $response -eq "o") {
        Write-Host "Ouverture du fichier HTML..." -ForegroundColor Yellow
        Start-Process $htmlFile
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TEST TERMINÉ" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pour plus d'informations, consultez:" -ForegroundColor Yellow
Write-Host "  py_backend/Doc calcul notes annexes/Tests/QUICK_START_NOTE_31.md" -ForegroundColor White
Write-Host ""
