# Script de test pour la Note 20 - Écarts de Conversion Passif
# Usage: .\test-note-20.ps1

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  TEST NOTE 20 - ÉCARTS DE CONVERSION PASSIF" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Vérifier que Python est disponible
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Python n'est pas installé ou pas dans le PATH" -ForegroundColor Red
    exit 1
}

# Chemin vers le script
$scriptPath = "py_backend/Doc calcul notes annexes/Scripts/calculer_note_20.py"

# Vérifier que le script existe
if (-not (Test-Path $scriptPath)) {
    Write-Host "❌ Script non trouvé: $scriptPath" -ForegroundColor Red
    exit 1
}

Write-Host "📂 Exécution du calculateur Note 20..." -ForegroundColor Yellow
Write-Host ""

# Exécuter le script Python
python $scriptPath

# Vérifier le code de sortie
if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Test réussi!" -ForegroundColor Green
    
    # Afficher les fichiers générés
    Write-Host "`n📄 Fichiers générés:" -ForegroundColor Cyan
    
    $htmlFile = "py_backend/Doc calcul notes annexes/Tests/test_note_20.html"
    $traceFile = "py_backend/Doc calcul notes annexes/Tests/trace_note_20.json"
    
    if (Test-Path $htmlFile) {
        Write-Host "  ✓ $htmlFile" -ForegroundColor Green
        $htmlSize = (Get-Item $htmlFile).Length
        Write-Host "    Taille: $htmlSize octets" -ForegroundColor Gray
    }
    
    if (Test-Path $traceFile) {
        Write-Host "  ✓ $traceFile" -ForegroundColor Green
        $traceSize = (Get-Item $traceFile).Length
        Write-Host "    Taille: $traceSize octets" -ForegroundColor Gray
    }
    
    Write-Host "`n💡 Pour voir le résultat:" -ForegroundColor Yellow
    Write-Host "   Ouvrir: $htmlFile" -ForegroundColor White
    
} else {
    Write-Host "`n❌ Test échoué (code: $LASTEXITCODE)" -ForegroundColor Red
    exit 1
}

Write-Host ""
