# Script PowerShell pour tester le calcul de la Note 7 - Trésorerie Actif
# Date: 25 Avril 2026

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TEST NOTE 7 - TRÉSORERIE ACTIF" -ForegroundColor Cyan
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

# Chemin vers le script de calcul
$scriptPath = "py_backend/Doc calcul notes annexes/Scripts/calculer_note_7.py"

# Vérifier que le script existe
if (-not (Test-Path $scriptPath)) {
    Write-Host "✗ Script non trouvé: $scriptPath" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Script trouvé: $scriptPath" -ForegroundColor Green
Write-Host ""

# Exécuter le calcul de la Note 7
Write-Host "Exécution du calcul de la Note 7..." -ForegroundColor Yellow
Write-Host ""

python $scriptPath

# Vérifier le code de sortie
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ✓ TEST RÉUSSI" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    
    # Afficher les fichiers générés
    Write-Host "Fichiers générés:" -ForegroundColor Cyan
    
    $htmlFile = "py_backend/Doc calcul notes annexes/Tests/test_note_7.html"
    $traceFile = "py_backend/Doc calcul notes annexes/Tests/trace_note_7.json"
    
    if (Test-Path $htmlFile) {
        $htmlSize = (Get-Item $htmlFile).Length
        Write-Host "  ✓ $htmlFile ($htmlSize octets)" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $htmlFile (non trouvé)" -ForegroundColor Red
    }
    
    if (Test-Path $traceFile) {
        $traceSize = (Get-Item $traceFile).Length
        Write-Host "  ✓ $traceFile ($traceSize octets)" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $traceFile (non trouvé)" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "Pour visualiser le résultat, ouvrez:" -ForegroundColor Cyan
    Write-Host "  $htmlFile" -ForegroundColor White
    
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  ✗ TEST ÉCHOUÉ" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    exit 1
}
