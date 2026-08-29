# Test script for Note 19 - Produits Constatés d'Avance
# Quick test to verify the calculator works correctly

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST NOTE 19 - PRODUITS CONSTATES D'AVANCE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to the Scripts directory
$scriptDir = "py_backend/Doc calcul notes annexes/Scripts"
Set-Location $scriptDir

Write-Host "Executing calculer_note_19.py..." -ForegroundColor Yellow
python calculer_note_19.py

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Note 19 calculation completed successfully!" -ForegroundColor Green
    Write-Host ""
    
    # Check if HTML file was created
    $htmlFile = "../Tests/test_note_19.html"
    if (Test-Path $htmlFile) {
        Write-Host "✓ HTML file created: $htmlFile" -ForegroundColor Green
        
        # Open the HTML file in default browser
        Write-Host ""
        Write-Host "Opening HTML file in browser..." -ForegroundColor Yellow
        Start-Process $htmlFile
    } else {
        Write-Host "✗ HTML file not found!" -ForegroundColor Red
    }
    
    # Check if trace file was created
    $traceFile = "../Tests/trace_note_19.json"
    if (Test-Path $traceFile) {
        Write-Host "✓ Trace file created: $traceFile" -ForegroundColor Green
    } else {
        Write-Host "✗ Trace file not found!" -ForegroundColor Red
    }
} else {
    Write-Host ""
    Write-Host "✗ Note 19 calculation failed!" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST COMPLETE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Return to original directory
Set-Location ../../..
