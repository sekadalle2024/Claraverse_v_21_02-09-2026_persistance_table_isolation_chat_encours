# Test script for Note 18 - Charges Constatées d'Avance
# This script tests the calculator for prepaid expenses

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST NOTE 18 - CHARGES CONSTATÉES D'AVANCE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to backend directory
Set-Location py_backend

Write-Host "Executing Note 18 calculator..." -ForegroundColor Yellow
python "Doc calcul notes annexes/Scripts/calculer_note_18.py"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Note 18 calculation completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Generated files:" -ForegroundColor Cyan
    Write-Host "  - HTML: Doc calcul notes annexes/Tests/test_note_18.html" -ForegroundColor White
    Write-Host "  - Trace: Doc calcul notes annexes/Tests/trace_note_18.json" -ForegroundColor White
    Write-Host ""
    
    # Check if files exist
    if (Test-Path "Doc calcul notes annexes/Tests/test_note_18.html") {
        Write-Host "✓ HTML file created" -ForegroundColor Green
    }
    if (Test-Path "Doc calcul notes annexes/Tests/trace_note_18.json") {
        Write-Host "✓ Trace file created" -ForegroundColor Green
    }
} else {
    Write-Host ""
    Write-Host "✗ Note 18 calculation failed!" -ForegroundColor Red
    Write-Host "Please check the error messages above." -ForegroundColor Yellow
}

# Return to root directory
Set-Location ..

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST COMPLETED" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
