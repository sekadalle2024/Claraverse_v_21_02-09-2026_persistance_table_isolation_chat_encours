# Test script for Note 25 - Charges de Personnel
# Usage: .\test-note-25.ps1

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "TEST NOTE 25 - CHARGES DE PERSONNEL" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check if balance file exists
$balanceFile = "P000 -BALANCE DEMO N_N-1_N-2.xlsx"
if (-not (Test-Path $balanceFile)) {
    Write-Host "ERROR: Balance file not found: $balanceFile" -ForegroundColor Red
    Write-Host "Please ensure the file exists at the project root." -ForegroundColor Yellow
    exit 1
}

Write-Host "Balance file found: $balanceFile" -ForegroundColor Green
Write-Host ""

# Run the calculator
Write-Host "Running Note 25 calculator..." -ForegroundColor Yellow
Write-Host ""

python "py_backend/Doc calcul notes annexes/Scripts/calculer_note_25.py"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Green
    Write-Host "TEST COMPLETED SUCCESSFULLY" -ForegroundColor Green
    Write-Host "============================================" -ForegroundColor Green
    Write-Host ""
    
    $outputFile = "py_backend/Doc calcul notes annexes/Tests/test_note_25.html"
    if (Test-Path $outputFile) {
        Write-Host "Output file generated: $outputFile" -ForegroundColor Green
        Write-Host ""
        Write-Host "Opening in default browser..." -ForegroundColor Cyan
        Start-Process $outputFile
    }
} else {
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Red
    Write-Host "TEST FAILED" -ForegroundColor Red
    Write-Host "============================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please check the error messages above." -ForegroundColor Yellow
    exit 1
}
